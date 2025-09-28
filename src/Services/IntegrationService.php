<?php

namespace Sawmainek\Apitoolz\Services;

use Sawmainek\Apitoolz\Models\Integration;
use Sawmainek\Apitoolz\Integrations\PluginManager;
use Sawmainek\Apitoolz\Integrations\WorkflowRunner;

class IntegrationService
{
    protected PluginManager $plugins;

    public function __construct()
    {
        $this->plugins = new PluginManager();
    }

    /**
     * Run a workflow step or start from the first step
     */
    public function runWorkflow(string $slug, string $stepId = null, array $context = [])
    {
        $workflow = Integration::firstWhere('slug', $slug);
        $runner = new WorkflowRunner($workflow->definition, $this->plugins);

        // If stepId is provided, run that step only
        if ($stepId) {
            return $runner->runStep($stepId, $context);
        }

        // Otherwise, start from the first step
        $steps = $runner->getSteps();
        if (empty($steps)) {
            return [];
        }

        $firstStepId = $steps[0]['id'];
        return $runner->runStep($firstStepId, $context);
    }
}
