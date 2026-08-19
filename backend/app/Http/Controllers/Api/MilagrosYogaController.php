<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\YogaExercise;
use App\Models\YogaExerciseStage;
use App\Models\YogaProgressAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File;

class MilagrosYogaController extends Controller
{
    public function indexForUser(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isMilagros()) {
            return response()->json([
                'data' => ['items' => []],
            ]);
        }

        $exercises = YogaExercise::with(['stages', 'attempts'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => [
                'items' => $exercises->map(fn (YogaExercise $exercise) => $this->serializeExercise($exercise))->values()->all(),
            ],
        ]);
    }

    public function libraryForCoach(Request $request): JsonResponse
    {
        $targetUser = User::findOrFail($request->integer('user_id'));

        if (!$request->user()->ownsAlumna($targetUser) || !$targetUser->isMilagros()) {
            return response()->json(['message' => 'La biblioteca solo está disponible para Milagros.'], 403);
        }

        $exercises = YogaExercise::with('stages')
            ->where('user_id', $targetUser->id)
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $exercises->map(fn (YogaExercise $exercise) => [
                'id' => $exercise->id,
                'name' => $exercise->name,
                'description' => $exercise->description,
                'image_url' => $exercise->image_url,
                'stages' => $exercise->stages->map(fn ($stage) => [
                    'id' => $stage->id,
                    'sort_order' => $stage->sort_order,
                    'title' => $stage->title,
                    'description' => $stage->description,
                ])->values()->all(),
            ])->values()->all(),
        ]);
    }

    public function storeExercise(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'image' => ['nullable', File::image()->max(10240)],
            'stages' => ['required', 'array', 'min:1'],
            'stages.*.title' => ['required', 'string', 'max:255'],
            'stages.*.description' => ['nullable', 'string', 'max:1000'],
        ]);

        $targetUser = User::findOrFail($validated['user_id']);
        if (!$targetUser->isMilagros()) {
            return response()->json([
                'message' => 'La progresión de poses solo está disponible para Milagros.',
            ], 422);
        }

        $exercise = YogaExercise::create([
            'user_id' => $targetUser->id,
            'name' => trim($validated['name']),
            'description' => trim((string) ($validated['description'] ?? '')) ?: null,
        ]);

        if ($request->hasFile('image')) {
            $exercise->image = $request->file('image')->store('yoga-exercise-images', 'public');
            $exercise->save();
        }

        $stagePayload = collect($validated['stages'])
            ->values()
            ->map(fn (array $stage, int $index) => [
                'exercise_id' => $exercise->id,
                'sort_order' => $index + 1,
                'title' => trim((string) ($stage['title'] ?? '')),
                'description' => trim((string) ($stage['description'] ?? '')) ?: null,
            ])
            ->filter(fn (array $stage) => $stage['title'] !== '')
            ->all();

        if ($stagePayload !== []) {
            YogaExerciseStage::insert($stagePayload);
        }

        return response()->json([
            'message' => 'Pose creada correctamente.',
            'data' => $exercise->fresh()->load(['stages', 'attempts']),
        ], 201);
    }

    public function updateExercise(Request $request, YogaExercise $yogaExercise): JsonResponse
    {
        $targetUser = $yogaExercise->user;
        if (!$targetUser || !$targetUser->isMilagros() || !$request->user()->ownsAlumna($targetUser)) {
            return response()->json(['message' => 'No podés editar esta pose.'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'image' => ['nullable', File::image()->max(10240)],
            'stages' => ['required', 'array', 'min:1'],
            'stages.*.title' => ['required', 'string', 'max:255'],
            'stages.*.description' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($request, $validated, $yogaExercise) {
            $yogaExercise->update([
                'name' => trim($validated['name']),
                'description' => trim((string) ($validated['description'] ?? '')) ?: null,
            ]);

            if ($request->hasFile('image')) {
                if ($yogaExercise->image) {
                    Storage::disk('public')->delete($yogaExercise->image);
                }
                $yogaExercise->image = $request->file('image')->store('yoga-exercise-images', 'public');
                $yogaExercise->save();
            }

            $yogaExercise->stages()->delete();
            $yogaExercise->stages()->createMany(
                collect($validated['stages'])->values()->map(fn (array $stage, int $index) => [
                    'sort_order' => $index + 1,
                    'title' => trim($stage['title']),
                    'description' => trim((string) ($stage['description'] ?? '')) ?: null,
                ])->all()
            );
        });

        return response()->json([
            'message' => 'Pose actualizada correctamente.',
            'data' => $yogaExercise->fresh()->load('stages'),
        ]);
    }

    public function storeAttempt(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'exercise_id' => ['required', 'integer', 'exists:yoga_exercises,id'],
            'reached_stage' => ['required', 'integer', 'min:0'],
            'deep_breathing_done' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $user = $request->user();
        $exercise = YogaExercise::with('stages')->findOrFail($validated['exercise_id']);

        if ($exercise->user_id !== $user->id || !$user->isMilagros()) {
            return response()->json([
                'message' => 'No puedes registrar progreso para esta pose.',
            ], 403);
        }

        $stageCount = $exercise->stages->count();
        $reachedStage = max(0, min((int) $validated['reached_stage'], $stageCount));
        $deepBreathingDone = (bool) ($validated['deep_breathing_done'] ?? false);

        $attempt = YogaProgressAttempt::create([
            'user_id' => $user->id,
            'exercise_id' => $exercise->id,
            'reached_stage' => $reachedStage,
            'deep_breathing_done' => $deepBreathingDone,
            'notes' => trim((string) ($validated['notes'] ?? '')) ?: null,
            'recorded_at' => now(),
        ]);

        return response()->json([
            'message' => 'Registro guardado correctamente.',
            'data' => [
                'id' => $attempt->id,
                'exercise_id' => $exercise->id,
                'reached_stage' => $reachedStage,
                'deep_breathing_done' => $deepBreathingDone,
                'mastered' => $deepBreathingDone && $reachedStage >= $stageCount && $stageCount > 0,
                'recorded_at' => $attempt->recorded_at?->format('Y-m-d'),
            ],
        ], 201);
    }

    public function storeQuickPractice(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isMilagros()) {
            return response()->json(['message' => 'El registro rápido solo está disponible para Milagros.'], 403);
        }

        $validated = $request->validate([
            'exercise_id' => ['nullable', 'integer', 'exists:yoga_exercises,id'],
            'name' => ['required_without:exercise_id', 'nullable', 'string', 'max:255'],
            'reached_stage' => ['nullable', 'integer', 'min:0'],
            'deep_breathing_done' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $exercise = !empty($validated['exercise_id'])
            ? YogaExercise::with('stages')->where('user_id', $user->id)->findOrFail($validated['exercise_id'])
            : null;

        if (!$exercise) {
            $exercise = YogaExercise::create([
                'user_id' => $user->id,
                'name' => trim((string) $validated['name']),
            ]);
            $exercise->stages()->create([
                'sort_order' => 1,
                'title' => 'Práctica inicial',
                'description' => 'Registrar cómo se sintió la pose.',
            ]);
            $exercise->load('stages');
        }

        $stageCount = $exercise->stages->count();
        $reachedStage = max(0, min((int) ($validated['reached_stage'] ?? 0), $stageCount));
        $deepBreathingDone = (bool) ($validated['deep_breathing_done'] ?? false);

        $attempt = YogaProgressAttempt::create([
            'user_id' => $user->id,
            'exercise_id' => $exercise->id,
            'reached_stage' => $reachedStage,
            'deep_breathing_done' => $deepBreathingDone,
            'notes' => trim((string) ($validated['notes'] ?? '')) ?: null,
            'recorded_at' => now(),
        ]);

        return response()->json([
            'message' => 'Práctica de hoy guardada.',
            'data' => [
                'exercise_id' => $exercise->id,
                'name' => $exercise->name,
                'reached_stage' => $reachedStage,
                'deep_breathing_done' => $deepBreathingDone,
                'recorded_at' => $attempt->recorded_at?->format('Y-m-d'),
            ],
        ], 201);
    }

    protected function serializeExercise(YogaExercise $exercise): array
    {
        $stages = $exercise->stages ?? collect();
        $attempts = $exercise->attempts ?? collect();
        $latest = $attempts->sortByDesc('recorded_at')->first();
        $reachedStage = (int) ($latest?->reached_stage ?? 0);
        $deepBreathingDone = (bool) ($latest?->deep_breathing_done ?? false);
        $stageCount = $stages->count();
        $mastered = $stageCount > 0 && $reachedStage >= $stageCount && $deepBreathingDone;

        return [
            'id' => $exercise->id,
            'name' => $exercise->name,
            'description' => $exercise->description,
            'image_url' => $exercise->image_url,
            'stage_count' => $stageCount,
            'reached_stage' => $reachedStage,
            'deep_breathing_done' => $deepBreathingDone,
            'mastered' => $mastered,
            'status' => $mastered ? 'dominada' : ($reachedStage > 0 ? 'en_progreso' : 'nueva'),
            'last_attempt' => $latest ? [
                'reached_stage' => $latest->reached_stage,
                'deep_breathing_done' => (bool) $latest->deep_breathing_done,
                'recorded_at' => $latest->recorded_at?->format('Y-m-d'),
                'notes' => $latest->notes,
            ] : null,
            'stages' => $stages->map(fn ($stage) => [
                'id' => $stage->id,
                'sort_order' => $stage->sort_order,
                'title' => $stage->title,
                'description' => $stage->description,
            ])->values()->all(),
            'history' => $attempts->map(fn ($attempt) => [
                'id' => $attempt->id,
                'reached_stage' => $attempt->reached_stage,
                'deep_breathing_done' => (bool) $attempt->deep_breathing_done,
                'recorded_at' => $attempt->recorded_at?->format('Y-m-d'),
                'notes' => $attempt->notes,
            ])->values()->all(),
        ];
    }
}
