<?php
namespace Sawmainek\Apitoolz\Factory;

use Sawmainek\Apitoolz\Widgets\ChartWidget;
use Sawmainek\Apitoolz\Widgets\KpiWidget;
use Sawmainek\Apitoolz\Widgets\ProgressWidget;

class WidgetFactory
{
    public static function make(array $config)
    {
        return match ($config['type']) {
            'kpi' => new KpiWidget($config),
            'chart' => new ChartWidget($config),
            'progress' => new ProgressWidget($config),
            'position' => $config['position'],
            default => throw new \InvalidArgumentException("Unknown widget type: {$config['type']}"),
        };
    }
}
