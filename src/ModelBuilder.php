<?php

namespace Sawmainek\Apitoolz;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\Facades\ModelConfigUtils;
use Sawmainek\Apitoolz\RouterBuilder;
use Sawmainek\Apitoolz\SeederBuilder;

class ModelBuilder
{
    public static function build(Model $model, $usePolicy = "", $softDelete = "")
    {
        $codes['class'] = $model->name;
        $codes['model'] = $model->name;
        $codes['table'] = $model->table;
        $codes['slug'] = $model->slug;
        $codes['alias'] = \Str::camel($model->name);
        $codes['softdelete'] = "";
        $codes['fillable'] = "";
        $codes['hidden'] = "";
        $codes['casts'] = "";
        $codes['validation'] = [];
        $codes['relationships'] = [];
        $codes['index_loader'] = "";
        $codes['show_loader'] = "";
        $codes['notification'] = [];
        $codes['policy_index'] = "";
        $codes['policy_store'] = "";
        $codes['policy_show'] = "";
        $codes['policy_update'] = "";
        $codes['policy_delete'] = "";
        $codes['authentication'] = $model->auth ? "security={{\"apiAuth\":{}}}," : "";
        $codes['schema_requset'] = OASchemaBuilder::generateSchema($model->table, $model->name);
        $codes['schema_resource'] = OASchemaBuilder::generateSchema($model->table, $model->name, true);

        $config = ModelConfigUtils::decryptJson($model->config);
        $columns = \Schema::getColumns($codes['table']);

        $config['policy'] = $usePolicy != "" ? $usePolicy : ($config['policy'] ?? false);
        $config['softdelete'] = $softDelete != "" ? $softDelete : ($config['softdelete'] ?? false);
        $codes['softdelete'] = $config['softdelete'] == true ? "use SoftDeletes;" : "";


        $config['forms'] = isset($config['forms']) ? $config['forms'] : [];
        $config['grid'] = isset($config['grid']) ? $config['grid'] : [];
        foreach ($columns as $i => $field) {
            $forms[] = ModelConfigUtils::getFormConfig($codes['class'], $codes['table'], $field, $config['forms'], $i);
            $grids[] = ModelConfigUtils::getGridConfig($codes['class'], $codes['table'], $field, $config['grid'], $i);
        }

        $fillable   = [];
        $search     = [];
        $hidden     = [];
        foreach ($forms as $form) {
            if($form['cast']) {
                if($form['cast'] == 'decimal') {
                    $casts[] = "'{$form['field']}' => 'float'";
                } else {
                    $casts[] = "'{$form['field']}' => '{$form['cast']}'";
                }
            }
            if ($form['search'] && $form['field'] != 'id') {
                if($form['cast'] == 'object') {
                    $searchable[] = "'{$form['field']}' => is_object(\$this->{$form['field']}) ? json_encode(\$this->{$form['field']}) : \$this->{$form['field']}";
                } elseif($form['cast'] == 'array') {
                    $searchable[] = "'{$form['field']}' => is_array(\$this->{$form['field']}) ? json_encode(\$this->{$form['field']}) : \$this->{$form['field']}";
                } elseif($form['cast'] == 'decimal') {

                } else {
                    $searchable[] = "'{$form['field']}' => \$this->{$form['field']}";
                }
            }

            if ($form['view'] == true) {
                $fillable[] = "'{$form['field']}'";
                $search[]   = "'{$form['field']}'";
                $resource[] = "'{$form['field']}' => \$this->{$form['field']}";
                 if($form['field'] == 'id') {
                    $codes['validation'][] ="\t\t\t'{$form['field']}'=>'nullable|integer',\n";
                } else {
                    $codes['validation'][] ="\t\t\t'{$form['field']}'=>'{$form['validator']}',\n";
                }
                $request['field'] = $form['field'];
                $request['type'] = $form['cast'];
            }
            if ($form['hidden'] == true) {
                $hidden[] = "'{$form['field']}'";
            }
        }

        $codes['casts'] = implode(", ", $casts ?? []);
        $codes['searchable'] = implode(",\n\t\t\t", $searchable ?? []);
        $codes['fillable'] = implode(", ", $fillable ?? []);
        $codes['search'] = implode(", ", $search ?? []);
        $codes['hidden'] = implode(", ", $hidden ?? []);

        usort($forms, "self::_sort");
        usort($grids, "self::_sort");
        $config['forms'] =  $forms;
        $config['grid'] = $grids;

        if(isset($config['relationships']) && count($config['relationships']) > 0) {
            $loader = [];
            foreach($config['relationships'] as $relation) {
                if(isset($relation['key']) && $relation['key'] != '') {
                    $codes['relationships'][] = APIToolzGenerator::blend('relationship.key.tpl', $relation);
                } else {
                    $codes['relationships'][] = APIToolzGenerator::blend('relationship.tpl', $relation);
                }

                if($relation['relation'] == 'hasManyThrough' || $relation['relation'] == 'hasMany') {
                    $resource[] = "'{$relation['title']}' => {$relation['model']}Resource::collection(\$this->{$relation['title']})";
                } else {
                    $resource[] = "'{$relation['title']}' => new {$relation['model']}Resource(\$this->{$relation['title']})";
                }

                if(isset($relation['sub']) && explode(',',$relation['sub']) > 0) {
                    foreach(explode(',',$relation['sub']) as $sub) {
                        $loader[] = "'{$relation['title']}.{$sub}'";
                    }
                } else {
                    $loader[] = "'{$relation['title']}'";
                }
            }
            $relations = implode(', ', $loader);
            $codes['index_loader'] = "\$query->with([{$relations}]);";
            $codes['show_loader'] = "\${$codes['alias']}->with([{$relations}]);";
        }
        $codes['resources'] = implode(",\n\t\t\t", $resource ?? []);

        $codes['subject'] = "";
        $codes['receivers'] = [];
        $codes['create_notification'] = "";
        $codes['update_notification'] = "";
        $codes['delete_notification'] = "";
        $codes['create_event'] = "";
        $codes['update_event'] = "";
        $codes['delete_event'] = "";

        if(isset($config['notification'])) {
            $notification = $config['notification'];
            if(isset($notification['email'])) {
                $codes['subject'] = $notification['email']['subject'];
                $sendto = explode(',', $notification['email']['send_to']);
                foreach($sendto as $to) {
                    $to = trim($to);
                    $codes['receivers'][] = "\"{$to}\"";
                }
                $codes['receivers'] = implode(", \n\t\t\t", $codes['receivers']);

                if(!$model->lock || ($model->lock && !isset($model->lock['notification']))) {
                    $mailClassFile = app_path("Mails/{$codes['class']}Mail.php");
                    $mailLayoutFile = base_path("resources/views/emails/{$codes['slug']}.blade.php");
                    file_put_contents($mailClassFile,APIToolzGenerator::blend('email.class.tpl', $codes));
                    file_put_contents($mailLayoutFile, $notification['email']['body']);
                }

                if(isset($notification['email']['when']['new'])) {
                    $codes['job_class'] = "Created{$codes['class']}";
                    $codes['notify_class'] = "{$codes['class']}Created";
                    $codes['mail_alias'] = "{$codes['slug']}-created";
                    $jobFile = app_path("Jobs/ProcessCreated{$codes['class']}.php");
                    $notifyFile = app_path("Notifications/{$codes['class']}CreatedNotification.php");
                    $mailLayoutFile = base_path("resources/views/emails/{$codes['mail_alias']}.blade.php");
                    $codes['create_notification'] = "\App\Jobs\ProcessCreated{$codes['class']}::dispatchNow(\${$codes['alias']});";
                    if(!$model->lock || ($model->lock && !isset($model->lock['notification']))) {
                        file_put_contents($jobFile, APIToolzGenerator::blend('job.tpl', $codes));
                        file_put_contents($notifyFile, APIToolzGenerator::blend('notification.tpl', $codes));
                        file_put_contents($mailLayoutFile, $notification['email']['body']);
                    }
                }

                if (isset($notification['email']['when']['update'])) {
                    $codes['job_class'] = "Updated{$codes['class']}";
                    $codes['notify_class'] = "{$codes['class']}Updated";
                    $codes['mail_alias'] = "{$codes['slug']}-updated";
                    $jobFile = app_path("Jobs/ProcessUpdated{$codes['class']}.php");
                    $notifyFile = app_path("Notifications/{$codes['class']}UpdatedNotification.php");
                    $mailLayoutFile = base_path("resources/views/emails/{$codes['mail_alias']}.blade.php");
                    $codes['update_notification'] = "\App\Jobs\ProcessUpdated{$codes['class']}::dispatchNow(\${$codes['alias']});";
                    if (!$model->lock || ($model->lock && !isset($model->lock['notification']))) {
                        file_put_contents($jobFile, APIToolzGenerator::blend('job.tpl', $codes));
                        file_put_contents($notifyFile, APIToolzGenerator::blend('notification.tpl', $codes));
                        file_put_contents($mailLayoutFile, $notification['email']['body']);
                    }
                }

                if (isset($notification['email']['when']['delete'])) {
                    $codes['job_class'] = "Deleted{$codes['class']}";
                    $codes['notify_class'] = "{$codes['class']}Deleted";
                    $codes['mail_alias'] = "{$codes['slug']}-deleted";
                    $jobFile = app_path("Jobs/ProcessDeleted{$codes['class']}.php");
                    $notifyFile = app_path("Notifications/{$codes['class']}DeletedNotification.php");
                    $mailLayoutFile = base_path("resources/views/emails/{$codes['mail_alias']}.blade.php");
                    $codes['delete_notification'] = "\App\Jobs\ProcessDeleted{$codes['class']}::dispatchNow(\${$codes['alias']});";
                    if (!$model->lock || ($model->lock && !isset($model->lock['notification']))) {
                        file_put_contents($jobFile, APIToolzGenerator::blend('job.tpl', $codes));
                        file_put_contents($notifyFile, APIToolzGenerator::blend('notification.tpl', $codes));
                        file_put_contents($mailLayoutFile, $notification['email']['body']);
                    }
                }
            }

            if(isset($notification['broadcast'])) {
                if($notification['broadcast']['privacy'] == 'private') {
                    $codes['channel'] = "new PrivateChannel(\"{$notification['broadcast']['channel']}\")";
                } else {
                    $codes['channel'] = "[\"{$notification['broadcast']['channel']}\"]";
                }

                $codes['broadcast_body'] = $notification['broadcast']['body'];

                if (isset($notification['broadcast']['when']['new'])) {
                    $codes['event_class'] = "{$codes['class']}Created";
                    $codes['channel_as'] = "{$codes['slug']}.created";
                    $codes['create_event'] = "broadcast(new \\App\\Events\\{$codes['class']}CreatedEvent(\${$codes['alias']}));\n";
                    $eventFile = app_path("Events/{$codes['class']}CreatedEvent.php");
                    if (!$model->lock || ($model->lock && !isset($model->lock['notification']))) {
                        file_put_contents($eventFile, APIToolzGenerator::blend('event.tpl', $codes));
                    }
                }

                if (isset($notification['broadcast']['when']['update'])) {
                    $codes['event_class'] = "{$codes['class']}Updated";
                    $codes['channel_as'] = "{$codes['slug']}.updated";
                    $codes['update_event'] = "broadcast(new \\App\\Events\\{$codes['class']}UpdatedEvent(\${$codes['alias']}));\n";
                    $eventFile = app_path("Events/{$codes['class']}UpdatedEvent.php");
                    if (!$model->lock || ($model->lock && !isset($model->lock['notification']))) {
                        //file_put_contents($eventFile, APIToolzGenerator::blend($eventTpl, $codes));
                    }
                }

                if (isset($notification['broadcast']['when']['delete'])) {
                    $codes['event_class'] = "{$codes['class']}Deleted";
                    $codes['channel_as'] = "{$codes['slug']}.deleted";
                    $codes['delete_event'] = "broadcast(new \\App\\Events\\{$codes['class']}DeletedEvent(\${$codes['alias']}));\n";
                    $eventFile = app_path("Events/{$codes['class']}DeletedEvent.php");
                    if (!$model->lock || ($model->lock && !isset($model->lock['notification']))) {
                        //file_put_contents($eventFile, APIToolzGenerator::blend($eventTpl, $codes));
                    }
                }
            }
        }

        if($model->auth && $config['policy']) {
            $codes['policy_index'] = "\$this->authorize('viewAny', {$codes['model']}::class);";
            $codes['policy_store'] = "\$this->authorize('create', {$codes['model']}::class);";
            $codes['policy_show'] = "\$this->authorize('view', \${$codes['alias']});";
            $codes['policy_update'] = "\$this->authorize('update', \${$codes['alias']});";
            $codes['policy_delete'] = "\$this->authorize('delete', \${$codes['alias']});";
        }

        if($model->auth && $config['policy']) {
            $policyFile = app_path("Policies/{$codes['model']}Policy.php");
            $buildPolicy = APIToolzGenerator::blend('policy.tpl', $codes);
            if(!file_exists($policyFile)) {
                if ( !is_dir( app_path("Policies") ) )
                    mkdir(app_path("Policies"), 0775, true);
                file_put_contents($policyFile, $buildPolicy);
            }
        } else {
            $policyFile = app_path("Policies/{$codes['model']}Policy.php");
            @unlink($policyFile);
        }

        if(!$model->lock || ($model->lock && !in_array('request', $model->lock))) {
            $requestFile = app_path("Http/Requests/{$codes['class']}Request.php");
            $buildRequest = APIToolzGenerator::blend('request.tpl', $codes);
            if(!is_dir(app_path("Http/Requests")))
                mkdir(app_path("Http/Requests"),0775,true);
            file_put_contents($requestFile, $buildRequest);
        }

        if(!$model->lock || ($model->lock && !in_array('resource', $model->lock))) {
            $resourceFile = app_path("Http/Resources/{$codes['class']}Resource.php");
            $buildResource = APIToolzGenerator::blend('resource.tpl', $codes);
            if(!is_dir(app_path("Http/Resources")))
                mkdir(app_path("Http/Resources"),0775,true);
            file_put_contents($resourceFile, $buildResource);
        }
        if(!$model->lock || ($model->lock && !in_array('service', $model->lock))) {
            $serviceFile = app_path(path: "Services/{$codes['class']}Service.php");
            $buildService = APIToolzGenerator::blend('service.tpl', $codes);
            if(!is_dir(app_path("Services")))
                mkdir(app_path("Services"),0775,true);
            file_put_contents($serviceFile, $buildService);
        }

        if(!$model->lock || ($model->lock && !in_array('controller', $model->lock))) {
            $controllerFile = app_path("Http/Controllers/{$codes['class']}Controller.php");
            $buildController = APIToolzGenerator::blend('controller.tpl', $codes);

            file_put_contents($controllerFile, $buildController);
        }

        if (!$model->lock || ($model->lock && !in_array('model', $model->lock))) {
            $modelFile = app_path("Models/{$codes['model']}.php");
            $buildModel = APIToolzGenerator::blend('model.tpl', $codes);
            file_put_contents($modelFile, $buildModel);
        }

        // $exportFile = app_path("Exports/{$codes['model']}Export.php");
        // $buildExport = APIToolzGenerator::blend('export.tpl', $codes);
        // if ( !is_dir( app_path("Exports") ) )
        //     mkdir(app_path("Exports"));
        // file_put_contents($exportFile, $buildExport);

        $model->config = ModelConfigUtils::encryptJson($config);
        $model->update();

        RouterBuilder::build();
        SeederBuilder::build();
        \Artisan::call('l5-swagger:generate');
        \Artisan::call('scout:flush', ["model" => "App\\Models\\{$codes['model']}"]);
        \Artisan::call('scout:import', ["model" => "App\\Models\\{$codes['model']}"]);
    }

    public static function remove(Model $model) {
        //\Artisan::call('scout:flush', ["model" => "App\\Models\\{$model->name}"]);

        @unlink(app_path("Http/Controllers/{$model->name}Controller.php"));
        @unlink(app_path("Http/Requests/{$model->name}Request.php"));
        @unlink(app_path("Http/Resources/{$model->name}Resource.php"));
        @unlink(app_path("Services/{$model->name}Service.php"));
        @unlink(app_path("Models/{$model->name}.php"));
        @unlink(app_path("Exports/{$model->name}Export.php"));
        @unlink(app_path("Policies/{$model->name}Policy.php"));
        @unlink(app_path("Mails/{$model->name}Mail.php"));
        @unlink(app_path("Jobs/ProcessCreated{$model->name}.php"));
        @unlink(app_path("Jobs/ProcessUpdated{$model->name}.php"));
        @unlink(app_path("Jobs/ProcessDeleted{$model->name}.php"));
        @unlink(app_path("Notifications/{$model->name}CreatedNotification.php"));
        @unlink(app_path("Notifications/{$model->name}UpdatedNotification.php"));
        @unlink(app_path("Notifications/{$model->name}DeletedNotification.php"));
        @unlink(app_path("Events/{$model->name}CreatedEvent.php"));
        @unlink(app_path("Events/{$model->name}UpdatedEvent.php"));
        @unlink(app_path("Events/{$model->name}DeletedEvent.php"));
        @unlink(base_path("resources/views/emails/{$model->slug}.blade.php"));
        @unlink(base_path("resources/views/emails/{$model->slug}-created.blade.php"));
        @unlink(base_path("resources/views/emails/{$model->slug}-updated.blade.php"));
        @unlink(base_path("resources/views/emails/{$model->slug}-deleted.blade.php"));

        RouterBuilder::build();
        SeederBuilder::build();
    }

    static function _sort($a, $b)
    {

        if ($a['sortlist'] == $a['sortlist']) {
            return strnatcmp($a['sortlist'], $b['sortlist']);
        }
        return strnatcmp($a['sortlist'], $b['sortlist']);
    }
}
