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
        if (!empty($widget['where'])) {
            foreach (explode(',', $widget['where']) as $condition) {
                $condition = trim($condition);

                // ────────────────────────────────────────────────
                // Handle raw SQL expressions that contain MySQL-only
                // date helpers (MONTH, YEAR, CURDATE, NOW, …).
                // For SQLite we rewrite them with strftime()/date().
                // ────────────────────────────────────────────────
                if (
                    preg_match('/\b(MONTH|YEAR|DATE|CURDATE|NOW|DATEDIFF|COALESCE|ISNULL|IFNULL)\b/i', $condition) &&
                    !preg_match('/^([a-zA-Z0-9_]+)\s*[:=]\s*(.+)$/', $condition)    // not a key=value pair
                ) {
                    $driver = config('database.default');

                    if ($driver === 'sqlite') {
                        // Map common MySQL date functions to SQLite
                        $map = [
                            // MONTH(created_at)          → strftime('%m', created_at)
                            '/\bMONTH\s*\(\s*([^)]+)\)/i'     => "strftime('%m', \$1)",
                            // YEAR(created_at)           → strftime('%Y', created_at)
                            '/\bYEAR\s*\(\s*([^)]+)\)/i'      => "strftime('%Y', \$1)",
                            // DATE(created_at)           → date(created_at)
                            '/\bDATE\s*\(\s*([^)]+)\)/i'      => "date(\$1)",
                            // CURDATE()                  → date('now')
                            '/\bCURDATE\s*\(\s*\)/i'          => "date('now')",
                            // NOW()                      → datetime('now')
                            '/\bNOW\s*\(\s*\)/i'              => "datetime('now')",
                            // ISNULL(x, y)               → ifnull(x, y)
                            '/\bISNULL\s*\(/i'                => "ifnull(",
                            // DATEDIFF(a, b)             → CAST(julianday(a) - julianday(b) AS INTEGER)
                            '/\bDATEDIFF\s*\(\s*([^)]+?)\s*,\s*([^)]+?)\s*\)/i'
                                => "CAST(julianday(\\1) - julianday(\\2) AS INTEGER)",
                        ];
                        $condition = preg_replace(
                            array_keys($map),
                            array_values($map),
                            $condition
                        );
                    }

                    // MySQL (or already-rewritten SQLite) raw clause
                    $query->whereRaw($condition);
                    continue;
                }

                /* -------------------------------------------------
                * handle key[:=]expression syntax (null, in(), like(), >= etc.)
                * ------------------------------------------------ */
                if (preg_match('/^([^:=]+)\s*[:=]\s*(.+)$/', $condition, $matches)) {
                    $field      = trim($matches[1]);
                    $expression = trim($matches[2]);

                    // NULL / NOTNULL
                    if (in_array(strtolower($expression), ['null', 'notnull'])) {
                        strtolower($expression) === 'null'
                            ? $query->whereNull($field)
                            : $query->whereNotNull($field);
                        continue;
                    }

                    // IN(...)
                    if (preg_match('/^in\((.+)\)$/i', $expression, $in)) {
                        $values = array_map('trim', explode(',', $in[1]));
                        $query->whereIn($field, $values);
                        continue;
                    }

                    // LIKE(...)
                    if (preg_match('/^like\((.+)\)$/i', $expression, $like)) {
                        $query->where($field, 'like', '%' . $like[1] . '%');
                        continue;
                    }

                    // Comparison operators (>=, <=, !=, =, <, >)
                    if (preg_match('/^(>=|<=|!=|=|<|>)(.+)$/', $expression, $op)) {
                        $operator = $op[1];
                        $value    = trim($op[2]);
                        if (is_numeric($value)) $value += 0; // cast numeric strings
                        $query->where($field, $operator, $value);
                        continue;
                    }

                    // Simple equality
                    $query->where($field, $expression);
                }
            }
        }
        // Date filters
        if ($startDate)
            $query->where("{$model->getTable()}.created_at", '>=', Carbon::parse($startDate));
        if ($endDate)
            $query->where("{$model->getTable()}.created_at", '<', Carbon::parse($endDate)->addDay());

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
                $driver = \DB::getDriverName();

                // Use group_model and group_label if provided
                if (!empty($widget['group_model']) && !empty($widget['group_label']) && !empty($widget['group_by'])) {
                    $groupField = $widget['group_by'];
                    $relatedModel = "\\App\\Models\\" . $widget['group_model'];
                    $labelColumn = $widget['group_label'];

                    $relatedInstance = new $relatedModel;
                    $relatedTable = $relatedInstance->getTable();

                    $query->leftJoin($relatedTable, "{$model->getTable()}.{$groupField}", '=', "{$relatedTable}.id")
                        ->selectRaw("{$relatedTable}.{$labelColumn} as label, $aggregate({$model->getTable()}.{$column}) as value")
                        ->groupBy('label')
                        ->orderByRaw("MIN({$model->getTable()}.created_at)");

                    if (!empty($widget['limit'])) {
                        $query->limit((int) $widget['limit']);
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
                $groupBy = $widget['group_by'] ?? ($driver === 'sqlite' ? "date(created_at)" : "DATE(created_at)");

                if ($driver === 'sqlite') {
                    $groupBy = match (true) {
                        isset($widget['group_by']) && preg_match('/^MONTH\((.+)\)$/i', $widget['group_by']) => "strftime('%m', $1)",
                        isset($widget['group_by']) && preg_match('/^YEAR\((.+)\)$/i', $widget['group_by']) => "strftime('%Y', $1)",
                        default => $groupBy,
                    };
                }

                $chartQuery = $query->selectRaw("$groupBy as label, $aggregate($column) as value")
                    ->groupBy('label')
                    ->orderByRaw("MIN(created_at)");

                if (!empty($widget['limit'])) {
                    $chartQuery->limit((int) $widget['limit']);
                }

                // Format label if grouping by month
                if (isset($widget['group_by']) && preg_match('/^MONTH\((.+)\)$/i', $widget['group_by'])) {
                    $data = $chartQuery->get(['label', 'value'])->mapWithKeys(function ($item) use ($model, $startDate, $endDate, $driver) {
                        $month = $item->label;

                        $dateQuery = $model->newQuery();
                        if ($startDate) $dateQuery->where('created_at', '>=', Carbon::parse($startDate));
                        if ($endDate) $dateQuery->where('created_at', '<=', Carbon::parse($endDate));

                        if ($driver === 'sqlite') {
                            $dateQuery->whereRaw("strftime('%m', created_at) = ?", [$month]);
                            $year = $dateQuery->min(\DB::raw("strftime('%Y', created_at)")) ?? date('Y');
                        } else {
                            $dateQuery->whereRaw("MONTH(created_at) = ?", [$month]);
                            $year = $dateQuery->min(\DB::raw('YEAR(created_at)')) ?? date('Y');
                        }

                        $label = Carbon::createFromDate($year, $month, 1)->format('F, Y');
                        return [$label => $item->value];
                    })->toArray();

                    $chartQuery = null;
                } else {
                    $data = $chartQuery->pluck('value', 'label')->toArray();
                }

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
                if ($startDate)
                    $valueQuery->where('created_at', '>=', Carbon::parse($startDate));
                if ($endDate)
                    $valueQuery->where('created_at', '<=', Carbon::parse($endDate));

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
