<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FocusAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File;

class ProfileController extends Controller
{
    /**
     * Devuelve el perfil del usuario con resumen optimizado en una sola consulta principal.
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        // Estadísticas agregadas en una sola consulta
        $stats = DB::table('workouts')
            ->where('user_id', $user->id)
            ->selectRaw('COUNT(*) as total_workouts, COALESCE(SUM(duration), 0) as total_duration')
            ->first();

        // Último entrenamiento
        $lastWorkout = $user->workouts()
            ->orderBy('date', 'desc')
            ->first(['date', 'type', 'duration']);

        // Tipo más frecuente
        $mostFrequent = $user->workouts()
            ->select('type')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('type')
            ->orderByDesc('count')
            ->first();

        // Historial ordenado por fecha descendente (limitado para performance)
        $history = $user->workouts()
            ->orderBy('date', 'desc')
            ->limit(100)
            ->get(['date', 'type', 'duration']);

        $focusAnalytics = FocusAnalyticsService::computeFocusAnalytics($user);

        return response()->json([
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar_url' => $user->avatar ? Storage::url($user->avatar) : null,
                    'focus' => $user->focus,
                    'created_at' => $user->created_at?->format('c'),
                ],
                'total_workouts' => (int) ($stats->total_workouts ?? 0),
                'total_duration' => (int) ($stats->total_duration ?? 0),
                'last_workout' => $lastWorkout ? [
                    'date' => $lastWorkout->date?->format('Y-m-d'),
                    'type' => $lastWorkout->type,
                    'duration' => (int) $lastWorkout->duration,
                ] : null,
                'most_frequent_type' => $mostFrequent?->type ?? null,
                'history' => $history->map(fn ($w) => [
                    'date' => $w->date?->format('Y-m-d'),
                    'type' => $w->type,
                    'duration' => (int) $w->duration,
                ]),
                'focus_analytics' => $focusAnalytics,
            ],
        ]);
    }

    public function updateFocus(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'focus' => ['nullable', 'string', 'max:100'],
        ]);

        $user = $request->user();
        $user->focus = isset($validated['focus']) ? trim($validated['focus']) : null;
        $user->save();

        return response()->json([
            'message' => 'Foco actualizado',
            'data' => ['focus' => $user->focus],
        ]);
    }

    public function getFocus(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json([
            'data' => ['focus' => $user->focus],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'avatar' => ['nullable', File::image()->max(2048)],
        ]);

        $user = $request->user();
        $user->name = $validated['name'];

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
        }

        $user->save();

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar_url' => $user->avatar ? Storage::url($user->avatar) : null,
                    'created_at' => $user->created_at?->format('c'),
                ],
            ],
        ]);
    }
}
