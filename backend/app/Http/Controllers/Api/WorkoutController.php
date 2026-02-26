<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Workout;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkoutController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $workouts = $request->user()
            ->workouts()
            ->with('exercises')
            ->orderBy('date', 'desc')
            ->get();

        return response()->json([
            'data' => $workouts,
        ]);
    }

    public function showByDate(Request $request, string $date): JsonResponse
    {
        $validated = validator(['date' => $date], [
            'date' => ['required', 'date_format:Y-m-d'],
        ])->validate();

        $workout = $request->user()
            ->workouts()
            ->with('exercises')
            ->where('date', $validated['date'])
            ->first();

        if (!$workout) {
            return response()->json([
                'message' => 'No se encontró entrenamiento para la fecha indicada',
            ], 404);
        }

        return response()->json([
            'data' => $workout,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'type' => ['required', 'string', 'max:255'],
            'duration' => ['nullable', 'integer', 'min:0'],
            'exercises' => ['nullable', 'array'],
            'exercises.*.name' => ['nullable', 'string', 'max:255'],
            'exercises.*.weight' => ['nullable', 'numeric', 'min:0'],
            'exercises.*.reps' => ['nullable', 'integer', 'min:0'],
            'exercises.*.sets' => ['nullable', 'integer', 'min:1'],
            'exercises.*.order' => ['nullable', 'integer', 'min:0'],
        ]);

        $workout = $request->user()
            ->workouts()
            ->updateOrCreate(
                ['date' => $validated['date']],
                [
                    'type' => $validated['type'],
                    'duration' => $validated['duration'] ?? 0,
                ]
            );

        if (isset($validated['exercises'])) {
            $workout->exercises()->delete();
            foreach ($validated['exercises'] as $i => $ex) {
                $name = trim($ex['name'] ?? '');
                if ($name === '') continue;
                $workout->exercises()->create([
                    'name' => $name,
                    'weight' => isset($ex['weight']) && $ex['weight'] !== '' ? $ex['weight'] : null,
                    'reps' => isset($ex['reps']) && $ex['reps'] !== '' ? $ex['reps'] : null,
                    'sets' => $ex['sets'] ?? 1,
                    'order' => $ex['order'] ?? $i,
                ]);
            }
        }

        $workout->load('exercises');

        return response()->json([
            'message' => $workout->wasRecentlyCreated ? 'Entrenamiento creado correctamente' : 'Entrenamiento actualizado correctamente',
            'data' => $workout,
        ], $workout->wasRecentlyCreated ? 201 : 200);
    }

    public function destroy(Request $request, Workout $workout): JsonResponse
    {
        if ($workout->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'No autorizado para eliminar este entrenamiento',
            ], 403);
        }

        $workout->delete();

        return response()->json([
            'message' => 'Entrenamiento eliminado correctamente',
        ]);
    }
}
