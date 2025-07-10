<?php

namespace Sawmainek\Apitoolz;

use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\DB;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Database\Connection;
use Sawmainek\Apitoolz\Console\BrandingGenerator;
use Sawmainek\Apitoolz\Console\ModelBuilderGenerator;
use Sawmainek\Apitoolz\Console\ModelFilterGenerator;
use Sawmainek\Apitoolz\Console\ModelRebuildGenerator;
use Sawmainek\Apitoolz\Console\ModelSeederGenerator;
use Sawmainek\Apitoolz\Console\ModelSummaryGenerator;
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
use Sawmainek\Apitoolz\Console\ModelCleanUpGenerator;
use Sawmainek\Apitoolz\Console\ReactAppGenerator;
use Sawmainek\Apitoolz\Models\AppSetting;


class APIToolzServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton('command.apitoolz:react-project', function ($app) {
            return $app->make(ReactAppGenerator::class);
        });

        $this->app->singleton('command.apitoolz:build', function ($app) {
            return $app->make(ModelBuilderGenerator::class);
        });

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

        $this->app->singleton('command.apitoolz:filter', function ($app) {
            return $app->make(ModelFilterGenerator::class);
        });

        $this->app->singleton('command.apitoolz:summary', function ($app) {
            return $app->make(ModelSummaryGenerator::class);
        });

        $this->app->singleton('command.apitoolz:seeder', function ($app) {
            return $app->make(ModelSeederGenerator::class);
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

        $this->app->singleton('command.apitoolz:rebuild', function ($app) {
            return $app->make(ModelRebuildGenerator::class);
        });

        $this->app->singleton('command.apitoolz:branding', function ($app) {
            return $app->make(BrandingGenerator::class);
        });

        $this->app->singleton('command.apitoolz:clean', function ($app) {
            return $app->make(ModelCleanUpGenerator::class);
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
            $this->app[Kernel::class]->pushMiddleware(RequestLogger::class);
            $this->app[Kernel::class]->pushMiddleware(ResponseLogger::class);

            // DB::listen(function (QueryExecuted $query) {
            //     $request = $this->app->request;
            //     if( \Str::startsWith($request->path(), 'api/')) {
            //         \Log::info("[DB Query]  {$request->method()}::/{$request->path()} >>",[
            //             'request_id'=>$request->header()['x-request-id'][0] ?? "",
            //             'sql' => $query->sql,
            //             'binding' => $query->bindings,
            //             'time' => $query->time,
            //         ]);
            //     }
            // });

            DB::whenQueryingForLongerThan(500, function (Connection $connection, QueryExecuted $event) {
                $request = $this->app->request;
                \Log::warning("[DB Query]  {$request->method()}::/{$request->path()} >>",[
                    'request_id'=>$request->header()['x-request-id'][0] ?? "",
                    'sql' => $event->sql,
                    'binding' => $event->bindings,
                    'time' => $event->time,
                ]);
            });
        }

        try {
            DB::connection()->getPdo();
            $branding = optional(
            AppSetting::where('key', 'default_settings')->first()
            )->branding ?? [];
        } catch (\Exception $e) {
            $branding = [];
        }

        View::share('branding', $branding);

        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
        $this->loadRoutesFrom(__DIR__.'/../routes/api.php');
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'apitoolz');
        $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');
        $this->registerSeeders();
        if ($this->app->runningInConsole()) {
            // Publish config
            $this->publishes([
                __DIR__.'/../config/config.php' => config_path('apitoolz.php'),
                __DIR__.'/../config/swagger.php' => config_path('l5-swagger.php'),
                __DIR__.'/../src/Observers/UserObserver.php' => app_path('Observers/UserObserver.php'),
                __DIR__.'/../src/Jobs/NotifyUserUpdateJob.php' => app_path('Jobs/NotifyUserUpdateJob.php')
            ], 'apitoolz-config');
            // Publish views
            $this->publishes([
              __DIR__.'/../resources/views' => resource_path('views/vendor/apitoolz'),
            ], 'apitoolz-views');
            // Publish ui views
            $this->publishes([
                __DIR__.'/../dist/media' => public_path('media'),
                __DIR__.'/../dist/assets' => public_path('assets'),
                __DIR__.'/../dist/index.html' => resource_path('views/vendor/apitoolz/app.blade.php'),
            ], 'apitoolz-ui');
            $this->addProviderToBootstrap();
        }
        // Register the command if we are using the application via the CLI
        $this->commands([
            ReactAppGenerator::class,
            ModelBuilderGenerator::class,
            ModelGenerator::class,
            DatatableGenerator::class,
            RequestBodyConfigGenerator::class,
            ResponseConfigGenerator::class,
            ModelRelationGenerator::class,
            ModelFilterGenerator::class,
            ModelSummaryGenerator::class,
            ModelSeederGenerator::class,
            ModelExportGenerator::class,
            ModelImportGenerator::class,
            ActivateGenerator::class,
            ModelCleanUpGenerator::class,
            ModelRebuildGenerator::class,
            BrandingGenerator::class,
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
            'command.apitoolz:react-project',
            'command.apitoolz.build',
            'command.apitoolz.model',
            'command.apitoolz.datatable',
            'command.apitoolz.request',
            'command.apitoolz.response',
            'command.apitoolz.relation',
            'command.apitoolz.filter',
            'command.apitoolz.summary',
            'command.apitoolz.seeder',
            'command.apitoolz.export',
            'command.apitoolz.import',
            'command.apitoolz.activate',
            'command.apitoolz.clean',
            'command.apitoolz.rebuild',
            'command.apitoolz.branding',
            'command.apitoolz.ai'
        ];
    }

    /**
     * Register seeders manually.
     */
    protected function registerSeeders(): void
    {
        if ($this->app->runningInConsole()) {
            $seedersPath = __DIR__ . '/../database/seeders';
            foreach (glob($seedersPath . '/*.php') as $seederFile) {
                require_once $seederFile;
            }
        }
    }

    protected function addProviderToBootstrap()
    {
        $providersFile = base_path('bootstrap/providers.php');
        $apiFile = base_path('routes/api.php');

        if (!file_exists($apiFile)) {
            file_put_contents($apiFile, "<?php\n\n");
        }

        if (file_exists($providersFile)) {
            $providers = require $providersFile;

            // Ensure $providers is an array
            if (!is_array($providers)) {
                \Log::error('Expected $providers to be an array but got: ' . gettype($providers));
                return;
            }

            $routeProvider = \Sawmainek\Apitoolz\Providers\RouteServiceProvider::class;
            $permissionProvider = \Sawmainek\Apitoolz\Providers\PermissionMiddlewareServiceProvider::class;
            $observerProvider = \Sawmainek\Apitoolz\Providers\ObserverServiceProvider::class;
            $policyProvider = \Sawmainek\Apitoolz\Providers\PolicyServiceProvider::class;

            if (!in_array($routeProvider, $providers)) {
                $providers[] = $routeProvider;
            }

            if (!in_array($permissionProvider, $providers)) {
                $providers[] = $permissionProvider;
            }

            if (!in_array($observerProvider, $providers)) {
                $providers[] = $observerProvider;
            }

            if (!in_array($policyProvider, $providers)) {
                $providers[] = $policyProvider;
            }

            file_put_contents($providersFile, "<?php\n\nreturn " . var_export($providers, true) . ";\n");
        }
    }
}
