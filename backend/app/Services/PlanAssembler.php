<?php

namespace App\Services;

use App\Models\Plan;
use App\Models\PlanCompletion;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class PlanAssembler
{
    public static function payloadForUser(User $user): ?array
    {
        $row = DB::selectOne(
            'select
                p.id,
                p.user_id,
                p.coach_id,
                p.week_current,
                p.week_total,
                p.days_per_week,
                p.objective,
                p.sessions,
                u.name as user_name,
                coalesce(u.training_type, ?) as training_type,
                coach.name as coach_name,
                (
                    select coalesce(json_agg(json_build_object(
                        \'id\', pc.id,
                        \'week_number\', pc.week_number,
                        \'weekday\', pc.weekday,
                        \'completed_exercises\', pc.completed_exercises,
                        \'updated_at\', pc.updated_at
                    ) order by pc.week_number, pc.weekday), \'[]\'::json)
                    from plan_completions pc
                    where pc.plan_id = p.id
                ) as completions_json
            from plans p
            inner join users u on u.id = p.user_id
            left join users coach on coach.id = p.coach_id
            where p.user_id = ?
            limit 1',
            [User::TRAINING_GYM, $user->id]
        );

        if (!$row) {
            return null;
        }

        return self::toPayloadFromRow($row);
    }

    public static function toPayload(Plan $plan): array
    {
        return self::buildPayload(
            (int) $plan->id,
            (int) $plan->user_id,
            $plan->user?->name,
            $plan->user?->training_type ?: User::TRAINING_GYM,
            $plan->coach?->name,
            (int) $plan->week_current,
            (int) $plan->week_total,
            $plan->days_per_week,
            $plan->objective,
            is_array($plan->sessions) ? $plan->sessions : [],
            collect($plan->completions ?? [])
        );
    }

    public static function toPayloadFromRow(object $row): array
    {
        $sessions = $row->sessions;
        if (is_string($sessions)) {
            $sessions = json_decode($sessions, true) ?: [];
        }
        if (!is_array($sessions)) {
            $sessions = [];
        }

        $rawCompletions = $row->completions_json ?? '[]';
        if (is_string($rawCompletions)) {
            $rawCompletions = json_decode($rawCompletions, true) ?: [];
        }

        $completions = collect($rawCompletions)->map(function ($item) {
            $completed = $item['completed_exercises'] ?? [];
            if (is_string($completed)) {
                $completed = json_decode($completed, true) ?: [];
            }

            $completion = new PlanCompletion();
            $completion->forceFill([
                'week_number' => (int) ($item['week_number'] ?? 0),
                'weekday' => (int) ($item['weekday'] ?? 0),
                'completed_exercises' => $completed,
            ]);
            if (!empty($item['updated_at'])) {
                $completion->updated_at = $item['updated_at'];
            }

            return $completion;
        });

        return self::buildPayload(
            (int) $row->id,
            (int) $row->user_id,
            $row->user_name ?? null,
            $row->training_type ?: User::TRAINING_GYM,
            $row->coach_name ?? null,
            (int) $row->week_current,
            (int) $row->week_total,
            $row->days_per_week ?? null,
            $row->objective,
            $sessions,
            $completions
        );
    }

    private static function buildPayload(
        int $id,
        int $userId,
        ?string $userName,
        string $trainingType,
        ?string $coachName,
        int $weekCurrent,
        int $weekTotal,
        mixed $daysPerWeek,
        mixed $objective,
        array $sessions,
        $completions
    ): array {
        $weekCompletions = collect($completions)
            ->where('week_number', $weekCurrent)
            ->keyBy('weekday');

        $trainedWeekdays = [];
        $progressByWeekday = [];

        foreach ($sessions as $session) {
            if (!is_array($session) || !array_key_exists('weekday', $session)) {
                continue;
            }

            $weekday = (int) $session['weekday'];
            $total = count($session['exercises'] ?? []);
            $completed = $weekCompletions->get($weekday)?->completed_exercises ?? [];
            $doneCount = count($completed);
            $progressByWeekday[$weekday] = [
                'completed' => $doneCount,
                'total' => $total,
                'indexes' => array_values($completed),
            ];

            if ($total > 0 && $doneCount >= $total) {
                $trainedWeekdays[] = $weekday;
            }
        }

        $trainedDates = collect($completions)
            ->filter(function ($completion) use ($sessions) {
                $session = collect($sessions)->first(function ($item) use ($completion) {
                    return is_array($item)
                        && (int) ($item['weekday'] ?? -1) === (int) $completion->weekday;
                });
                $total = count(is_array($session) ? ($session['exercises'] ?? []) : []);
                $done = count($completion->completed_exercises ?? []);

                return $total > 0 && $done >= $total;
            })
            ->map(function ($completion) {
                $updated = $completion->updated_at ?? null;
                if (!$updated) {
                    return null;
                }
                if (is_string($updated)) {
                    return substr($updated, 0, 10);
                }

                return $updated->toDateString();
            })
            ->filter()
            ->unique()
            ->values()
            ->all();

        return [
            'id' => $id,
            'user_id' => $userId,
            'user_name' => $userName,
            'training_type' => $trainingType ?: User::TRAINING_GYM,
            'coach_name' => $coachName,
            'week_current' => $weekCurrent,
            'week_total' => $weekTotal,
            'days_per_week' => $daysPerWeek ?? count($sessions),
            'objective' => $objective,
            'sessions' => $sessions,
            'trained_weekdays' => $trainedWeekdays,
            'trained_dates' => $trainedDates,
            'progress_by_weekday' => $progressByWeekday,
        ];
    }
}
