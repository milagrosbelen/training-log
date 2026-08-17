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

        return $this->authPayload($user);
    }

    public function loginPin(Request $request): JsonResponse
    {
        $this->ensureJsonParsed($request);

        $validated = $request->validate([
            'username' => ['required', 'string', 'max:80'],
            'pin' => ['required', 'string', 'min:4', 'max:72'],
            'role' => ['nullable', 'in:client,coach,alumna'],
        ]);

        $username = strtolower(trim($validated['username']));
        $role = $validated['role'] ?? User::ROLE_CLIENT;
        if ($role === 'alumna') {
            $role = User::ROLE_CLIENT;
        }

        $query = User::query()->where('role', $role);

        if ($role === User::ROLE_COACH) {
            $query->where(function ($inner) use ($username) {
                $inner->where('username', $username)->orWhere('email', $username);
            });
        } else {
            $query->where('username', $username);
        }

        $user = $query->first();

        $pin = $validated['pin'];
        $validPin = $user && $user->pin_hash && Hash::check($pin, $user->pin_hash);
        $validPassword = $role === User::ROLE_COACH
            && $user
            && $user->password
            && Hash::check($pin, $user->password);

        if (!$user || (!$validPin && !$validPassword)) {
            return response()->json([
                'message' => 'Los datos son incorrectos.',
            ], 401);
        }

        if (!$user->is_active) {
            $message = $role === User::ROLE_COACH
                ? 'Esta cuenta está desactivada.'
                : 'Tu acceso está desactivado. Hablá con tu entrenadora.';

            return response()->json(['message' => $message], 403);
        }

        return $this->authPayload($user);
    }

    private function authPayload(User $user): JsonResponse
    {
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
