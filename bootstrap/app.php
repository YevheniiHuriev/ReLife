<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'mute' => App\Http\Middleware\MuteInspector::class,
            'ban' => App\Http\Middleware\BanInspector::class,
            'admin' => App\Http\Middleware\AdminInspector::class,
            'moder' => App\Http\Middleware\ModeratorInspector::class,
        ]);
        $middleware->group('auth-mute', ['auth:api', 'mute']);
        $middleware->group('auth-admin', ['auth:api', 'admin']);
        $middleware->group('auth-moder', ['auth:api', 'moder']);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
