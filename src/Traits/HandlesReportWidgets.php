<?php
namespace Sawmainek\Apitoolz\Traits;

use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

trait HandlesReportWidgets
{
    public function resolveWidgetData(array $widget, ?string $startDate = null, ?string $endDate = null): array
    {
        $modelClass = "\\App\\Models\\{$widget['model']}";
        $model = new $modelClass;
        $query = $model->newQuery();

        // Date filters
        if ($startDate) $query->where('created_at', '>=', Carbon::parse($startDate));
        if ($endDate) $query->where('created_at', '<=', Carbon::parse($endDate));

        switch ($widget['type']) {
            case 'kpi':
                $value = $widget['method'] === 'sum'
                    ? $query->sum($widget['column'])
                    : $query->{$widget['method']}($widget['column'] ?? '*');

                return [
                    'type' => 'kpi',
                    'title' => $widget['title'],
                    'icon' => $widget['icon'] ?? 'bar-chart',
                    'value' => $value,
                ];

            case 'chart':
                $groupBy = $widget['group_by'] ?? "DATE_FORMAT(created_at, '%Y-%m')";
                $column = $widget['column'] ?? 'id';
                $aggregate = $widget['aggregate'] ?? 'count';

                $chartQuery = $query->selectRaw("$groupBy as label, $aggregate($column) as value")
                    ->groupBy('label')
                    ->orderByRaw("MIN(created_at)");

                if (!empty($widget['limit'])) {
                    $chartQuery->limit((int)$widget['limit']);
                }

                $data = $chartQuery->pluck('value', 'label')->toArray();

                return [
                    'type' => 'chart',
                    'chartType' => $widget['chart_type'] ?? 'bar',
                    'title' => $widget['title'],
                    'labels' => array_keys($data),
                    'data' => array_values($data),
                ];

            case 'progress':
                $max = $query->{$widget['max_method'] ?? 'count'}();

                $valueQuery = $model->newQuery();
                if ($startDate) $valueQuery->where('created_at', '>=', Carbon::parse($startDate));
                if ($endDate) $valueQuery->where('created_at', '<=', Carbon::parse($endDate));

                $valueColumn = $widget['value_column'] ?? 'id';
                $valueMethod = $widget['value_method'] ?? 'whereNotNull';
                $value = $valueQuery->{$valueMethod}($valueColumn)->count();

                return [
                    'type' => 'progress',
                    'title' => $widget['title'],
                    'value' => $value,
                    'max' => $max,
                    'unit' => $widget['unit'] ?? '',
                ];

            default:
                return [
                    'type' => 'error',
                    'title' => $widget['title'],
                    'message' => 'Unknown widget type',
                ];
        }
    }

    public function resolveAllWidgets(array $widgets, ?string $startDate = null, ?string $endDate = null): array
    {
        return collect($widgets)->map(function ($widget) use ($startDate, $endDate) {
            return $this->resolveWidgetData($widget, $startDate, $endDate);
        })->toArray();
    }
}
