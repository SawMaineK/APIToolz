<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\ModelBuilder;

class ModelRebuildGenerator extends Command
{
    public $fields = [];
    public function __construct()
    {
        parent::__construct();
    }
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'apitoolz:rebuild {--model=} {--all}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Rebuild or manage API models and their database tables.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating RESTful API...');

        if ($this->option('all')) {
            foreach (Model::get() as $model) {
                ModelBuilder::build($model);
                $this->info("Model {$model->name} rebuild successfully.");
            }
            return $this->info("All model rebuild successfully.");
        } else {
            $name = $this->option('model');
            $model = Model::where('name', \Str::studly($name))->first();
            if (!$model) {
                return $this->error("This $name model does not exist");
            } else {
                ModelBuilder::build($model);
                return $this->info("This $name model rebuild successfully.");
            }
        }

    }

}
