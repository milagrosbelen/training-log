<?php

use App\Http\Controllers\Api\AlumnaController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ExerciseController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\WorkoutController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check: GET /api (para verificar que el backend responde)
Route::get('/', fn () => response()->json(['status' => 'ok', 'api' => 'MiLogit'])->header('Access-Control-Allow-Origin', '*'));

Route::get('/ping', function () {
    try {
        \Illuminate\Support\Facades\DB::select('select 1 as ok');
    } catch (\Throwable) {
        // Keep the response fast even if the database is waking up.
    }

    return response()->json(['ok' => true])->header('Access-Control-Allow-Origin', '*');
});

Route::get('/health', function () {
    $db = false;
    $users = null;
    $dbError = null;

    try {
        \Illuminate\Support\Facades\DB::select('select 1 as ok');
        $db = true;
        $users = \App\Models\User::query()->count();
    } catch (\Throwable $e) {
        $dbError = $e->getMessage();
    }

    return response()->json([
        'status' => $db ? 'ok' : 'db_error',
        'api' => 'MiLogit',
        'app_key' => filled(config('app.key')),
        'db' => $db,
        'users' => $users,
        'db_host' => config('database.connections.'.config('database.default').'.host'),
        'db_error' => $dbError,
    ])->header('Access-Control-Allow-Origin', '*');
});

// CORS preflight: responde OPTIONS antes que cualquier otra ruta
Route::options('/{any}', function () {
    return response('', 204)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
})->where('any', '.*');

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/pin', [AuthController::class, 'loginPin']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        if ($user->isCoach()) {
            $user->applyConfiguredCoachRole();
        }

        return response()->json($user->toPublicArray());
    });
    Route::get('/profile-summary', [ProfileController::class, 'summary']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::get('/profile/focus', [ProfileController::class, 'getFocus']);
    Route::patch('/profile/focus', [ProfileController::class, 'updateFocus']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/workouts', [WorkoutController::class, 'index']);
    Route::get('/workouts/date/{date}', [WorkoutController::class, 'showByDate']);
    Route::post('/workouts', [WorkoutController::class, 'store']);
    Route::delete('/workouts/{workout}', [WorkoutController::class, 'destroy']);

    Route::post('/exercises', [ExerciseController::class, 'store']);
    Route::put('/exercises/{exercise}', [ExerciseController::class, 'update']);
    Route::patch('/exercises/{exercise}', [ExerciseController::class, 'update']);
    Route::delete('/exercises/{exercise}', [ExerciseController::class, 'destroy']);

    Route::get('/plans/me', [PlanController::class, 'mine']);
    Route::post('/plans/me/progress', [PlanController::class, 'progress']);

    Route::middleware('coach')->group(function () {
        Route::get('/clients', [PlanController::class, 'clients']);
        Route::get('/alumnas', [AlumnaController::class, 'index']);
        Route::post('/alumnas', [AlumnaController::class, 'store']);
        Route::put('/alumnas/{user}', [AlumnaController::class, 'update']);
        Route::get('/plans/users/{user}', [PlanController::class, 'showForUser']);
        Route::put('/plans/users/{user}', [PlanController::class, 'upsertForUser']);
        Route::delete('/plans/users/{user}', [PlanController::class, 'destroyForUser']);
    });
});
