<?php

namespace Sawmainek\Apitoolz;

use Illuminate\Support\ServiceProvider;
use Sawmainek\Apitoolz\Console\RestfulAPIGenerator;

class APIToolzServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton('command.apitoolz:generate', function ($app) {
            return $app->make(RestfulAPIGenerator::class);
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'apitoolz');
        $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');
        if ($this->app->runningInConsole()) {
            // Publish views
            $this->publishes([
              __DIR__.'/../resources/views' => resource_path('views/vendor/apitoolz'),
            ], 'views');
            // Publish config
            $this->publishes([
                __DIR__.'/../config/config.php' => config_path('apitoolz.php'),
            ], 'config');
        }
        // Register the command if we are using the application via the CLI
        $this->commands([
            RestfulAPIGenerator::class,
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
