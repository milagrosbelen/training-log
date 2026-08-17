<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CoachRosterService;
use App\Services\PlanAssembler;
use App\Services\ProfileAssembler;
use App\Services\WorkoutAssembler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    public function alumna(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isCoach()) {
            return response()->json([
                'data' => [
                    'workouts' => [],
                    'plan' => null,
                    'profile' => ProfileAssembler::summary($user, []),
                ],
            ]);
        }

        $workouts = WorkoutAssembler::listForUser($user);

        return response()->json([
            'data' => [
                'workouts' => $workouts,
                'plan' => PlanAssembler::payloadForUser($user),
                'profile' => ProfileAssembler::summary($user, $workouts),
            ],
        ]);
    }

    public function coach(Request $request): JsonResponse
    {
        return response()->json([
            'data' => CoachRosterService::alumnasFor($request->user()),
        ]);
    }
}
