<?php

namespace Sawmainek\Apitoolz\Integrations;

use Sawmainek\Apitoolz\Integrations\Plugins\PluginInterface;
use Illuminate\Support\Facades\File;

class PluginManager
{
    protected array $plugins = [];

    public function __construct()
    {
        $this->discoverPlugins();
    }

    protected function discoverPlugins(): void
    {
        // Define multiple namespaces and corresponding paths
        $namespaces = [
            'App\\Integrations\\Plugins' => app_path('Integrations/Plugins'),
            'Sawmainek\\Apitoolz\\Integrations\\Plugins' => __DIR__ . '/Plugins',
        ];

        foreach ($namespaces as $namespace => $path) {
            if (!File::exists($path)) {
                continue;
            }

            foreach (File::allFiles($path) as $file) {
                $class = $namespace . "\\" . $file->getFilenameWithoutExtension();
                if (class_exists($class) && is_subclass_of($class, PluginInterface::class)) {
                    $type = $class::$type ?? strtolower(class_basename($class));
                    $this->plugins[$type] = $class;
                }
            }
        }
    }

    public function apply(array $pluginConfig, array $body, array $context): array
    {
        $type = $pluginConfig['type'];
        if (!isset($this->plugins[$type])) {
            throw new \Exception("Plugin type not supported: {$type}");
        }

        /** @var PluginInterface $plugin */
        $plugin = app($this->plugins[$type]);
        return $plugin->apply($pluginConfig, $body, $context);
    }
}
