<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\APIToolzGenerator;

class CreateWorkflowGenerator extends Command
{
    /**
     * The name and signature of the console command.
     *
     * Usage: php artisan apitoolz:workflow {name}
     *
     * @var string
     */
    protected $signature = 'apitoolz:workflow {name : The name of the workflow}
        {--desc= : Describe the workflow}
        {--use-ai : }';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new workflow YAML definition';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $name = $this->argument('name');
        $definition = APIToolzGenerator::madeWorkflow($this->option('desc'));
    }
}
