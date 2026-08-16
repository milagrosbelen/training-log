<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AlumnaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $coach = $request->user();
        $planUserIds = Plan::query()->whereIn(
            'user_id',
            $coach->alumnas()->pluck('id')
        )->pluck('user_id')->all();

        $alumnas = $coach->alumnas()
            ->where('role', User::ROLE_CLIENT)
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $alumnas->map(fn (User $alumna) => [
                ...$alumna->toPublicArray(),
                'has_plan' => in_array($alumna->id, $planUserIds, true),
            ]),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $coach = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'min:3', 'max:30', 'regex:/^[a-zA-Z0-9._-]+$/', 'unique:users,username'],
            'pin' => ['required', 'string', 'regex:/^[0-9]{4,6}$/'],
            'focus' => ['nullable', 'string', 'max:100'],
        ], [
            'name.required' => 'El nombre es obligatorio.',
            'username.required' => 'El usuario es obligatorio.',
            'username.unique' => 'Ese usuario ya existe.',
            'username.regex' => 'El usuario solo puede tener letras, números, punto, guion o guion bajo.',
            'pin.required' => 'El PIN es obligatorio.',
            'pin.regex' => 'El PIN debe tener 4 a 6 números.',
        ]);

        $username = strtolower($validated['username']);
        $pin = $validated['pin'];

        $alumna = new User();
        $alumna->fill([
            'name' => $validated['name'],
            'username' => $username,
            'email' => $username.'@alumnas.milogit.local',
            'password' => Str::random(40),
            'focus' => $validated['focus'] ?? null,
            'is_active' => true,
            'coach_id' => $coach->id,
        ]);
        $alumna->forceFill([
            'role' => User::ROLE_CLIENT,
            'pin_hash' => Hash::make($pin),
        ])->save();

        return response()->json([
            'message' => 'Alumna creada. Guardá el PIN, no se vuelve a mostrar.',
            'data' => [
                ...$alumna->toPublicArray(),
                'has_plan' => false,
            ],
            'credentials' => [
                'username' => $username,
                'pin' => $pin,
            ],
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $coach = $request->user();
        if (!$coach->ownsAlumna($user)) {
            return response()->json(['message' => 'No podés gestionar esa cuenta.'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'username' => [
                'sometimes',
                'required',
                'string',
                'min:3',
                'max:30',
                'regex:/^[a-zA-Z0-9._-]+$/',
                Rule::unique('users', 'username')->ignore($user->id),
            ],
            'focus' => ['nullable', 'string', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
            'pin' => ['nullable', 'string', 'regex:/^[0-9]{4,6}$/'],
        ]);

        if (isset($validated['username'])) {
            $validated['username'] = strtolower($validated['username']);
        }

        $user->fill(collect($validated)->except('pin')->all());

        if (!empty($validated['pin'])) {
            $user->pin_hash = Hash::make($validated['pin']);
        }

        $user->save();

        $payload = [
            ...$user->fresh()->toPublicArray(),
            'has_plan' => $user->assignedPlan()->exists(),
        ];

        $response = [
            'message' => 'Alumna actualizada.',
            'data' => $payload,
        ];

        if (!empty($validated['pin'])) {
            $response['credentials'] = [
                'username' => $user->username,
                'pin' => $validated['pin'],
            ];
        }

        return response()->json($response);
    }
}
