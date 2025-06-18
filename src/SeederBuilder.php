<?php

namespace Sawmainek\Apitoolz;
use Sawmainek\Apitoolz\Models\AppSetting;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\APIToolzGenerator;

class SeederBuilder
{
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
