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
        $codes['data'] = $request['data'];

        if ($request['use_ai']) {
            $ask = $request['ask'] ?? '';
            $fields = \Schema::getColumns($model->table);
            $fields = collect($fields)
                ->filter(function ($field) {
                    return !in_array($field['name'], ['created_at', 'updated_at', 'deleted_at']);
                })
                ->map(function ($field) {
                    return $field['name'] . ':' . $field['type'];
                })
                ->toArray();
            $response = APIToolzGenerator::ask(
                "Create {$request['count']} dummy data array for {$model->name} following fields.\n\n{$ask}\n\n",
                self::getDummyHint(),
                $model->name,
                $fields,
                ['dummy_data', $model->slug],
                true
            );
            if ($response->content) {
                if (preg_match('/\[\s*{.*}\s*\]/s', $response->content, $matches)) {
                    $codes['data'] = $matches[0];
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

    static function getDummyHint()
    {
        return '[
            {"first_name":"Aung","last_name":"Zaw","email":"aungzaw@example.com","phone_number":"0911223344","address":"No 1, Kabaraye Pagoda Rd","city":"Yangon","state":"Yangon Region","country":"Myanmar","zip_code":"11101"},
            {"first_name":"Mya","last_name":"Thidar","email":"mya.thidar@example.com","phone_number":"0945566778","address":"22 Inya Road","city":"Yangon","state":"Yangon Region","country":"Myanmar","zip_code":"11111"},
            {"first_name":"Ko","last_name":"Ko","email":"koko@example.com","phone_number":"0922334455","address":"55 Pyay Road","city":"Mandalay","state":"Mandalay Region","country":"Myanmar","zip_code":"22011"},
            {"first_name":"Thiri","last_name":"Aye","email":"thiri.aye@example.com","phone_number":"0977889911","address":"7 Street, Dagon","city":"Yangon","state":"Yangon Region","country":"Myanmar","zip_code":"11022"},
            {"first_name":"Htun","last_name":"Naing","email":"htun.naing@example.com","phone_number":"0933445566","address":"Lake View Residence","city":"Naypyidaw","state":"Naypyidaw Union Territory","country":"Myanmar","zip_code":"15001"}
        ]';
    }
}
