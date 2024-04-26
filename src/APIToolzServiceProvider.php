<?php

namespace Sawmainek\Apitoolz;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\DB;
use Illuminate\Contracts\Http\Kernel;
use Sawmainek\Apitoolz\Http\Middleware\RequestLogger;
use Sawmainek\Apitoolz\Http\Middleware\ResponseLogger;
use Sawmainek\Apitoolz\Console\ModelGenerator;
use Sawmainek\Apitoolz\Console\DatatableGenerator;
use Sawmainek\Apitoolz\Console\RequestBodyConfigGenerator;
use Sawmainek\Apitoolz\Console\ResponseConfigGenerator;
use Sawmainek\Apitoolz\Console\ModelRelationGenerator;
use Sawmainek\Apitoolz\Console\ModelExportGenerator;
use Sawmainek\Apitoolz\Console\ModelImportGenerator;
use Sawmainek\Apitoolz\Console\ActivateGenerator;
use Sawmainek\Apitoolz\Console\OpenAIGenerator;


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

        $this->app->singleton('command.apitoolz:activate', function ($app) {
            return $app->make(ActivateGenerator::class);
        });

        $this->app->singleton('command.apitoolz:ai', function ($app) {
            return $app->make(OpenAIGenerator::class);
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(Kernel $kernel): void
    {
        if(config('apitoolz.log.enable')) {
            $kernel->pushMiddleware(RequestLogger::class);
            $kernel->pushMiddleware(ResponseLogger::class);

            DB::listen(function (QueryExecuted $query) {
                $request = $this->app->request;
                if( \Str::startsWith($request->path(), 'api/')) {
                    \Log::info("[DB Query]  {$request->method()}::/{$request->path()} >>",[
                        'request_id'=>$request->header()['x-request-id'][0] ?? "",
                        'sql' => $query->sql,
                        'binding' => $query->bindings,
                        'time' => $query->time,
                    ]);
                }
            });

            DB::whenQueryingForLongerThan(500, function (Connection $connection, QueryExecuted $event) {
                $request = $this->app->request;
                \Log::warning("[DB Query]  {$request->method()}::/{$request->path()} >>",[
                    'request_id'=>$request->header()['x-request-id'][0] ?? "",
                    'sql' => $query->sql,
                    'binding' => $query->bindings,
                    'time' => $query->time,
                ]);
            });
        }

        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
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
                __DIR__.'/../config/swagger.php' => config_path('l5-swagger.php'),
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
            ModelImportGenerator::class,
            ActivateGenerator::class,
            OpenAIGenerator::class
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
            'command.apitoolz.import',
            'command.apitoolz.activate'
        ];
    }
}
