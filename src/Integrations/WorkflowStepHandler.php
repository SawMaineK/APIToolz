<?php

namespace Sawmainek\Apitoolz\Integrations;

interface WorkflowStepHandler
{
    public function handle(array $step, array $context = []): mixed;
}
