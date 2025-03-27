<?php

namespace Sawmainek\Apitoolz\Providers;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * Define your route model bindings, pattern filters, and more.
     */
    public function boot(): void
    {
        $this->routes(function () {
            // API routes (restoring api.php)
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));
        });
    }
}
