<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\User;
use App\Services\CoachRosterService;
use App\Services\PlanAssembler;
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
            $payload = PlanAssembler::payloadForUser($user);

            if (!$payload) {
                return response()->json([
                    'message' => 'Todavía no tenés un plan asignado.',
                    'data' => null,
                ]);
            }

            return response()->json([
                'data' => $payload,
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
        return response()->json([
            'data' => CoachRosterService::alumnasFor($request->user()),
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

        return response()->json([
            'data' => PlanAssembler::payloadForUser($user),
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

        return response()->json([
            'message' => 'Plan guardado correctamente.',
            'data' => PlanAssembler::payloadForUser($user),
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

        return response()->json([
            'message' => 'Progreso actualizado.',
            'data' => PlanAssembler::payloadForUser($user),
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

}
