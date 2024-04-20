<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\ModelBuilder;

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
        $controllerPath     = "app/Http/Controllers";
        //$exportPath         = "app/Exports";
        $modelPath          = "app/Models";
        $migratePath        = "database/migrations";
        if ($res === TRUE) {
            $zip->extractTo($importPath);
            $models = json_decode(file_get_contents("$importPath/models.json")) ?? [];
            if($this->option('model') != "") {
                $models = array_filter($models, fn($m) => $m->name === $this->option('model'));
            }
            foreach($models as $model) {
                $model = Model::updateOrCreate(['id'=>$model->id], (array)$model);
                copy(storage_path("apitoolz/imports/$controllerPath/{$model->name}Controller.php"), base_path("$controllerPath/{$model->name}Controller.php"));
                //copy(storage_path("apitoolz/imports/$exportPath/{$model->name}Export.php"), base_path("$exportPath/{$model->name}Export.php"));
                copy(storage_path("apitoolz/imports/$modelPath/{$model->name}.php"), base_path("$modelPath/{$model->name}.php"));
                $migrateFile = glob(storage_path("apitoolz/imports/$migratePath/*_create_{$model->table}_table.php"));
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
            $zip->close();
            system("rm -rf ".escapeshellarg("{$importPath}"));
            $this->warn("Import from {$this->option('file')}");
            $this->info("The model has imported successfully.");
        } else {
            $this->error("File not found for {$this->option('file')}");
        }
    }

}
