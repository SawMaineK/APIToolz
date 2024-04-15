<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\ModelConfigUtils;
use Sawmainek\Apitoolz\ModelBuilder;

class RestfulAPIGenerator extends Command
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
    protected $signature = 'apitoolz:generate {model} {--table=} {--desc=} {--type=} {--auth=false} {--two_factor=false}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate Restful API based on provided model.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating Restful API...');

        $name = $this->argument('model');
        if(ModelConfigUtils::checkAvailableName($name)) {
            $this->error("This model name [$name] can not use.");
            return;
        }
        $table = $this->option('table');
        if($table == null)
            $table = $this->ask('What is table name?');

        if(!ModelConfigUtils::hasTable($table)) {
            $this->error("The $table table not found. Please create $table table migration first.");
            return;
        }
 
        $this->info("Provided model name is $name");
        $this->info("$name model will create with $table");
        $model = Model::where('slug', \Str::slug($name, '-'))->first();
        if (!$model) {
            $model = new  Model();
            $model->name = \Str::studly($name);
            $model->slug = \Str::slug($name, '-');
            $model->title = $name;
            $model->desc = $this->option('desc');
            $model->table = $table;
            $model->key = ModelConfigUtils::findPrimaryKey($table);
            $model->type = $this->option('type'); //"1" for Ready Only
            $model->auth = $this->option('auth') ?? 1;
            $model->two_factor = $this->option('two_factor') ? 1 : 0;
            $model->save();

            ModelBuilder::build($model);
            $this->info("This $name model has created successfully.");
        } else {
            $model->delete();
            $this->error("This $name model is already used.");
        }
    }

}
