<?php

namespace Sawmainek\Apitoolz;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\ModelConfigUtils;

class RouterBuilder
{
    public static function build()
    {
        $models = Model::all();
        $codes['routes'] = [];
        $codes['routes.api'] = [];
        $codes['channels'] = [];
        foreach ($models as $model) {
            $codes['class'] = $model->name;
            $codes['slug'] = $model->slug;
            $codes['alias'] = \Str::camel($model->name);
            $codes['middleware'] = $model->auth === 'true' ? "'auth:sanctum'" : "";

            $task_view = []; 
            $task_detail = []; 
            $task_create = [];
            $task_update = [];
            $task_delete = [];
            $config = ModelConfigUtils::decryptJson($model->config);
            if($model->auth === 'true' && isset($config['access'])) {
                foreach($config['access'] as $role => $perm) {
                    if($perm['task_view']) $task_view[] = $role;
                    if($perm['task_detail']) $task_detail[]  = $role;
                    if($perm['task_create']) $task_create[]  = $role;
                    if($perm['task_update']) $task_update[]  = $role;
                    if($perm['task_delete']) $task_delete[] = $role;
                }
                $codes['role.view']     = "'role:".implode('|', $task_view)."','permission:view-all'";
                $codes['role.detail']   = "'role:".implode('|', $task_detail)."','permission:view'";
                $codes['role.create']   = "'role:".implode('|', $task_create)."','permission:create'";
                $codes['role.update']   = "'role:".implode('|', $task_update)."','permission:update'";
                $codes['role.delete']   = "'role:".implode('|', $task_delete)."','permission:delete'";
            } else {
                $codes['role.view'] = $model->auth === 'true' ? "'role:viewer','permission:view-all'" : "";
                $codes['role.detail'] = $model->auth === 'true' ? "'role:viewer','permission:view'" : "";
                $codes['role.create'] = $model->auth === 'true' ? "'role:viewer','permission:create'" : "";
                $codes['role.update'] = $model->auth === 'true' ? "'role:viewer','permission:update'" : "";
                $codes['role.delete'] = $model->auth === 'true' ? "'role:viewer','permission:delete'" : "";
            }
            // For Read Only Routes
            if($model->type == "1") {
                $buildRouteAPIGroup = APIToolzGenerator::blend('route.api.group.readonly.tpl', $codes);
                $codes['routes.api'][] = "{$buildRouteAPIGroup} \n";
            } else {
                $buildRouteAPIGroup = APIToolzGenerator::blend('route.api.group.tpl', $codes);
                $codes['routes.api'][] = "{$buildRouteAPIGroup} \n";
            }

            // if (isset($config['notification']) && isset($config['notification']['broadcast'])) {
            //     $buildChannel = APIToolzGenerator::blend('channel.privacy.tpl', $codes);
            //     $codes['channels'][] = "{$buildChannel} \n";
            // }
        }
        $routeAPIFile = base_path("routes/api.php");

        $buildRoute = APIToolzGenerator::blend('route.api.tpl', $codes);
        file_put_contents($routeAPIFile, $buildRoute);

        // $channelFile = base_path("routes/channels.php");

        // $buildChannel = APIToolzGenerator::blend('channel.tpl', $codes);
        // file_put_contents($channelFile, $buildChannel);

    }
}