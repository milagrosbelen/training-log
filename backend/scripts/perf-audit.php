<?php

/**
 * One-off local performance audit. Not used in production requests.
 * Run: php scripts/perf-audit.php
 */

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\Api\AlumnaController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\Api\WorkoutController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

function measure(string $label, callable $fn): array
{
    DB::flushQueryLog();
    DB::enableQueryLog();
    $start = hrtime(true);
    $payload = $fn();
    $elapsedMs = (hrtime(true) - $start) / 1e6;
    $queries = DB::getQueryLog();
    $sqlMs = 0.0;
    foreach ($queries as $query) {
        $sqlMs += (float) ($query['time'] ?? 0);
    }
    $bytes = strlen(is_string($payload) ? $payload : json_encode($payload));

    return [
        'label' => $label,
        'total_ms' => round($elapsedMs, 2),
        'sql_ms' => round($sqlMs, 2),
        'queries' => count($queries),
        'bytes' => $bytes,
        'sql' => array_map(function ($query) {
            return [
                'time' => $query['time'] ?? 0,
                'sql' => $query['query'] ?? '',
            ];
        }, $queries),
    ];
}

function actingAs(User $user): Request
{
    $request = Request::create('/', 'GET');
    $request->setUserResolver(fn () => $user);

    return $request;
}

$alumna = User::query()->where('role', User::ROLE_CLIENT)->orderBy('id')->first();
$coach = User::query()->where('role', User::ROLE_COACH)->orderBy('id')->first();

$results = [];

$pingStart = hrtime(true);
try {
    DB::select('select 1 as ok');
    $results[] = [
        'label' => 'db_ping',
        'total_ms' => round((hrtime(true) - $pingStart) / 1e6, 2),
        'sql_ms' => round((hrtime(true) - $pingStart) / 1e6, 2),
        'queries' => 1,
        'bytes' => 0,
        'sql' => [['time' => 0, 'sql' => 'select 1']],
    ];
} catch (Throwable $e) {
    fwrite(STDERR, 'DB ping failed: '.$e->getMessage().PHP_EOL);
    exit(1);
}

if ($alumna) {
    $request = actingAs($alumna);
    $results[] = measure('GET /workouts', function () use ($request) {
        return (new WorkoutController())->index($request)->getContent();
    });
    $results[] = measure('GET /profile-summary', function () use ($request) {
        return (new ProfileController())->summary($request)->getContent();
    });
    $results[] = measure('GET /plans/me', function () use ($request) {
        return (new PlanController())->mine($request)->getContent();
    });
    $results[] = measure('GET /session', function () use ($request) {
        return (new SessionController())->alumna($request)->getContent();
    });
}

if ($coach) {
    $request = actingAs($coach);
    $results[] = measure('GET /alumnas', function () use ($request) {
        return (new AlumnaController())->index($request)->getContent();
    });
    $results[] = measure('GET /clients', function () use ($request) {
        return (new PlanController())->clients($request)->getContent();
    });
    $results[] = measure('GET /coach-session', function () use ($request) {
        return (new SessionController())->coach($request)->getContent();
    });
}

$counts = [
    'users' => User::query()->count(),
    'workouts' => DB::table('workouts')->count(),
    'exercises' => DB::table('exercises')->count(),
    'plans' => DB::table('plans')->count(),
    'alumna_id' => $alumna?->id,
    'coach_id' => $coach?->id,
];

echo json_encode(['counts' => $counts, 'results' => $results], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE).PHP_EOL;
