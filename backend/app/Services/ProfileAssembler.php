<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Storage;

class ProfileAssembler
{
    public static function summary(User $user, ?array $workouts = null): array
    {
        $workouts ??= WorkoutAssembler::listForUser($user);

        $totalWorkouts = count($workouts);
        $totalDuration = 0;
        $typeCounts = [];
        $history = [];

        foreach ($workouts as $index => $workout) {
            $totalDuration += (int) ($workout['duration'] ?? 0);
            $type = (string) ($workout['type'] ?? '');
            if ($type !== '') {
                $typeCounts[$type] = ($typeCounts[$type] ?? 0) + 1;
            }
            if ($index < 100) {
                $history[] = [
                    'date' => $workout['date'] ?? null,
                    'type' => $workout['type'] ?? null,
                    'duration' => (int) ($workout['duration'] ?? 0),
                ];
            }
        }

        arsort($typeCounts);
        $mostFrequent = $typeCounts ? array_key_first($typeCounts) : null;
        $last = $workouts[0] ?? null;

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'role' => $user->role,
                'avatar_url' => $user->avatar ? Storage::url($user->avatar) : null,
                'focus' => $user->focus,
                'created_at' => $user->created_at?->format('c'),
            ],
            'total_workouts' => $totalWorkouts,
            'total_duration' => $totalDuration,
            'last_workout' => $last ? [
                'date' => $last['date'] ?? null,
                'type' => $last['type'] ?? null,
                'duration' => (int) ($last['duration'] ?? 0),
            ] : null,
            'most_frequent_type' => $mostFrequent,
            'history' => $history,
            'focus_analytics' => FocusAnalyticsService::computeFromWorkouts($user, $workouts),
        ];
    }
}
