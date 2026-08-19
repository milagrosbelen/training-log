<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exercise;
use App\Models\Workout;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File;

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
            'notes' => ['nullable', 'string', 'max:500'],
            'image' => ['nullable', File::image()->max(2048)],
        ]);

        $workout = Workout::findOrFail($validated['workout_id']);

        if ($workout->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'No autorizado para agregar ejercicios a este entrenamiento',
            ], 403);
        }

        $payload = [
            'name' => $validated['name'],
            'weight' => $validated['weight'] ?? null,
            'reps' => $validated['reps'] ?? null,
            'sets' => $validated['sets'] ?? 1,
            'order' => $validated['order'] ?? $workout->exercises()->max('order') + 1,
            'notes' => $validated['notes'] ?? null,
        ];

        if ($request->hasFile('image')) {
            $payload['image'] = $request->file('image')->store('exercise-images', 'public');
        }

        $exercise = $workout->exercises()->create($payload);

        return response()->json([
            'message' => 'Ejercicio creado correctamente',
            'data' => $exercise->fresh(),
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
            'notes' => ['nullable', 'string', 'max:500'],
            'image' => ['nullable', File::image()->max(2048)],
            'remove_image' => ['nullable', 'boolean'],
        ]);

        if ($request->boolean('remove_image')) {
            if ($exercise->image) {
                Storage::disk('public')->delete($exercise->image);
                $exercise->image = null;
            }
        }

        if ($request->hasFile('image')) {
            if ($exercise->image) {
                Storage::disk('public')->delete($exercise->image);
            }
            $exercise->image = $request->file('image')->store('exercise-images', 'public');
        }

        $exercise->fill($validated);
        $exercise->save();

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

        if ($exercise->image) {
            Storage::disk('public')->delete($exercise->image);
        }

        $exercise->delete();

        return response()->json([
            'message' => 'Ejercicio eliminado correctamente',
        ]);
    }
}
