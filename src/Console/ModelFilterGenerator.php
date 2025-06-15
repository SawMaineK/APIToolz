<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\FilterBuilder;

class ModelFilterGenerator extends Command
{
    public function __construct()
    {
        parent::__construct();
    }
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'apitoolz:filter {model} {--title=} {--filter-type=} {--filter-model=} {--filter-query=} {--filter-value=} {--filter-label=} {--filter-key=} {--remove} {--force} {--doc}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Allow to add filter for model.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('doc')) {
            $this->printDocumentation();
            return;
        }

        $this->info('Adding filter in data table...');

        $name = $this->argument('model');
        $model = Model::where('name', $name)->first();
        if($model) {
            $roles = [
                'title' => 'required|alpha_dash|min:3',
            ];
            if(!$this->option('remove')) {
                $roles = array_merge($roles, [
                    'filter_type' => 'required|in:select,checkbox,radio',
                    'filter_model' => 'nullable|exists:Sawmainek\Apitoolz\Models\Model,name',
                    'filter_label' => $this->option('filter-model') ? 'required' : 'nullable',
                    'filter_value' => $this->option('filter-model') ? 'required' : 'nullable',
                    'filter_query' => !$this->option('filter-model') ? 'required' : 'nullable',
                    'filter_key' => 'required'
                ]);
            }
            $data = [
                'title' => $this->option('title'),
                'filter_type' => $this->option('filter-type'),
                'filter_model' => $this->option('filter-model'),
                'filter_label' => $this->option('filter-label'),
                'filter_value' => $this->option('filter-value'),
                'filter_query' => $this->option('filter-query'),
                'filter_key' => $this->option('filter-key')
            ];
            $validator = \Validator::make($data, $roles);
            if ($validator->fails()) {

                foreach($validator->errors()->messages() as $key => $err) {
                    $this->error($err[0]);
                }
                return;
            }
            if($this->option('remove')) {
                FilterBuilder::build($model, $data, $this->option('force'), $this->option('remove'));
                return $this->info("The {$this->option('title')} filter has removed successfully.");
            } else {
                FilterBuilder::build($model, $data, $this->option('force'));
                return $this->info("The {$this->option('title')} filter has created successfully.");
            }

        } else {
            $this->error("This $name model not found.");
        }

    }

    protected function printDocumentation()
    {
        $this->info("📘 API Toolz Filter Generator Documentation");
        $this->line("");
        $this->line("Usage:");
        $this->line("  php artisan apitoolz:filter {model} [options]");
        $this->line("");
        $this->line("Arguments:");
        $this->line("  model                  The name of the model to add/remove filters to.");
        $this->line("");
        $this->line("Options:");
        $this->line("  --title               Title of the filter (used as label/display).");
        $this->line("  --filter-type         Type of filter input (select, checkbox, radio).");
        $this->line("  --filter-model        Related model name for dynamic filter options.");
        $this->line("  --filter-query        Static query string (used when filter-model not provided).");
        $this->line("  --filter-label        Field to use as label in related model.");
        $this->line("  --filter-value        Field to use as value in related model.");
        $this->line("  --filter-key          Key used to apply the filter on the model.");
        $this->line("  --remove              Remove the specified filter.");
        $this->line("  --force               Overwrite existing filter if already exists.");
        $this->line("  --doc                 Show this documentation.");
        $this->line("");
        $this->info("Examples:");
        $this->line("  php artisan apitoolz:filter Product --title=Category --filter-type=select --filter-model=Category --filter-label=name --filter-value=id --filter-key=category_id");
        $this->line("  php artisan apitoolz:filter Product --title=Status --filter-type=radio --filter-query='pending:Panding|success:Success|failed:Failed' --filter-key=status");
        $this->line("  php artisan apitoolz:filter Product --title=Status --remove");
    }

}
