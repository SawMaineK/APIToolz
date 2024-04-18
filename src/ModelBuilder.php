<?php

namespace Sawmainek\Apitoolz;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\RouterBuilder;
use Sawmainek\Apitoolz\SeederBuilder;

class ModelBuilder
{
    public static function build(Model $model, $softDelete = false)
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
        $codes['relationships'] = [];
        $codes['index_loader'] = "";
        $codes['show_loader'] = "";
        $codes['notification'] = [];

        $config = ModelConfigUtils::decryptJson($model->config);
        $columns = \Schema::getColumns($codes['table']);

        $config['softdelete'] = isset($config['softdelete']) ? $config['softdelete'] : $softDelete;
        $codes['softdelete'] = $config['softdelete'] == true ? "use SoftDeletes;" : "";

        $config['forms'] = isset($config['forms']) ? $config['forms'] : [];
        $config['grid'] = isset($config['grid']) ? $config['grid'] : [];
        foreach ($columns as $i => $field) {
            $forms[] = ModelConfigUtils::getFormConfig($codes['class'], $codes['table'], $field, $config['forms'], $i);
            $grids[] = ModelConfigUtils::getGridConfig($codes['class'], $codes['table'], $field, $config['grid'], $i);
        }
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
        }
        $codes['casts'] = implode(", ", $casts ?? []);
        $codes['searchable'] = implode(",\n\t\t\t", $searchable ?? []);

        foreach($forms as $form) {
            if ($form['view'] == '1') {
                $fillable[] = "'{$form['field']}'";
            }
        }

        foreach ($grids as $grid) {
            if ($grid['hidden'] == '1') {
                $hidden[] = "'{$grid['field']}'";
            }
        }

        $codes['fillable'] = implode(", ", $fillable ?? []);
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

                if(isset($relation['sub']) && explode(',',$relation['sub']) > 0) {
                    foreach(explode(',',$relation['sub']) as $sub) {
                        $loader[] = "'{$relation['title']}.{$sub}'";
                    }
                } else {
                    $loader[] = "'{$relation['title']}'";
                }
            }
            $relations = implode(', ', $loader);
            $codes['index_loader'] = "\$result->load({$relations});";
            $codes['show_loader'] = "\${$codes['alias']}->load({$relations});";
        }
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

                if(!$model->lock || ($model->lock && !isset($model->lock['locked_notification']))) {
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
                    if(!$model->lock || ($model->lock && !isset($model->lock['locked_notification']))) {
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
                    if (!$model->lock || ($model->lock && !isset($model->lock['locked_notification']))) {
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
                    if (!$model->lock || ($model->lock && !isset($model->lock['locked_notification']))) {
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
                    if (!$model->lock || ($model->lock && !isset($model->lock['locked_notification']))) {
                        file_put_contents($eventFile, APIToolzGenerator::blend('event.tpl', $codes));
                    }
                }

                if (isset($notification['broadcast']['when']['update'])) {
                    $codes['event_class'] = "{$codes['class']}Updated";
                    $codes['channel_as'] = "{$codes['slug']}.updated";
                    $codes['update_event'] = "broadcast(new \\App\\Events\\{$codes['class']}UpdatedEvent(\${$codes['alias']}));\n";
                    $eventFile = app_path("Events/{$codes['class']}UpdatedEvent.php");
                    if (!$model->lock || ($model->lock && !isset($model->lock['locked_notification']))) {
                        file_put_contents($eventFile, APIToolzGenerator::blend($eventTpl, $codes));
                    }
                }

                if (isset($notification['broadcast']['when']['delete'])) {
                    $codes['event_class'] = "{$codes['class']}Deleted";
                    $codes['channel_as'] = "{$codes['slug']}.deleted";
                    $codes['delete_event'] = "broadcast(new \\App\\Events\\{$codes['class']}DeletedEvent(\${$codes['alias']}));\n";
                    $eventFile = app_path("Events/{$codes['class']}DeletedEvent.php");
                    if (!$model->lock || ($model->lock && !isset($model->lock['locked_notification']))) {
                        file_put_contents($eventFile, APIToolzGenerator::blend($eventTpl, $codes));
                    }
                }
            }
        }

        $model->config = ModelConfigUtils::encryptJson($config);
        $model->update();

        //$codes['policy'] = $model->auth === "true" ? "\$this->authorizeResource({$codes['model']}::class, '{$codes['alias']}');" : "";

        if(!$model->lock || ($model->lock && !isset($model->lock['locked_controller']))) {
            $controllerFile = app_path("Http/Controllers/{$codes['class']}Controller.php");
            $buildController = APIToolzGenerator::blend('controller.tpl', $codes);

            file_put_contents($controllerFile, $buildController);
        }

        if (!$model->lock || ($model->lock && !isset($model->lock['locked_model']))) {
            $modelFile = app_path("Models/{$codes['model']}.php");
            $buildModel = APIToolzGenerator::blend('model.tpl', $codes);
            file_put_contents($modelFile, $buildModel);
        }

        // $policyFile = app_path("Policies/{$codes['model']}Policy.php");
        // $buildPolicy = APIToolzGenerator::blend('policy.tpl', $codes);
        // if(!file_exists($policyFile)) {
        //     if ( !is_dir( app_path("Policies") ) );
        //     file_put_contents($policyFile, $buildPolicy);
        // }

        $exportFile = app_path("Exports/{$codes['model']}Export.php");
        $buildExport = APIToolzGenerator::blend('export.tpl', $codes);
        if ( !is_dir( app_path("Exports") ) )
            mkdir(app_path("Exports"));
        file_put_contents($exportFile, $buildExport);

        RouterBuilder::build();
        SeederBuilder::build();
        \Artisan::call('l5-swagger:generate');
        \Artisan::call('scout:flush', ["model" => "App\\Models\\{$codes['model']}"]);
        \Artisan::call('scout:import', ["model" => "App\\Models\\{$codes['model']}"]);
    }

    static function _sort($a, $b)
    {

        if ($a['sortlist'] == $a['sortlist']) {
            return strnatcmp($a['sortlist'], $b['sortlist']);
        }
        return strnatcmp($a['sortlist'], $b['sortlist']);
    }
}
