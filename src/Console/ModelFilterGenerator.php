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
    protected $signature = 'apitoolz:filter {model} {--title=} {--filter-type=} {--filter-model=} {--filter-query=} {--filter-value=} {--filter-label=} {--filter-key=} {--remove} {--force}';

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
                    'filter_lable' => $this->option('filter-model') ? 'required' : 'nullable',
                    'filter_value' => $this->option('filter-model') ? 'required' : 'nullable',
                    'filter_query' => !$this->option('filter-model') ? 'required' : 'nullable',
                    'filter_key' => 'required'
                ]);
            }
            $data = [
                'title' => $this->option('title'),
                'filter_type' => $this->option('filter-type'),
                'filter_model' => $this->option('filter-model'),
                'filter_lable' => $this->option('filter-label'),
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

}
