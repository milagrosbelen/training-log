<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exercise;
use App\Models\Workout;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExerciseController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'workout_id' => ['required', 'integer', 'exists:workouts,id'],
            'name' => ['required', 'string', 'max:255'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'reps' => ['nullable', 'integer', 'min:0'],
            'sets' => ['nullable', 'integer', 'min:1'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        $workout = Workout::findOrFail($validated['workout_id']);

        if ($workout->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'No autorizado para agregar ejercicios a este entrenamiento',
            ], 403);
        }

        $exercise = $workout->exercises()->create([
            'name' => $validated['name'],
            'weight' => $validated['weight'] ?? null,
            'reps' => $validated['reps'] ?? null,
            'sets' => $validated['sets'] ?? 1,
            'order' => $validated['order'] ?? $workout->exercises()->max('order') + 1,
        ]);

        return response()->json([
            'message' => 'Ejercicio creado correctamente',
            'data' => $exercise,
        ], 201);
    }

    public function update(Request $request, Exercise $exercise): JsonResponse
    {
        if ($exercise->workout->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'No autorizado para actualizar este ejercicio',
            ], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'reps' => ['nullable', 'integer', 'min:0'],
            'sets' => ['nullable', 'integer', 'min:1'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        $exercise->update($validated);

        return response()->json([
            'message' => 'Ejercicio actualizado correctamente',
            'data' => $exercise->fresh(),
        ]);
    }

    public function destroy(Request $request, Exercise $exercise): JsonResponse
    {
        if ($exercise->workout->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'No autorizado para eliminar este ejercicio',
            ], 403);
        }

        $exercise->delete();

        return response()->json([
            'message' => 'Ejercicio eliminado correctamente',
        ]);
    }
}
