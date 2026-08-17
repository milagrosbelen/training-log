<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class WorkoutAssembler
{
    public static function listForUser(User $user): array
    {
        $rows = DB::select(
            'select
                w.id,
                w.user_id,
                to_char(w.date, \'YYYY-MM-DD\') as date,
                w.type,
                w.duration,
                coalesce(json_agg(json_build_object(
                    \'id\', e.id,
                    \'name\', e.name,
                    \'weight\', e.weight,
                    \'reps\', e.reps,
                    \'sets\', e.sets,
                    \'order\', e."order",
                    \'notes\', e.notes
                ) order by e."order") filter (where e.id is not null), \'[]\'::json) as exercises
            from workouts w
            left join exercises e on e.workout_id = w.id
            where w.user_id = ?
            group by w.id
            order by w.date desc',
            [$user->id]
        );

        return array_map([self::class, 'rowToArray'], $rows);
    }

    public static function rowToArray(object $row): array
    {
        $exercises = $row->exercises ?? [];
        if (is_string($exercises)) {
            $exercises = json_decode($exercises, true) ?: [];
        }

        return [
            'id' => (int) $row->id,
            'user_id' => (int) $row->user_id,
            'date' => $row->date,
            'type' => $row->type,
            'duration' => (int) $row->duration,
            'exercises' => array_map(function ($exercise) {
                return [
                    'id' => (int) ($exercise['id'] ?? 0),
                    'name' => $exercise['name'] ?? '',
                    'weight' => isset($exercise['weight']) && $exercise['weight'] !== null
                        ? (float) $exercise['weight']
                        : null,
                    'reps' => isset($exercise['reps']) && $exercise['reps'] !== null
                        ? (int) $exercise['reps']
                        : null,
                    'sets' => (int) ($exercise['sets'] ?? 1),
                    'order' => (int) ($exercise['order'] ?? 0),
                    'notes' => $exercise['notes'] ?? null,
                ];
            }, is_array($exercises) ? $exercises : []),
        ];
    }
}
