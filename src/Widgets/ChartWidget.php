<?php

namespace Sawmainek\Apitoolz\Widgets;

class ChartWidget extends BaseWidget
{
    public string $chartType;
    public string $groupBy;
    public ?string $groupModel;
    public ?string $groupLabel;
    public string $aggregate;
    public string $column;
    public ?string $where;
    public ?int $limit = null;

    public function __construct(array $config)
    {
        parent::__construct($config);
        $this->chartType = $config['chart_type'];
        $this->groupBy = $config['group_by'];
        $this->groupModel = $config['group_model'] ?? null;
        $this->groupLabel = $config['group_label'] ?? 'name';
        $this->aggregate = $config['aggregate'];
        $this->column = $config['column'] ?? 'id';
        $this->where = $config['where'] ?? null;
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
            'group_model' => $this->groupModel,
            'group_label' => $this->groupLabel,
            'aggregate' => $this->aggregate,
            'column' => $this->column,
            'where'  => $this->where,
            'limit' => $this->limit,
            'model' => $this->model,
        ];
    }
}
