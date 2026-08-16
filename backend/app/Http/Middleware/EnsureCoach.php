<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCoach
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->isCoach()) {
            return response()->json([
                'message' => 'Solo el coach puede modificar el plan.',
            ], 403);
        }

        return $next($request);
    }
}
