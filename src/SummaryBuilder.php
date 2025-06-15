<?php

namespace Sawmainek\Apitoolz;
use Sawmainek\Apitoolz\Factory\WidgetFactory;
use Sawmainek\Apitoolz\Facades\ModelConfigUtils;

class SummaryBuilder
{
    public static function build($model, $request, $force = false, $remove = false)
    {
        $config = ModelConfigUtils::decryptJson($model->config);
        if (isset($config['reports'])) {
            $report = isset($config['reports'][$request['title']]) ? $config['reports'][$request['title']] : self::getDefaultReport($request);
            // If you want to remove existed reports
            if($remove) {
                $existedIdx = self::getExistedReport($config['reports'], $request['title']);
                if($existedIdx != -1) {
                    unset($config['reports'][$existedIdx]);
                    $model->config = ModelConfigUtils::encryptJson($config);
                    $model->update();
                    ModelBuilder::build($model);
                    return;
                } else {
                    echo "This {$request['title']} report not found\n";
                    echo "Abort...\n";
                    dd();
                }
            }
        } else {
            $config['reports'] = [];
            $report = self::getDefaultReport($request);
        }
        $existedIdx = self::getExistedReport($config['reports'], $report['title']);
        if ($existedIdx != -1) {
            if($force) {
                $config['reports'][$existedIdx] = $report;
            } else {
                echo "This {$request['title']} report is already exist. If you want to overite, please use --force\n";
                echo "Abort...\n";
                dd();
            }

        } else {
            $config['reports'][] = $report;
        }
        $model->config = ModelConfigUtils::encryptJson($config);
        $model->update();
        ModelBuilder::build($model);
    }

    static function getDefaultReport($config)
    {
        return WidgetFactory::make($config)->toArray();
    }

    static function getExistedReport($reports = [], $key) {
        foreach($reports as $i => $f) {
            if($f['title'] == $key) {
                return $i;
            }
        }
        return -1;
    }
}
