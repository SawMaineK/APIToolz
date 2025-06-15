<?php

namespace Sawmainek\Apitoolz\Widgets;

class ChartWidget extends BaseWidget
{
    public string $chartType;
    public string $groupBy;
    public string $aggregate;
    public string $column;
    public ?int $limit = null;

    public function __construct(array $config)
    {
        parent::__construct($config);
        $this->chartType = $config['chart_type'];
        $this->groupBy = $config['group_by'];
        $this->aggregate = $config['aggregate'];
        $this->column = $config['column'] ?? 'id';
        $this->limit = $config['limit'] ?? null;
    }

    public function toArray(): array
    {
        return [
            'type' => $this->type,
            'title' => $this->title,
            'icon' => $this->icon,
            'chart_type' => $this->chartType,
            'group_by' => $this->groupBy,
            'aggregate' => $this->aggregate,
            'column' => $this->column,
            'limit' => $this->limit,
            'model' => $this->model,
        ];
    }
}
