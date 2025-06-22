<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\APIToolzGenerator;
use Sawmainek\Apitoolz\Models\AppSetting;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\DatatableBuilder;
use Sawmainek\Apitoolz\Facades\ModelConfigUtils;

class ModelExportGenerator extends Command
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
    /**
     * The console command signature for exporting models with various options.
     *
     * Options:
     * - --model: Specify the model to export.
     * - --include-data: Include model data in the export.
     * - --include-files: Specify files to include in the export.
     * - --publish-template: Publish the export template.
     * - --doc: Generate documentation for the export.
     */
    protected $signature = 'apitoolz:export {--model=} {--include-data} {--include-files=} {--app-settings} {--publish-template} {--doc}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Export all models, including data for each model, or specify the provided model.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('doc')) {
            $this->printDocumentation();
            return;
        }

        $this->info('Model exporting start...');
        $models = [];
        if($this->option('model')) {
            $models = Model::where('name', $this->option('model'))->get();
        } else {
            $models = Model::all();
        }
        $zipExportPath = storage_path("apitoolz/exports");
        $zipFile = date('Y_m_d_his')."_export.zip";
        if(count($models) > 0) {
            if(!is_dir($zipExportPath.'/migrations')) {
                mkdir($zipExportPath.'/migrations', 0777, true);
            }
            if(!is_dir($zipExportPath.'/data')) {
                mkdir($zipExportPath.'/data', 0777, true);
            }
            $zip = new \ZipArchive();
            $zip->open("{$zipExportPath}/{$zipFile}", \ZipArchive::CREATE | \ZipArchive::OVERWRITE);

            file_put_contents("{$zipExportPath}/models.json", json_encode($models));
            $zip->addFile("{$zipExportPath}/models.json", "models.json");

            foreach($models as $model) {
                $config = ModelConfigUtils::decryptJson($model->config);
                $requestPath = "app/Http/Requests/{$model->name}Request.php";
                $zip->addFile(base_path($requestPath), $requestPath);
                $resourcePath = "app/Http/Resources/{$model->name}Resource.php";
                $zip->addFile(base_path($resourcePath), $resourcePath);
                $controllerPath = "app/Http/Controllers/{$model->name}Controller.php";
                $zip->addFile(base_path($controllerPath), $controllerPath);
                $servicePath = "app/Services/{$model->name}Service.php";
                $zip->addFile(base_path($servicePath), $servicePath);
                $modelPath = "app/Models/{$model->name}.php";
                $zip->addFile(base_path($modelPath), $modelPath);
                if($model->auth && $config['policy']) {
                    $policyPath = "app/Policies/{$model->name}Policy.php";
                    $zip->addFile(base_path($policyPath), $policyPath);
                }
                if($config['observer']) {
                    $observerPath = "app/Observers/{$model->name}Observer.php";
                    $zip->addFile(base_path($observerPath), $observerPath);
                }
                if($config['hook'] != null) {
                    $hookPath = "app/Hooks/{$model->name}Hook.php";
                    $zip->addFile(base_path($hookPath), $hookPath);
                }
                $columns = \Schema::getColumns($model->table);
                $indexes = \Schema::getIndexes($model->table);
                $foreignKeys = \Schema::getForeignKeys($model->table);
                $fields = [];
                foreach($columns as $col) {
                    if($col['type_name'] != "int auto_increment" && $col['name'] != 'id' && $col['name'] != 'created_at' && $col['name'] != 'updated_at' && $col['name'] != 'deleted_at') {
                        $field['name'] = $col['name'];
                        $field['type'] = DatatableBuilder::toCastFieldType($col['type_name']);
                        $field['null'] = $col['nullable'];
                        $fields[] = $field;
                    }
                }
                $migrateTableFile = date('Y_m_d_his') . "_create_{$model->table}_table.php";
                $migrateTablePath = "{$zipExportPath}/migrations/{$migrateTableFile}";

                DatatableBuilder::build($model->table, $fields, $config['softdelete'], $foreignKeys, $migrateTablePath);
                $zip->addFile($migrateTablePath, "database/migrations/{$migrateTableFile}");

                if($this->option('include-data')) {
                    $data = \DB::table($model->table)->select()->get();
                    $dataFile = "{$model->table}_data.json";
                    $dataPath = "{$zipExportPath}/data/$dataFile";
                    file_put_contents($dataPath, json_encode($data));
                    $zip->addFile($dataPath, "data/{$dataFile}");
                }
            }
            if ($this->option('include-files')) {
                $files = explode(',', $this->option('include-files'));
                foreach ($files as $file) {
                    $file = trim($file);
                    if ($file) {
                        $fullPath = base_path($file);
                        if (file_exists($fullPath)) {
                            $zip->addFile($fullPath, $file);
                        } else {
                            $this->warn("File not found: $file");
                        }
                    }
                }
            }
            if ($this->option('app-settings')) {
                $appSettings = AppSetting::all();
                file_put_contents("{$zipExportPath}/appsettings.json", json_encode($appSettings));
                $zip->addFile("{$zipExportPath}/appsettings.json", "appsettings.json");
            }
            $zip->close();
            system("rm -rf ".escapeshellarg("{$zipExportPath}/models.json"));
            system("rm -rf ".escapeshellarg("{$zipExportPath}/appsettings.json"));
            system("rm -rf ".escapeshellarg("{$zipExportPath}/migrations"));
            system("rm -rf ".escapeshellarg("{$zipExportPath}/data"));
            $this->warn("Exported at storage/apitoolz/exports/$zipFile");
            if($this->option('publish-template')) {
                $appSetting = AppSetting::where('key', 'default_settings')->first();
                if ($appSetting) {
                    $reponse = APIToolzGenerator::publishTemplate(
                        $appSetting->branding['app_name'],
                        $appSetting->branding['app_desc'],
                        base_path("storage/apitoolz/exports/$zipFile"));
                    if($reponse->file_path) {
                        $this->info("Your app published to template store successfully.");
                    }

                    return;
                }
            }

            $this->info("The model has exported successfully.");
        } else {
            $this->error("Empty models or provided model not found.");
        }

    }

    protected function printDocumentation()
    {
        $this->info("📦 API Toolz Model Export Command Documentation");
        $this->line("");
        $this->line("Usage:");
        $this->line("  php artisan apitoolz:export [--model=ModelName] [--include-data] [--doc]");
        $this->line("");
        $this->line("Options:");
        $this->line("  --model           Export a specific model by name. If omitted, all models will be exported.");
        $this->line("  --include-data    Include model data (JSON) in the export.");
        $this->line("  --doc             Show this command's usage documentation.");
        $this->line("");
        $this->info("Export Content:");
        $this->line("  - Model metadata (models.json)");
        $this->line("  - Request, Resource, Controller, Service, and Model classes");
        $this->line("  - Policy and Observer (if configured)");
        $this->line("  - Table migration file");
        $this->line("  - Data JSON file (if --include-data is passed)");
        $this->line("");
        $this->info("Example:");
        $this->line("  php artisan apitoolz:export --model=Product --include-data");
        $this->line("  php artisan apitoolz:export --doc");
    }

}
