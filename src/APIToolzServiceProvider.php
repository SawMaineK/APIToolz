<?php

namespace Sawmainek\Apitoolz;

use Illuminate\Support\ServiceProvider;
use Sawmainek\Apitoolz\Console\APIRestfulGenerator;

class APIToolzServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton('command.apitoolz:generate', function ($app) {
            return $app->make(APIRestfulGenerator::class);
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Register the command if we are using the application via the CLI
        $this->commands([
            APIRestfulGenerator::class,
        ]);
    }

    /**
     * Get the services provided by the provider.
     *
     * @codeCoverageIgnore
     *
     * @return array
     */
    public function provides()
    {
        return [
            'command.apitoolz.generate',
        ];
    }
}
