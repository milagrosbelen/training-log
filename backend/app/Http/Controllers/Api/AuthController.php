<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Ensure JSON body is merged into request (fix for proxy/axios sometimes not parsing).
     */
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

    public function register(Request $request): JsonResponse
    {
        $this->ensureJsonParsed($request);

        try {
            $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'name.required' => 'El nombre es obligatorio.',
            'email.required' => 'El email es obligatorio.',
            'email.email' => 'El email debe ser válido.',
            'email.unique' => 'Este email ya está registrado.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'password' => $validated['password'], // El modelo User tiene cast 'hashed'
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Usuario registrado correctamente',
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            \Log::error('Register error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request_content' => $request->getContent(),
            ]);
            return response()->json([
                'message' => config('app.debug')
                    ? 'Error: ' . $e->getMessage()
                    : 'Error al crear la cuenta. Intentá de nuevo.',
            ], 500);
        }
    }

    public function login(Request $request): JsonResponse
    {
        $this->ensureJsonParsed($request);

        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', strtolower($validated['email']))->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Las credenciales proporcionadas son incorrectas.',
                'errors' => [
                    'email' => ['Las credenciales proporcionadas son incorrectas.'],
                ],
            ], 401);
        }

        $user->tokens()->delete();

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Sesión iniciada correctamente',
            'user' => $user,
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
