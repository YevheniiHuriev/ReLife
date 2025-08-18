<?php

namespace App\Http\Middleware;

use App\Models\UserMute;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MuteInspector
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $activeMute = UserMute::findActiveMuteByUserId($user->id);

        if ($activeMute) {
            return response()->json([
                'message' => 'Muted',
                'details' => $activeMute
            ], 200);
        }

        return $next($request);
    }
}
