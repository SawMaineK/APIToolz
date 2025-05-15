<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\ModelBuilder;
use Sawmainek\Apitoolz\Facades\ModelConfigUtils;

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
    protected $signature = 'apitoolz:import {--file=} {--model=} {--exclude-data}';

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
        $this->info('Model import start...');
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
        $migratePath = "database/migrations";
        if ($res === TRUE) {
            $zip->extractTo($importPath);
            $models = json_decode(file_get_contents("$importPath/models.json")) ?? [];
            if($this->option('model') != "") {
                $models = array_filter($models, fn($m) => $m->name === $this->option('model'));
            }
            \Schema::disableForeignKeyConstraints();
            foreach($models as $model) {
                $model = Model::updateOrCreate(['id'=>$model->id], (array)$model);
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

}
