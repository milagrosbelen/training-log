<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ProfileAssembler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File;

class ProfileController extends Controller
{
    /**
     * Devuelve el perfil del usuario con resumen optimizado en una sola consulta principal.
     */
    public function summary(Request $request): JsonResponse
    {
        return response()->json([
            'data' => ProfileAssembler::summary($request->user()),
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

    public function getPoses(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => [
                'pose_progress' => $this->normalizePoseProgress($user->pose_progress),
            ],
        ]);
    }

    public function updatePoses(Request $request): JsonResponse
    {
        $payload = $request->input('pose_progress', []);
        if (!is_array($payload)) {
            return response()->json([
                'message' => 'Progreso de poses inválido.',
            ], 422);
        }

        $user = $request->user();
        $user->pose_progress = $this->normalizePoseProgress($payload);
        $user->save();

        return response()->json([
            'message' => 'Progreso de poses actualizado.',
            'data' => [
                'pose_progress' => $user->pose_progress,
            ],
        ]);
    }

    private function normalizePoseProgress(mixed $payload): array
    {
        if (!is_array($payload)) {
            return [];
        }

        $allowed = ['vi', 'aprendiendo', 'apoyo', 'sale', 'domino'];
        $clean = [];

        foreach ($payload as $id => $value) {
            $key = is_string($id) ? trim($id) : '';
            if ($key === '' || strlen($key) > 80) {
                continue;
            }

            $status = is_array($value) ? ($value['status'] ?? '') : $value;
            $status = $status === 'bien' ? 'domino' : $status;
            if (!is_string($status) || !in_array($status, $allowed, true)) {
                continue;
            }

            $entry = ['status' => $status];
            if (is_array($value)) {
                $practiced = trim((string) ($value['last_practiced'] ?? ''));
                if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $practiced)) {
                    $entry['last_practiced'] = $practiced;
                }
                $name = trim((string) ($value['name'] ?? ''));
                if ($name !== '') {
                    $entry['name'] = mb_substr($name, 0, 80);
                }
                $spanish = trim((string) ($value['spanish'] ?? ''));
                if ($spanish !== '') {
                    $entry['spanish'] = mb_substr($spanish, 0, 80);
                }
                $source = trim((string) ($value['source'] ?? ''));
                if (in_array($source, ['clase', 'practica'], true)) {
                    $entry['source'] = $source;
                }
            }

            $clean[$key] = $entry;
        }

        return $clean;
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
                    'username' => $user->username,
                    'avatar_url' => $user->avatar ? Storage::url($user->avatar) : null,
                    'created_at' => $user->created_at?->format('c'),
                ],
            ],
        ]);
    }
}
