<?php

namespace Sawmainek\Apitoolz;
use Illuminate\Support\Facades\Artisan;
use Sawmainek\Apitoolz\Models\AppSetting;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\APIToolzGenerator;

class SeederBuilder
{
    public static function run(Model $model, $request)
    {
        $codes['class'] = $model->name;
        $codes['model'] = $model->name;
        $codes['key'] = $request['key'];
        $codes['data'] = $request['data'] ?? '[]';

        if ($request['use_ai']) {
            $ask = $request['ask'] ?? '';
            $fields = \Schema::getColumns($model->table);
            $fields = collect($fields)
                ->filter(function ($field) {
                    return !in_array($field['name'], ['created_at', 'updated_at', 'deleted_at']);
                })
                ->map(function ($field) {
                    return $field['name'] . ':' . $field['type'].'\n';
                })
                ->values()->implode(',');
            $response = APIToolzGenerator::ask(
                "Create {$request['count']} dummy data array for {$model->name} following fields:\n $fields \n\n{$ask}\n\n",
                ['seeder'],
                true
            );
            if ($response) {
                if (preg_match('/\[\s*{.*}\s*\]/s', $response, $matches)) {
                    $codes['data'] = str_replace("'", '', $matches[0]);
                }
            }
        }

        $seederFile = database_path("seeders/{$codes['class']}Seeder.php");
        $buildSeeder = APIToolzGenerator::blend('seeder.tpl', $codes);
        if (!file_exists($seederFile) || $request['force']) {
            file_put_contents($seederFile, $buildSeeder);
            Artisan::call('db:seed', ['class' => "{$model->name}Seeder"]);
        } else {
            echo "This $seederFile is already exist.\n";
            echo "Abort...\n";
        }
    }
    public static function build()
    {
        $models = Model::all();
        $codes['model'] = 'Model';
        $codes['dataList'] = json_encode($models);
        $seederFile = base_path("database/seeders/ModelSeeder.php");

        $buildSeeder = APIToolzGenerator::blend('model.seeder.tpl', $codes);
        file_put_contents($seederFile, $buildSeeder);

        $settings = AppSetting::all();

        $codes['model'] = 'AppSetting';
        $codes['dataList'] = json_encode($settings);
        $seederFile = base_path("database/seeders/SettingsSeeder.php");

        $buildSeeder = APIToolzGenerator::blend('settings.seeder.tpl', $codes);
        file_put_contents($seederFile, $buildSeeder);

    }
}
