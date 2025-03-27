<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
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
    protected $signature = 'apitoolz:export {--model=} {--include-data}';

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
                // $exportPath = "app/Exports/{$model->name}Export.php";
                // $zip->addFile(base_path($exportPath), $exportPath);
                $modelPath = "app/Models/{$model->name}.php";
                $zip->addFile(base_path($modelPath), $modelPath);
                if($model->auth && $config['policy']) {
                    $policyPath = "app/Policies/{$model->name}Policy.php";
                    $zip->addFile(base_path($policyPath), $policyPath);
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
            $zip->close();
            system("rm -rf ".escapeshellarg("{$zipExportPath}/models.json"));
            system("rm -rf ".escapeshellarg("{$zipExportPath}/migrations"));
            system("rm -rf ".escapeshellarg("{$zipExportPath}/data"));
            $this->warn("Exported at storage/apitoolz/exports/$zipFile");
            $this->info("The model has exported successfully.");
        } else {
            $this->error("Empty models or provided model not found.");
        }

    }

}
