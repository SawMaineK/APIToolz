<?php

namespace Sawmainek\Apitoolz\Widgets;

class KpiWidget extends BaseWidget
{
    public string $method;
    public ?string $column;

    public function __construct(array $config)
    {
        parent::__construct($config);
        $this->method = $config['method'] ?? 'count';
        $this->column = $config['column'] ?? null;
    }

    public function toArray(): array
    {
        return [
            'type' => $this->type,
            'title' => $this->title,
            'icon' => $this->icon,
            'model' => $this->model,
            'method' => $this->method,
            'column' => $this->column,
        ];
    }
}
