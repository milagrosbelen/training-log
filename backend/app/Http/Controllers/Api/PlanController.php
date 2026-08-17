<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    public function mine(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isCoach()) {
            return response()->json([
                'message' => 'El coach gestiona los planes de las alumnas.',
                'data' => null,
            ]);
        }

        try {
            $plan = $user->assignedPlan()->with(['user', 'completions'])->first();

            if (!$plan) {
                return response()->json([
                    'message' => 'Todavía no tenés un plan asignado.',
                    'data' => null,
                ]);
            }

            return response()->json([
                'data' => $this->toPayload($plan),
            ]);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Todavía no tenés un plan asignado.',
                'data' => null,
            ]);
        }
    }

    public function clients(Request $request): JsonResponse
    {
        $coach = $request->user();
        $clients = $coach->alumnas()
            ->where('role', User::ROLE_CLIENT)
            ->orderBy('name')
            ->get();

        $planUserIds = Plan::query()
            ->whereIn('user_id', $clients->pluck('id'))
            ->pluck('user_id')
            ->all();

        return response()->json([
            'data' => $clients->map(fn (User $client) => [
                'id' => $client->id,
                'name' => $client->name,
                'username' => $client->username,
                'email' => $client->email,
                'is_active' => (bool) $client->is_active,
                'training_type' => $client->training_type ?: User::TRAINING_GYM,
                'has_plan' => in_array($client->id, $planUserIds, true),
            ]),
        ]);
    }

    private function assertOwnsAlumna(Request $request, User $user): ?JsonResponse
    {
        if (!$request->user()->ownsAlumna($user)) {
            return response()->json([
                'message' => 'No podés gestionar el plan de esa alumna.',
            ], 403);
        }

        return null;
    }

    public function showForUser(Request $request, User $user): JsonResponse
    {
        if ($denied = $this->assertOwnsAlumna($request, $user)) {
            return $denied;
        }

        if ($user->isCoach()) {
            return response()->json([
                'message' => 'No se puede asignar un plan a una cuenta coach.',
            ], 422);
        }

        $plan = $user->assignedPlan()->with(['user', 'coach', 'completions'])->first();

        return response()->json([
            'data' => $plan ? $this->toPayload($plan) : null,
        ]);
    }

    public function upsertForUser(Request $request, User $user): JsonResponse
    {
        if ($denied = $this->assertOwnsAlumna($request, $user)) {
            return $denied;
        }

        $validated = $request->validate([
            'week_current' => ['required', 'integer', 'min:1', 'max:52'],
            'week_total' => ['required', 'integer', 'min:1', 'max:52'],
            'days_per_week' => ['required', 'integer', 'min:1', 'max:7'],
            'objective' => ['required', 'string', 'max:200'],
            'sessions' => ['required', 'array'],
            'sessions.*.weekday' => ['required', 'integer', 'min:0', 'max:6'],
            'sessions.*.day_number' => ['required', 'integer', 'min:1'],
            'sessions.*.title' => ['required', 'string', 'max:100'],
            'sessions.*.exercises' => ['nullable', 'array'],
            'sessions.*.exercises.*.name' => ['required', 'string', 'max:255'],
            'sessions.*.exercises.*.sets' => ['required', 'integer', 'min:1', 'max:50'],
            'sessions.*.exercises.*.reps' => ['required', 'max:50'],
            'sessions.*.exercises.*.rest_seconds' => ['nullable', 'integer', 'min:0', 'max:600'],
            'sessions.*.exercises.*.tip' => ['nullable', 'string', 'max:500'],
            'sessions.*.exercises.*.muscle' => ['nullable', 'string', 'max:100'],
        ], [
            'week_current.required' => 'Indicá la semana actual.',
            'week_total.required' => 'Indicá el total de semanas.',
            'days_per_week.required' => 'Indicá cuántos días va a entrenar.',
            'objective.required' => 'Indicá el objetivo del plan.',
            'sessions.required' => 'Cargá al menos la estructura de la semana.',
        ]);

        if ($validated['week_current'] > $validated['week_total']) {
            return response()->json([
                'message' => 'La semana actual no puede ser mayor al total de semanas.',
            ], 422);
        }

        $sessions = $this->normalizeSessions($validated['sessions']);

        if (count($sessions) > $validated['days_per_week']) {
            return response()->json([
                'message' => 'Hay más sesiones que días de entrenamiento. Ajustá la cantidad de días o quitá un día.',
            ], 422);
        }

        $plan = Plan::updateOrCreate(
            ['user_id' => $user->id],
            [
                'coach_id' => $request->user()->id,
                'week_current' => $validated['week_current'],
                'week_total' => $validated['week_total'],
                'days_per_week' => $validated['days_per_week'],
                'objective' => trim($validated['objective']),
                'sessions' => $sessions,
            ]
        );

        $plan->load(['user', 'coach', 'completions']);

        return response()->json([
            'message' => 'Plan guardado correctamente.',
            'data' => $this->toPayload($plan),
        ]);
    }

    public function destroyForUser(Request $request, User $user): JsonResponse
    {
        if ($denied = $this->assertOwnsAlumna($request, $user)) {
            return $denied;
        }

        $plan = $user->assignedPlan;

        if (!$plan) {
            return response()->json([
                'message' => 'Esa alumna no tiene un plan asignado.',
            ], 404);
        }

        $plan->delete();

        return response()->json([
            'message' => 'Plan eliminado correctamente.',
        ]);
    }

    public function progress(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isCoach()) {
            return response()->json([
                'message' => 'El coach no registra progreso sobre un plan propio.',
            ], 403);
        }

        $plan = $user->assignedPlan;

        if (!$plan) {
            return response()->json([
                'message' => 'Todavía no tenés un plan asignado.',
            ], 404);
        }

        $validated = $request->validate([
            'weekday' => ['required', 'integer', 'min:0', 'max:6'],
            'completed_exercises' => ['required', 'array'],
            'completed_exercises.*' => ['integer', 'min:0'],
        ]);

        $session = collect($plan->sessions ?? [])->firstWhere('weekday', $validated['weekday']);

        if (!$session) {
            return response()->json([
                'message' => 'Ese día no tiene una sesión asignada.',
            ], 422);
        }

        $exerciseCount = count($session['exercises'] ?? []);
        $completed = collect($validated['completed_exercises'])
            ->unique()
            ->filter(fn ($index) => $index >= 0 && $index < $exerciseCount)
            ->values()
            ->all();

        $plan->completions()->updateOrCreate(
            [
                'week_number' => $plan->week_current,
                'weekday' => $validated['weekday'],
            ],
            [
                'completed_exercises' => $completed,
            ]
        );

        $plan->load(['user', 'coach', 'completions']);

        return response()->json([
            'message' => 'Progreso actualizado.',
            'data' => $this->toPayload($plan),
        ]);
    }

    private function normalizeSessions(array $sessions): array
    {
        return collect($sessions)
            ->map(function (array $session) {
                $exercises = collect($session['exercises'] ?? [])
                    ->map(fn (array $exercise) => [
                        'name' => trim($exercise['name']),
                        'sets' => (int) $exercise['sets'],
                        'reps' => trim((string) $exercise['reps']),
                        'rest_seconds' => isset($exercise['rest_seconds']) ? (int) $exercise['rest_seconds'] : 90,
                        'tip' => trim((string) ($exercise['tip'] ?? '')),
                        'muscle' => trim((string) ($exercise['muscle'] ?? '')),
                    ])
                    ->filter(fn (array $exercise) => $exercise['name'] !== '')
                    ->values()
                    ->all();

                return [
                    'weekday' => (int) $session['weekday'],
                    'day_number' => (int) $session['day_number'],
                    'title' => trim($session['title']),
                    'exercises' => $exercises,
                ];
            })
            ->sortBy('weekday')
            ->values()
            ->all();
    }

    private function toPayload(Plan $plan): array
    {
        $sessions = is_array($plan->sessions) ? $plan->sessions : [];
        $weekCompletions = collect($plan->completions ?? [])
            ->where('week_number', $plan->week_current)
            ->keyBy('weekday');

        $trainedWeekdays = [];
        $progressByWeekday = [];

        foreach ($sessions as $session) {
            if (!is_array($session) || !array_key_exists('weekday', $session)) {
                continue;
            }

            $weekday = (int) $session['weekday'];
            $total = count($session['exercises'] ?? []);
            $completed = $weekCompletions->get($weekday)?->completed_exercises ?? [];
            $doneCount = count($completed);
            $progressByWeekday[$weekday] = [
                'completed' => $doneCount,
                'total' => $total,
                'indexes' => array_values($completed),
            ];

            if ($total > 0 && $doneCount >= $total) {
                $trainedWeekdays[] = $weekday;
            }
        }

        $trainedDates = collect($plan->completions ?? [])
            ->filter(function ($completion) use ($sessions) {
                $session = collect($sessions)->first(function ($item) use ($completion) {
                    return is_array($item)
                        && (int) ($item['weekday'] ?? -1) === (int) $completion->weekday;
                });
                $total = count(is_array($session) ? ($session['exercises'] ?? []) : []);
                $done = count($completion->completed_exercises ?? []);

                return $total > 0 && $done >= $total;
            })
            ->map(fn ($completion) => $completion->updated_at?->toDateString())
            ->filter()
            ->unique()
            ->values()
            ->all();

        return [
            'id' => $plan->id,
            'user_id' => $plan->user_id,
            'user_name' => $plan->user?->name,
            'training_type' => $plan->user?->training_type ?: User::TRAINING_GYM,
            'coach_name' => $plan->coach?->name,
            'week_current' => $plan->week_current,
            'week_total' => $plan->week_total,
            'days_per_week' => $plan->days_per_week ?? count($sessions),
            'objective' => $plan->objective,
            'sessions' => $sessions,
            'trained_weekdays' => $trainedWeekdays,
            'trained_dates' => $trainedDates,
            'progress_by_weekday' => $progressByWeekday,
        ];
    }
}
