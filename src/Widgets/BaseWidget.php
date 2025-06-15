<?php

namespace Sawmainek\Apitoolz\Widgets;

use Sawmainek\Apitoolz\Contracts\ReportWidget;

abstract class BaseWidget implements ReportWidget
{
    public string $type;
    public string $title;
    public string $model;
    public ?string $icon = null;

    public function __construct(array $config)
    {
        $this->type = $config['type'];
        $this->title = $config['title'];
        $this->model = $config['model'];
        $this->icon = $config['icon'] ?? null;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getModel(): string
    {
        return $this->model;
    }

    public function getIcon(): ?string
    {
        return $this->icon;
    }

    abstract public function toArray(): array;
}
