<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Models\UserBan;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BanInspector
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->has('email')) {
            $user = User::where('email', $request->email)->first();
            $userTimeZone = $request->input('userTimeZone');
            if ($user) {
                $now = now()->timezone($userTimeZone)->toDateTimeString();
                $banInfo = UserBan::where('user_id', $user->id)->first();
                if($banInfo) {
                    $banEndTime = $banInfo->created_at
                        ->addHours($banInfo->ban_duration)
                        ->timezone($userTimeZone)->toDateTimeString();

                    if ($now < $banEndTime) {
                        return response()->json([
                            'message' => 'Baned',
                            'html' => '/frontend/html/mod/ban.html',
                            'ban_end_time' => $banEndTime,
                            'ban_time' => $banInfo->created_at->toDateTimeString(),
                            'now' => $now,
                            'status' => false,
                        ], 200);
                    }
                }
            }
        }

        return $next($request);
    }
}
