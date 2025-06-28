<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\Facades\ModelConfigUtils;
use Sawmainek\Apitoolz\ModelBuilder;
use Sawmainek\Apitoolz\DatatableBuilder;
use Sawmainek\Apitoolz\APIToolzGenerator;
use Spatie\Permission\Models\Role;

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
    protected $signature = 'apitoolz:model {model : The name of the model}
        {--update : Update an existing model}
        {--table= : Table name for the model}
        {--title= : Model title (default: model name)}
        {--desc= : Model description (default: empty)}
        {--type= : Model type (e.g., readonly, normal)}
        {--use-auth : Enable authentication support}
        {--use-roles= : Specify roles for this model}
        {--use-policy : Generate and register policy}
        {--use-observer : Generate model observer}
        {--use-hook= : Add model lifecycle hook}
        {--soft-delete : Enable soft deletes}
        {--sql= : SQL to generate the table}
        {--lock= : Lock specific components (comma-separated: request,controller,service,model,resource)}
        {--force : Force override or create actions}
        {--use-ai-configuration : Use AI to build model configuration}
        {--ask= : Optional input to be provided interactively}
        {--rebuild : Rebuild an existing model\'s resources}
        {--remove : Remove the model}
        {--add-menu : Add this model to the menu}
        {--remove-table : Drop the related table}
        {--force-delete : Hard delete the model from the DB}
        {--doc : Show this documentation}';

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
        if ($this->option('doc')) {
            $this->printDocumentation();
            return;
        }

        $this->info('Generating Restful API...');

        $name = $this->argument('model');
        $this->info("Provided model name is $name");

        if(ModelConfigUtils::checkAvailableName($name)) {
            $this->error("This model name [$name] can not use.");
            return;
        }

        $table = $this->option('table');
        if($table == null && !$this->option('update') && !$this->option('rebuild') && !$this->option('remove'))
            $table = $this->ask('What is table name?');

        if(!\Schema::hasTable($table)
            && !$this->option('update')
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
                    $askAi = $this->ask("Would you like to create $table table with our AI? (yes/no)", 'yes');
                    if($askAi) {
                        $results = APIToolzGenerator::askSolution("Give create SQL table for $table, table names as $table.");
                        if($results->{$table}) {
                            DatatableBuilder::buildWithSql($table, $results->{$table}->tables[0], $this->option('soft-delete'));
                            $this->info("The $table table has created successfully.");
                        } else{
                            return $this->error("Sorry, We could not create for $table table.");
                        }
                    } else {
                        $fields = $this->askTableField();
                        DatatableBuilder::build($table, $fields, $this->option('soft-delete'));
                        $this->info("The $table table has created successfully.");
                    }
                }

            } else {
                $this->info("Process abort...");
                return;
            }
        }
        if ($this->option('use-roles')) {
            $roles = explode(',', $this->option('use-roles'));
            foreach ($roles as $roleName) {
                $roleName = trim($roleName);
                Role::updateOrCreate(['name' => $roleName], ['name' => $roleName, 'guard_name' => 'sanctum']);
            }
        }
        $model = Model::where('name', \Str::studly($name, '-'))->first();
        if (!$model) {
            if($this->option('remove')) {
                return $this->warn("This $name model is alreay deleted.");
            }
            $model = new  Model();
            $model->name = \Str::studly($name);
            $model->slug = \Str::slug($name, '-');
            $model->title = \Str::title($this->option('title') ?? $name);
            $model->desc = $this->option('desc') ?? "";
            $model->table = $table;
            $model->key = ModelConfigUtils::findPrimaryKey($table);
            $model->type = $this->option('type'); //"1" for Ready Only
            $model->auth = $this->option('use-auth');
            $model->roles = $this->option('use-roles');
            $model->two_factor = 0;
            $model->save();

            ModelBuilder::build($model, $this->option('use-policy'), $this->option('use-observer'), $this->option('use-hook'), $this->option('soft-delete'));
            if($this->option('use-ai-configuration')) {
                $this->info('Building for model configuration...');
                ModelBuilder::buildConfiguration($model, $this->option('ask') ?? "");
            }
            if($this->option('add-menu')) {
                $this->info('Building for menu configuration...');
                ModelBuilder::buildMenuConfigure($model);
            }
            $this->info("This $name model has created successfully.");
        } else {
            if($this->option('force')) {
                ModelBuilder::build($model, $this->option('use-policy'), $this->option('use-observer'), $this->option('use-hook'), $this->option('soft-delete'));
            } else if($this->option('update')) {
                if($this->option('type')) {
                    $model->type = $this->option('type'); //"1" for Ready Only
                }
                if($this->option('use-auth')) {
                    $model->auth = $this->option('use-auth');
                }
                if($this->option('use-roles')) {
                    $model->roles = $this->option('use-roles');
                }
                if($this->option('lock')) {
                    $lockOptions = ['request', 'controller', 'service', 'model', 'resource'];
                    $lock = explode(",", $this->option('lock'));
                    $model->lock = array_filter($lock, function ($item) use ($lockOptions) {
                        return in_array($item, $lockOptions);
                    });
                }
                $model->title = $this->option('title') ?? $model->title;
                $model->desc = $this->option('desc') ?? $model->description;
                $model->update();
                ModelBuilder::build($model, $this->option('use-policy'), $this->option('use-observer'), $this->option('use-hook'), $this->option('soft-delete'));
                if($this->option('use-ai-configuration')) {
                    $this->info('Building for model configuration...');
                    ModelBuilder::buildConfiguration($model, $this->option('ask') ?? "");
                }
                if($this->option('add-menu')) {
                    $this->info('Building for menu configuration...');
                    ModelBuilder::buildMenuConfigure($model);
                }
                return $this->info("This $name model update successfully.");
            } else if($this->option('rebuild')) {
                ModelBuilder::build($model);
                return $this->info("This $name model rebuild successfully.");
            } else if($this->option('remove')) {
                if($this->option('remove-table'))
                    DatatableBuilder::remove($model->table);
                if($this->option('force-delete')) {
                    $model->forceDelete();
                } else {
                    $model->delete();
                }
                ModelBuilder::remove($model);
                return $this->info("This $name model has deleted successfully.");
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

    protected function printDocumentation()
    {
        $this->info("📘 API Toolz Model Generator Documentation");
        $this->line("");
        $this->line("Usage:");
        $this->line("  php artisan apitoolz:model {model} [options]");
        $this->line("");
        $this->line("Arguments:");
        $this->line("  model                  The name of the model to generate.");
        $this->line("");
        $this->line("Options:");
        $this->line("  --table                Table name for the model.");
        $this->line("  --title                Model title (default: model name).");
        $this->line("  --desc                 Model description (default: empty).");
        $this->line("  --type                 Model type (e.g., readonly, normal).");
        $this->line("  --use-auth             Enable authentication support.");
        $this->line("  --use-roles            Specify roles for this model.");
        $this->line("  --use-policy           Generate and register policy.");
        $this->line("  --use-observer         Generate model observer.");
        $this->line("  --use-hook             Add model lifecycle hook.");
        $this->line("  --soft-delete          Enable soft deletes.");
        $this->line("  --sql                  SQL to generate the table.");
        $this->line("  --lock                 Lock specific components (comma-separated: request,controller,service,model,resource).");
        $this->line("  --force                Force override or create actions.");
        $this->line("  --update               Update an existing model.");
        $this->line("  --use-ai-configuration  Use AI to build model configuration.");
        $this->line("  --ask                  Optional input to be provided interactively.");
        $this->line("  --rebuild              Rebuild an existing model's resources.");
        $this->line("  --remove               Remove the model.");
        $this->line("  --remove-table         Drop the related table.");
        $this->line("  --force-delete         Hard delete the model from the DB.");
        $this->line("  --doc                  Show this documentation.");
        $this->line("");
        $this->info("Examples:");
        $this->line("  php artisan apitoolz:model User --table=users --use-auth --use-policy");
        $this->line("  php artisan apitoolz:model Product --remove --remove-table");
    }

}
