<?php

namespace Sawmainek\Apitoolz;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\ModelConfigUtils;

class ResponseConfigBuilder
{
    public static function build($model, $request, $reset = false)
    {
        $config = ModelConfigUtils::decryptJson($model->config);
        foreach ($config['grid'] as $i => $grid) {
            if($grid['field'] == $request['field']) {
                if($reset) {
                    $columns = \Schema::getColumns($form['alias']);
                    $fieldIndex = array_search($form['field'], array_column($columns, 'name'));
                    $column = $columns[$fieldIndex];
                    $config['grid'][$i] = ModelConfigUtils::getGridConfig($form['class'], $form['alias'], $column, $config['grid'], $i, true);
                } else {
                    $config['grid'][$i]['label'] = $request['label'] ?? $grid['label'];
                    $config['grid'][$i]['format_as'] = $request['format_as'] ?? $grid['format_as'];
                    $config['grid'][$i]['format_value'] = $request['format_value'] ?? $grid['format_value'];
                    $config['grid'][$i]['view'] = $request['view'] ?? $grid['view'];
                    $config['grid'][$i]['download'] = $request['download'] ?? $grid['download'];
                }

            }
        }
        usort($config['grid'], "self::_sort");
        $model->config = ModelConfigUtils::encryptJson($config);
        $model->update();
        ModelBuilder::build($model);
    }

    static function _sort($a, $b)
    {

        if ($a['sortlist'] == $a['sortlist']) {
            return strnatcmp($a['sortlist'], $b['sortlist']);
        }
        return strnatcmp($a['sortlist'], $b['sortlist']);
    }
}
