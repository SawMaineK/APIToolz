<?php
namespace Sawmainek\Apitoolz\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ObserverServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $observerPath = app_path('Observers');
        $observerNamespace = 'App\\Observers\\';

        // You can list multiple model namespaces to check
        $modelNamespaces = [
            'Sawmainek\\Apitoolz\\Models\\',
            'App\\Models\\', // fallback if needed
        ];

        $files = File::allFiles($observerPath);

        foreach ($files as $file) {
            $relativePath = str_replace($observerPath . DIRECTORY_SEPARATOR, '', $file->getPathname());
            $className = str_replace(['/', '.php'], ['\\', ''], $relativePath);
            $fullObserverClass = $observerNamespace . $className;

            if (!Str::endsWith($className, 'Observer')) {
                continue;
            }

            $modelBase = Str::replaceLast('Observer', '', class_basename($className));

            foreach ($modelNamespaces as $modelNamespace) {
                $modelClass = $modelNamespace . $modelBase;

                if (class_exists($modelClass) && class_exists($fullObserverClass)) {
                    $modelClass::observe($fullObserverClass);
                    break; // stop checking other namespaces if found
                }
            }
        }
    }
}
