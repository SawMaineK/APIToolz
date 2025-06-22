<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\APIToolzGenerator;
use Sawmainek\Apitoolz\Models\AppSetting;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\ModelBuilder;
use Sawmainek\Apitoolz\Facades\ModelConfigUtils;
use Spatie\Permission\Models\Role;

class ModelImportGenerator extends Command
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
    protected $signature = 'apitoolz:import {--file=} {--template=} {--model=} {--exclude-data} {--doc}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import models, exclude data option or specify the provided model.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('doc')) {
            $this->printDocumentation();
            return;
        }
        $this->info('Model import start...');
        if($this->option('template')) {
            $downlaodPath = APIToolzGenerator::downloadTemplate($this->option('template'));
            $this->input->setOption('file', $downlaodPath);
        }
        if($this->option('file') && !file_exists($this->option('file'))) {
            $this->warn($this->option('file'));
            $this->error("Your imported file not found");
            return;
        }
        $zip = new \ZipArchive();
        $res = $zip->open($this->option('file'));
        $importPath = storage_path('apitoolz/imports/');
        $requestPath = "app/Http/Requests";
        $resourcePath = "app/Http/Resources";
        $controllerPath = "app/Http/Controllers";
        $servicePath = "app/Services";
        //$exportPath = "app/Exports";
        $modelPath = "app/Models";
        $policyPath = "app/Policies";
        $observerPath = "app/Observers";
        $hookPath = "app/Hooks";
        $migratePath = "database/migrations";
        if ($res === TRUE) {
            $zip->extractTo($importPath);
            if(file_exists("$importPath/appsettings.json")) {
                $appSettings = json_decode(file_get_contents("$importPath/appsettings.json"), associative: true) ?? [];
                foreach ($appSettings as $value) {
                    AppSetting::updateOrCreate(["key"=> $value['key']], ["value"=> $value]);
                }
            }
            $models = json_decode(file_get_contents("$importPath/models.json")) ?? [];
            if($this->option('model') != "") {
                $models = array_filter($models, fn($m) => $m->name === $this->option('model'));
            }
            \Schema::disableForeignKeyConstraints();
            foreach($models as $model) {
                $model = Model::updateOrCreate(['name'=>$model->name], (array)$model);
                if($model->roles) {
                    $roles = explode(',', $model->roles);
                    foreach($roles as $role) {
                        $roleName = trim($role);
                        Role::updateOrCreate(['name' => $roleName], ['name' => $roleName, 'guard_name' => 'sanctum']);
                    }
                }
                copy(storage_path("apitoolz/imports/$requestPath/{$model->name}Request.php"), base_path("$requestPath/{$model->name}Request.php"));
                copy(storage_path("apitoolz/imports/$resourcePath/{$model->name}Resource.php"), base_path("$resourcePath/{$model->name}Resource.php"));
                copy(storage_path("apitoolz/imports/$controllerPath/{$model->name}Controller.php"), base_path("$controllerPath/{$model->name}Controller.php"));
                copy(storage_path("apitoolz/imports/$servicePath/{$model->name}Service.php"), base_path("$servicePath/{$model->name}Service.php"));
                //copy(storage_path("apitoolz/imports/$exportPath/{$model->name}Export.php"), base_path("$exportPath/{$model->name}Export.php"));
                copy(storage_path("apitoolz/imports/$modelPath/{$model->name}.php"), base_path("$modelPath/{$model->name}.php"));
                $migrateFile = glob(storage_path("apitoolz/imports/$migratePath/*_create_{$model->table}_table.php"));
                $config = ModelConfigUtils::decryptJson($model->config);
                if($model->auth && $config['policy']) {
                    copy(storage_path("apitoolz/imports/$policyPath/{$model->name}Policy.php"), base_path("$policyPath/{$model->name}Policy.php"));
                }
                if($config['observer']) {
                    copy(storage_path("apitoolz/imports/$observerPath/{$model->name}Observer.php"), base_path("$observerPath/{$model->name}Observer.php"));
                }
                if($config['hook'] != null) {
                    copy(storage_path("apitoolz/imports/$hookPath/{$model->name}Hook.php"), base_path("$hookPath/{$model->name}Hook.php"));
                }
                if(count($migrateFile) > 0) {
                    copy($migrateFile[0], base_path("$migratePath/". basename($migrateFile[0])));
                }
                \Artisan::call('migrate', ["--force" => true]);
                ModelBuilder::build($model);
                if(!$this->option('exclude-data')) {
                    $dataFile = "{$model->table}_data.json";
                    $dataPath = "{$importPath}/data/$dataFile";
                    $data = json_decode(file_get_contents($dataPath), true);

                    foreach($data as $row) {
                        \DB::table($model->table)->updateOrInsert(['id'=> $row["id"]],$row);
                    }
                }
            }
            \Schema::enableForeignKeyConstraints();
            $zip->close();
            system("rm -rf ".escapeshellarg("{$importPath}"));
            $this->warn("Import from {$this->option('file')}");
            $this->info("The model has imported successfully.");
        } else {
            $this->error("File not found for {$this->option('file')}");
        }
    }

    protected function printDocumentation()
    {
        $this->info("📥 API Toolz Model Import Command Documentation");
        $this->line("");
        $this->line("Usage:");
        $this->line("  php artisan apitoolz:import --file=path/to/export.zip [--model=ModelName] [--exclude-data] [--doc]");
        $this->line("");
        $this->line("Options:");
        $this->line("  --file           The full path to the exported ZIP file containing model definitions and resources.");
        $this->line("  --model          Import a specific model by name from the archive. If omitted, all models will be imported.");
        $this->line("  --exclude-data   Skip importing model data from the ZIP archive.");
        $this->line("  --doc            Display this documentation.");
        $this->line("");
        $this->info("What it does:");
        $this->line("  - Unzips the provided export file into a temp directory");
        $this->line("  - Recreates or updates model records in the database");
        $this->line("  - Copies Requests, Resources, Controllers, Services, and Models");
        $this->line("  - Applies Policy and Observer files if enabled");
        $this->line("  - Runs the migration file for the model's table");
        $this->line("  - Optionally imports table data from JSON");
        $this->line("");
        $this->info("Example:");
        $this->line("  php artisan apitoolz:import --file=storage/apitoolz/exports/2025_06_07_123000_export.zip");
        $this->line("  php artisan apitoolz:import --file=path/to/export.zip --model=Product --exclude-data");
    }

}
