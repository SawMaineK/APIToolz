<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\Facades\ModelConfigUtils;
use Sawmainek\Apitoolz\ModelBuilder;
use Sawmainek\Apitoolz\DatatableBuilder;

class ModelGenerator extends Command
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
    protected $signature = 'apitoolz:model {model} {--table=} {--type=} {--auth} {--use-policy} {--soft-delete} {--sql=} {--force} {--rebuild} {--remove} {--force-delete}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate Restful API model based on provided model name.';

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
        if($table == null && !$this->option('rebuild') && !$this->option('remove'))
            $table = $this->ask('What is table name?');

        if(!ModelConfigUtils::hasTable($table)
            && !$this->option('rebuild')
            && !$this->option('remove')) {
            $create = 'yes';
            if(!$this->option('force')) {
                $create = $this->ask("The $table table not found. Would you create $table table?(yes/no)",'yes');
            }
            if($create == 'yes' || $create == 'y') {
                if($this->option('sql') != '') {
                    DatatableBuilder::buildWithSql($table, $this->option('sql'), $this->option('soft-delete'));
                    $this->info("The $table table has created successfully.");
                } else {
                    $fields = $this->askTableField();
                    DatatableBuilder::build($table, $fields, $this->option('soft-delete'));
                    $this->info("The $table table has created successfully.");
                }

            } else {
                $this->info("Process abort...");
                return;
            }
        }

        $this->info("Provided model name is $name");
        $model = Model::where('slug', \Str::slug($name, '-'))->first();
        if (!$model) {
            $model = new  Model();
            $model->name = \Str::studly($name);
            $model->slug = \Str::slug($name, '-');
            $model->title = $name;
            $model->desc = "";
            $model->table = $table;
            $model->key = ModelConfigUtils::findPrimaryKey($table);
            $model->type = $this->option('type'); //"1" for Ready Only
            $model->auth = $this->option('auth');
            $model->two_factor = 0;
            $model->save();

            ModelBuilder::build($model, $this->option('use-policy'), $this->option('soft-delete'));
            $this->info("This $name model has created successfully.");
        } else {
            if($this->option('rebuild')) {
                ModelBuilder::build($model);
                return $this->info("This $name model rebuild successfully.");
            } else if($this->option('remove')) {
                if($this->option('force-delete')) {
                    $model->forceDelete();
                    ModelBuilder::remove($model);
                    return $this->info("This $name model has permanently deleted successfully.");
                } else {
                    $model->delete();
                    ModelBuilder::remove($model);
                    return $this->info("This $name model has deleted successfully.");
                }
            } else {
                $rebuild = $this->ask("This $name model already exist, you want to rebuild. (yes/no)", 'yes');
                if($rebuild == 'yes' || $rebuild == 'y') {
                    ModelBuilder::build($model);
                    return $this->info("This $name model rebuild successfully.");
                }
            }
            $this->error("This $name model is already used.");
        }
    }

    function askTableField()
    {
        $field['name'] = $this->ask("- What is field name? (name, age, etc..)");
        $field['type'] = $this->ask("- What is data type of {$field['name']}? (string, text, int, etc..)",'string');
        $field['null'] = $this->ask("- This {$field['name']} is nullable? (yes/no)",'yes');
        $more = $this->ask("Do you want to add more field? (yes/no)", 'no');
        if($more == 'yes' || $more == 'y') {
            $this->fields[] = $field;
            return $this->askTableField();
        } else {
            $this->fields[] = $field;
        }
        return $this->fields;
    }

}
