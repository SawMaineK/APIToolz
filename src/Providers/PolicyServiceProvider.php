<?php

namespace Sawmainek\Apitoolz\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class PolicyServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->registerPolicies();

        $policyPath = app_path('Policies');

        if (!File::exists($policyPath)) {
            File::makeDirectory($policyPath, 0755, true);
        }

        $policyNamespace = 'App\\Policies\\';

        // You can list multiple model namespaces to check
        $modelNamespaces = [
            'Sawmainek\\Apitoolz\\Models\\',
            'App\\Models\\', // fallback if needed
        ];

        $files = File::allFiles($policyPath);

        foreach ($files as $file) {
            $relativePath = str_replace($policyPath . DIRECTORY_SEPARATOR, '', $file->getPathname());
            $className = str_replace(['/', '.php'], ['\\', ''], $relativePath);
            $fullPolicyClass = $policyNamespace . $className;

            if (!Str::endsWith($className, 'Policy')) {
                continue;
            }

            $modelBase = Str::replaceLast('Policy', '', class_basename($className));

            foreach ($modelNamespaces as $modelNamespace) {
                $modelClass = $modelNamespace . $modelBase;

                if (class_exists($modelClass) && class_exists($fullPolicyClass)) {
                    Gate::policy($modelClass, $fullPolicyClass);
                    break;
                }
            }
        }
    }
}
