<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\ModelBuilder;
use Sawmainek\Apitoolz\DatatableBuilder;

class ModelCleanUpGenerator extends Command
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
    protected $signature = 'apitoolz:clean {--specified=} {--remove-table} {--force-delete}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean model based on provided model names or all.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Clean up model...');

        $models = [];
        if ($this->option('specified') != '') {
            $models = Model::whereIn('name', explode(',', $this->option('specified')))->get();
        } else {
            $models = Model::all();
        }
        foreach ($models as $model) {
            if ($this->option('remove-table'))
                DatatableBuilder::remove($model->table);
            if ($this->option('force-delete')) {
                $model->forceDelete();
            } else {
                $model->delete();
            }
            ModelBuilder::remove($model);
        }

        return $this->info("Successfully deleted all model.");
    }

}
