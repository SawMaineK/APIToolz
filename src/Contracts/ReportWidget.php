<?php

namespace Sawmainek\Apitoolz\Contracts;

interface ReportWidget
{
    public function getType(): string;

    public function getTitle(): string;

    public function getModel(): string;

    public function getIcon(): ?string;

    public function toArray(): array;
}
