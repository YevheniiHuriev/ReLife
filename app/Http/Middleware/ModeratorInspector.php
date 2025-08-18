<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ModeratorInspector
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = User::find(Auth::id());

        if (!$user || ($user->role->name !== 'admin' && $user->role->name !== 'moderator')) {
            return response()->json([
                'error' => 'Access Denied. Only administrators are allowed.'
            ], 403);
        }

        return $next($request);
    }
}
