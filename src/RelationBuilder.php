<?php

namespace Sawmainek\Apitoolz;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\Facades\ModelConfigUtils;

class RelationBuilder
{
    public static function build($model, $request, $force = false, $remove = false)
    {
        $config = ModelConfigUtils::decryptJson($model->config);
        if (isset($config['relationships'])) {
            $relation = isset($config['relationships'][$request['title']]) ? $config['relationships'][$request['title']] : self::getRelation();
            // If you want to remove existed relation
            if($remove) {
                $existedIdx = self::getExistedRelation($config['relationships'], $request['title']);
                if($existedIdx != -1) {
                    unset($config['relationships'][$existedIdx]);
                    $model->config = ModelConfigUtils::encryptJson($config);
                    $model->update();
                    ModelBuilder::build($model);
                    return;
                } else {
                    echo "This {$request['title']} relation not found\n";
                    echo "Abort...\n";
                    dd();
                }
            }
        } else {
            $config['relationships'] = [];
            $relation = self::getRelation();
        }
        $relationModel = Model::where('name', $request['relation_model'])->first();
        $relation['title'] = $request['title'];
        $relation['relation'] = $request['relation_type'] ? $request['relation_type'] : $relation['relation'];
        $relation['master_key'] = 'id';
        $relation['model'] = $request['relation_model'];
        $relation['model_slug'] = $relationModel->slug;
        $relation['display'] = $request['display_field'] ?? 'name';
        $relation['table'] = $relationModel->table;
        $relation['key'] = $request['foreign_key'];
        $relation['sub'] = $request['sub'];
        $existedIdx = self::getExistedRelation($config['relationships'], $relation['title']);
        if ($existedIdx != -1) {
            if($force) {
                $config['relationships'][$existedIdx] = $relation;
            } else {
                echo "This {$request['title']} relation is already exist. If you want to overite, please use --force\n";
                echo "Abort...\n";
                dd();
            }

        } else {
            $config['relationships'][] = $relation;
        }
        $model->config = ModelConfigUtils::encryptJson($config);
        $model->update();
        ModelBuilder::build($model);
    }

    static function getRelation()
    {
        $relation = [
            'title' => '',
            'relation' => 'belongsTo',
            'master' => '',
            'master_key' => '',
            'model' => '',
            'table' => '',
            'key' => '',
            'display' => '',
            'concat' => '',
        ];
        return $relation;
    }

    static function getExistedRelation($relations = [], $key) {
        foreach($relations as $i => $sub) {
            if($sub['title'] == $key || $sub['master_key'] == $key) {
                return $i;
            }
        }
        return -1;
    }
}
