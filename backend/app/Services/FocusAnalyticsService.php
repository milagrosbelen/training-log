<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class FocusAnalyticsService
{
    /**
     * Mapeo de términos de foco a palabras clave para matching de ejercicios.
     * Permite variaciones en español, inglés y nombres comunes.
     */
    private static function getKeywordsForFocus(string $focus): array
    {
        $normalized = mb_strtolower(trim($focus));
        $normalized = preg_replace('/[áàäâ]/u', 'a', $normalized);
        $normalized = preg_replace('/[éèëê]/u', 'e', $normalized);
        $normalized = preg_replace('/[íìïî]/u', 'i', $normalized);
        $normalized = preg_replace('/[óòöô]/u', 'o', $normalized);
        $normalized = preg_replace('/[úùüû]/u', 'u', $normalized);

        $synonyms = [
            'gluteo' => ['gluteo', 'glute', 'hip thrust', 'puente', 'glute bridge', 'extension cadera', 'glute kickback', 'peso muerto rumano'],
            'piernas' => ['pierna', 'sentadilla', 'squat', 'leg', 'cuadriceps', 'cuádriceps', 'gemelo', 'femoral', 'prensa'],
            'pecho' => ['pecho', 'chest', 'press', 'banca', 'bench', 'pectoral'],
            'espalda' => ['espalda', 'remo', 'dominada', 'jalon', 'back', 'pull', 'trapecio', 'dorsal'],
            'hombros' => ['hombro', 'shoulder', 'press militar', 'elevacion', 'elevación', 'delt'],
            'brazos' => ['brazo', 'curl', 'triceps', 'tríceps', 'biceps', 'bíceps'],
            'core' => ['core', 'abdominal', 'plancha', 'plank', 'crunch'],
        ];

        $keywords = [$normalized];

        foreach ($synonyms as $syn => $synWords) {
            if (str_contains($normalized, $syn) || str_contains($syn, $normalized)) {
                $keywords = array_merge($keywords, $synWords);
            }
        }

        return array_values(array_unique($keywords));
    }

    private static function normalizeForMatch(string $text): string
    {
        $t = mb_strtolower(trim($text));
        $t = preg_replace('/[áàäâ]/u', 'a', $t);
        $t = preg_replace('/[éèëê]/u', 'e', $t);
        $t = preg_replace('/[íìïî]/u', 'i', $t);
        $t = preg_replace('/[óòöô]/u', 'o', $t);
        $t = preg_replace('/[úùüû]/u', 'u', $t);
        return $t;
    }

    private static function exerciseMatchesFocus(string $exerciseName, array $keywords): bool
    {
        $name = self::normalizeForMatch($exerciseName);
        foreach ($keywords as $kw) {
            if (str_contains($name, self::normalizeForMatch($kw))) {
                return true;
            }
        }
        return false;
    }

    /**
     * Obtiene los entrenamientos del usuario que tienen ejercicios relacionados con el foco.
     */
    public static function getFocusWorkouts(User $user, int $year, int $month): Collection
    {
        $focus = $user->focus;
        if (!$focus || trim($focus) === '') {
            return collect();
        }

        $keywords = self::getKeywordsForFocus($focus);
        $start = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $end = Carbon::createFromDate($year, $month, 1)->endOfMonth();

        $workouts = $user->workouts()
            ->with('exercises')
            ->whereBetween('date', [$start, $end])
            ->get();

        return $workouts->filter(function ($workout) use ($keywords) {
            foreach ($workout->exercises as $ex) {
                if (self::exerciseMatchesFocus($ex->name ?? '', $keywords)) {
                    return true;
                }
            }
            return false;
        });
    }

    /**
     * Extrae métricas de un conjunto de entrenamientos (solo ejercicios que coinciden con el foco).
     */
    private static function extractMetrics(Collection $workouts, array $keywords): array
    {
        $sessions = 0;
        $totalVolume = 0.0;
        $weightedSum = 0.0;
        $weightCount = 0;

        foreach ($workouts as $workout) {
            $sessionVolume = 0.0;
            $sessionWeightSum = 0.0;
            $sessionWeightCount = 0;

            foreach ($workout->exercises as $ex) {
                if (!self::exerciseMatchesFocus($ex->name ?? '', $keywords)) {
                    continue;
                }
                $sets = (int) ($ex->sets ?? 1);
                $reps = (int) ($ex->reps ?? 0);
                $weight = (float) ($ex->weight ?? 0);
                $vol = $weight * $reps * $sets;
                $sessionVolume += $vol;
                if ($weight > 0) {
                    $sessionWeightSum += $weight * $sets;
                    $sessionWeightCount += $sets;
                }
            }

            if ($sessionVolume > 0 || $sessionWeightCount > 0) {
                $sessions++;
                $totalVolume += $sessionVolume;
                $weightedSum += $sessionWeightSum;
                $weightCount += $sessionWeightCount;
            }
        }

        $avgWeight = $weightCount > 0 ? $weightedSum / $weightCount : null;

        return [
            'sessions' => $sessions,
            'total_volume' => round($totalVolume, 2),
            'avg_weight' => $avgWeight !== null ? round($avgWeight, 2) : null,
        ];
    }

    /**
     * Calcula el progreso del mes respecto al mes anterior.
     */
    public static function computeFocusAnalytics(User $user): ?array
    {
        $focus = $user->focus;
        if (!$focus || trim($focus) === '') {
            return null;
        }

        $keywords = self::getKeywordsForFocus($focus);
        $now = Carbon::now();
        $currentYear = $now->year;
        $currentMonth = $now->month;

        $currentWorkouts = self::getFocusWorkouts($user, $currentYear, $currentMonth);
        $prevMonth = $now->copy()->subMonth();
        $prevWorkouts = self::getFocusWorkouts($user, $prevMonth->year, $prevMonth->month);

        $current = self::extractMetrics($currentWorkouts, $keywords);
        $previous = self::extractMetrics($prevWorkouts, $keywords);

        // Si no hay datos del mes actual, considerar insuficientes
        if ($current['sessions'] === 0) {
            return [
                'focus' => trim($focus),
                'sufficient_data' => false,
                'message' => 'Aún no hay datos suficientes para analizar tu foco.',
                'sessions' => 0,
            ];
        }

        $sessions = $current['sessions'];
        $progressPct = null;
        $weightChange = null;
        $volumeChange = null;
        $status = 'en_progreso'; // en_progreso | mejorando | estable | necesita_atencion

        if ($previous['sessions'] > 0) {
            if ($previous['total_volume'] > 0) {
                $progressPct = round((($current['total_volume'] - $previous['total_volume']) / $previous['total_volume']) * 100);
            }
            if ($previous['avg_weight'] !== null && $current['avg_weight'] !== null) {
                $weightChange = round($current['avg_weight'] - $previous['avg_weight'], 2);
            }
            if ($previous['total_volume'] > 0 && $current['total_volume'] > 0) {
                $volumeChange = round($current['total_volume'] - $previous['total_volume'], 2);
            }

            if ($progressPct !== null) {
                if ($progressPct >= 5) {
                    $status = 'mejorando';
                } elseif ($progressPct <= -5) {
                    $status = 'necesita_atencion';
                } else {
                    $status = 'estable';
                }
            }
        }

        return [
            'focus' => trim($focus),
            'sufficient_data' => true,
            'sessions' => $sessions,
            'progress_pct' => $progressPct,
            'weight_change' => $weightChange,
            'volume_change' => $volumeChange,
            'avg_weight_current' => $current['avg_weight'],
            'status' => $status,
        ];
    }
}
