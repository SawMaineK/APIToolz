<?php

namespace Sawmainek\Apitoolz;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\Facades\ModelConfigUtils;

class FilterBuilder
{
    public static function build($model, $request, $force = false, $remove = false)
    {
        $config = ModelConfigUtils::decryptJson($model->config);
        if (isset($config['filters'])) {
            $filter = isset($config['filters'][$request['title']]) ? $config['filters'][$request['title']] : self::getDefaultFilter();
            // If you want to remove existed filter
            if($remove) {
                $existedIdx = self::getExistedFilter($config['filters'], $request['title']);
                if($existedIdx != -1) {
                    unset($config['filters'][$existedIdx]);
                    $model->config = ModelConfigUtils::encryptJson($config);
                    $model->update();
                    ModelBuilder::build($model);
                    return;
                } else {
                    echo "This {$request['title']} filter not found\n";
                    echo "Abort...\n";
                    dd();
                }
            }
        } else {
            $config['filters'] = [];
            $filter = self::getDefaultFilter();
        }
        $filterModel = Model::where('name', $request['filter_model'])->first();
        $filter['title'] = $request['title'];
        $filter['type'] = $request['filter_type'];
        $filter['model'] = $filterModel ? $filterModel->name : '';
        $filter['model_slug'] = $filterModel ? $filterModel->slug : '';
        $filter['display'] = $request['filter_label'] ?? 'name';
        $filter['value'] = $request['filter_value'] ?? 'id';
        $filter['query'] = $request['filter_query'] ?? '';
        $filter['key'] = $request['filter_key'];
        $filter['position'] = $request['position'];
        $existedIdx = self::getExistedFilter($config['filters'], $filter['title']);
        if ($existedIdx != -1) {
            if($force) {
                $config['filters'][$existedIdx] = $filter;
            } else {
                echo "This {$request['title']} filter is already exist. If you want to overite, please use --force\n";
                echo "Abort...\n";
                dd();
            }

        } else {
            $config['filters'][] = $filter;
        }
        $model->config = ModelConfigUtils::encryptJson($config);
        $model->update();
        ModelBuilder::build($model);
    }

    public static function getFilters(Model $model) {
        $config = ModelConfigUtils::decryptJson($model->config);
        return $config['filters'] ?? [];
    }


    static function getDefaultFilter()
    {
        $filter = [
            'title' => '',
            'type' => 'select',
            'model' => '',
            'model_slug' => '',
            'display' => 'name',
            'value' => 'id',
            'query' => '',
            'key' => '',
            'position' => 0
        ];
        return $filter;
    }

    static function getExistedFilter($filters = [], $key) {
        foreach($filters as $i => $f) {
            if($f['title'] == $key) {
                return $i;
            }
        }
        return -1;
    }
}
