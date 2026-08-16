<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    private function ensureJsonParsed(Request $request): void
    {
        $content = $request->getContent();
        if (empty($request->all()) && !empty($content)) {
            $data = json_decode($content, true);
            if (is_array($data)) {
                $request->merge($data);
            }
        }
    }

    public function register(): JsonResponse
    {
        return response()->json([
            'message' => 'El registro público está cerrado. Tu entrenadora crea tu acceso.',
        ], 403);
    }

    public function login(Request $request): JsonResponse
    {
        $this->ensureJsonParsed($request);

        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', strtolower($validated['email']))->first();

        if (
            !$user
            || !$user->isCoach()
            || !Hash::check($validated['password'], $user->password)
        ) {
            return response()->json([
                'message' => 'Las credenciales proporcionadas son incorrectas.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Esta cuenta está desactivada.',
            ], 403);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Sesión iniciada correctamente',
            'user' => $user->toPublicArray(),
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function loginPin(Request $request): JsonResponse
    {
        $this->ensureJsonParsed($request);

        $validated = $request->validate([
            'username' => ['required', 'string', 'max:40'],
            'pin' => ['required', 'string', 'min:4', 'max:6'],
        ]);

        $username = strtolower(trim($validated['username']));
        $user = User::query()
            ->where('role', User::ROLE_CLIENT)
            ->whereRaw('LOWER(username) = ?', [$username])
            ->first();

        $invalid = !$user
            || !$user->pin_hash
            || !Hash::check($validated['pin'], $user->pin_hash);

        if ($invalid) {
            return response()->json([
                'message' => 'Los datos son incorrectos.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Tu acceso está desactivado. Hablá con tu entrenadora.',
            ], 403);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Sesión iniciada correctamente',
            'user' => $user->toPublicArray(),
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente',
        ]);
    }
}
