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
        if ($startDate) $query->where("{$model->getTable()}.created_at", '>=', Carbon::parse($startDate));
        if ($endDate) $query->where("{$model->getTable()}.created_at", '<=', Carbon::parse($endDate));

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

            case 'chart': {
                $column = $widget['column'] ?? 'id';
                $aggregate = $widget['aggregate'] ?? 'count';

                // Use group_model and group_label if provided
                if (!empty($widget['group_model']) && !empty($widget['group_label']) && !empty($widget['group_by'])) {
                    $groupField = $widget['group_by'];
                    $relatedModel = "\\App\\Models\\" . $widget['group_model'];
                    $labelColumn = $widget['group_label'];

                    // Infer table name from model (you can make this more robust if needed)
                    $relatedInstance = new $relatedModel;
                    $relatedTable = $relatedInstance->getTable();

                    $query->leftJoin($relatedTable, "{$model->getTable()}.{$groupField}", '=', "{$relatedTable}.id")
                        ->selectRaw("{$relatedTable}.{$labelColumn} as label, $aggregate({$model->getTable()}.{$column}) as value")
                        ->groupBy('label')
                        ->orderByRaw("MIN({$model->getTable()}.created_at)");

                    if (!empty($widget['limit'])) {
                        $query->limit((int)$widget['limit']);
                    }

                    $data = $query->pluck('value', 'label')->toArray();

                    return [
                        'type' => 'chart',
                        'chartType' => $widget['chart_type'] ?? 'bar',
                        'title' => $widget['title'],
                        'labels' => array_keys($data),
                        'data' => array_values($data),
                    ];
                }

                // Fallback to raw group_by (e.g., DATE(created_at), category_id, etc.)
                $groupBy = $widget['group_by'] ?? "DATE(created_at)";

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
            }


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

    public function resolveAllWidgets(array $widgets = [], ?string $startDate = null, ?string $endDate = null): array
    {
        return collect($widgets)->map(function ($widget) use ($startDate, $endDate) {
            return $this->resolveWidgetData($widget, $startDate, $endDate);
        })->toArray();
    }
}
