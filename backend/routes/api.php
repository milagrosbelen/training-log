<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ExerciseController;
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

// CORS preflight: responde OPTIONS antes que cualquier otra ruta
Route::options('/{any}', function () {
    return response('', 204)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
})->where('any', '.*');

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $request) => $request->user());
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
});
