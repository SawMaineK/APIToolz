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
            if($remove) {
                $config['filters'] = collect($config['filters'])
                    ->filter(function ($filter)use($request) {
                        return $filter['title'] !== $request['title'];
                    })
                    ->values()
                    ->all();
                $model->config = ModelConfigUtils::encryptJson($config);
                $model->update();
                ModelBuilder::build($model);
                return;
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

        $filters = collect(self::getFilters($model));
        $duplicateIndex = $filters->search(
            fn ($f) => $f['key'] === $filter['key']
        );
        if ($duplicateIndex !== false) {
            if ($force) {
                $filters->put($duplicateIndex, $filter);
            } else {
                echo "The \"{$filter['title']}\" filter already exists with key={$filter['key']}. ";
                echo "Use --force to overwrite.\nAbort...\n";
                exit(1);          // avoid dumping the entire process with dd()
            }
        } else {
            $filters->push($filter);
        }
        $config['filters'] = $filters->values()->all();

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

    static function getExistedFilter($filters = [], $title, $key) {
        foreach($filters as $i => $f) {
            if($f['title'] == $title && $f['key'] == $key) {
                return $i;
            }
        }
        return -1;
    }
}
