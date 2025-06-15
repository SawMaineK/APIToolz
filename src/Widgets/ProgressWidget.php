<?php

namespace Sawmainek\Apitoolz\Widgets;

class ProgressWidget extends BaseWidget
{
    public string $valueMethod;
    public string $valueColumn;
    public ?string $unit;

    public function __construct(array $config)
    {
        parent::__construct($config);
        $this->valueMethod = $config['value_method'];
        $this->valueColumn = $config['value_column'];
        $this->unit = $config['unit'] ?? '';
    }

    public function toArray(): array
    {
        return [
            'type' => $this->type,
            'title' => $this->title,
            'value_method' => $this->valueMethod,
            'value_column' => $this->valueColumn,
            'unit' => $this->unit,
            'model' => $this->model,
        ];
    }
}
