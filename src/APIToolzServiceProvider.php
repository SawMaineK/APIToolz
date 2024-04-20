<?php

namespace Sawmainek\Apitoolz;

use Illuminate\Support\ServiceProvider;
use Sawmainek\Apitoolz\Console\ModelGenerator;
use Sawmainek\Apitoolz\Console\DatatableGenerator;
use Sawmainek\Apitoolz\Console\RequestBodyConfigGenerator;
use Sawmainek\Apitoolz\Console\ResponseConfigGenerator;
use Sawmainek\Apitoolz\Console\ModelRelationGenerator;
use Sawmainek\Apitoolz\Console\ModelExportGenerator;
use Sawmainek\Apitoolz\Console\ModelImportGenerator;


class APIToolzServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton('command.apitoolz:model', function ($app) {
            return $app->make(ModelGenerator::class);
        });

        $this->app->singleton('command.apitoolz:datatable', function ($app) {
            return $app->make(DatatableGenerator::class);
        });

        $this->app->singleton('command.apitoolz:request', function ($app) {
            return $app->make(RequestBodyConfigGenerator::class);
        });

        $this->app->singleton('command.apitoolz:response', function ($app) {
            return $app->make(ResponseConfigGenerator::class);
        });

        $this->app->singleton('command.apitoolz:relation', function ($app) {
            return $app->make(ModelRelationGenerator::class);
        });

        $this->app->singleton('command.apitoolz:export', function ($app) {
            return $app->make(ModelExportGenerator::class);
        });

        $this->app->singleton('command.apitoolz:import', function ($app) {
            return $app->make(ModelImportGenerator::class);
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
            ModelGenerator::class,
            DatatableGenerator::class,
            RequestBodyConfigGenerator::class,
            ResponseConfigGenerator::class,
            ModelRelationGenerator::class,
            ModelExportGenerator::class,
            ModelImportGenerator::class
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
            'command.apitoolz.model',
            'command.apitoolz.datatable',
            'command.apitoolz.request',
            'command.apitoolz.response',
            'command.apitoolz.relation',
            'command.apitoolz.export',
            'command.apitoolz.import'
        ];
    }
}
