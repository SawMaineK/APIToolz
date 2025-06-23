<?php

namespace Sawmainek\Apitoolz;
use Illuminate\Support\Facades\Artisan;
use Sawmainek\Apitoolz\Models\AppSetting;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\Facades\ModelConfigUtils;
use Sawmainek\Apitoolz\RouterBuilder;
use Sawmainek\Apitoolz\SeederBuilder;

class ModelBuilder
{
    public static function build(Model $model, $usePolicy = "", $useObserver = "", $useHook = null, $softDelete = "")
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
        $codes['policy_restore'] = "";
        $codes['policy_force_delete'] = "";
        $codes['only_roles'] = "";
        $codes['authentication'] = $model->auth ? "security={{\"apiAuth\":{}}}," : "";
        $codes['schema_requset'] = OASchemaBuilder::generateSchema($model->table, $model->name);
        $codes['schema_resource'] = OASchemaBuilder::generateSchema($model->table, $model->name, true);

        $config = ModelConfigUtils::decryptJson($model->config);
        $columns = \Schema::getColumns($codes['table']);

        $config['policy'] = $usePolicy != "" ? $usePolicy : ($config['policy'] ?? false);
        $config['observer'] = $useObserver != "" ? $useObserver : ($config['observer'] ?? false);
        $config['hook'] = $useHook != null ? $useHook : ($config['hook'] ?? null);
        $config['softdelete'] = $softDelete != "" ? $softDelete : ($config['softdelete'] ?? false);
        $codes['softdelete'] = $config['softdelete'] == true ? "use SoftDeletes;" : "";


        $config['forms'] = isset($config['forms']) ? $config['forms'] : [];
        $config['grid'] = isset($config['grid']) ? $config['grid'] : [];
        foreach ($columns as $i => $field) {
            $forms[] = ModelConfigUtils::getFormConfig($codes['class'], $codes['table'], $field, $config['forms'], $i);
            $grids[] = ModelConfigUtils::getGridConfig($codes['class'], $codes['table'], $field, $config['grid'], $i);
        }

        $fillable = [];
        $search = [];
        $hidden = [];
        foreach ($forms as $form) {
            if ($form['cast']) {
                if ($form['cast'] == 'decimal') {
                    $casts[] = "'{$form['field']}' => 'float'";
                } else if ($form['cast'] == 'enum') {
                    $casts[] = "'{$form['field']}' => 'string'";
                } else {
                    $casts[] = "'{$form['field']}' => '{$form['cast']}'";
                }
            }
            if ($form['search'] && $form['field'] != 'id') {
                if ($form['cast'] == 'object') {
                    $searchable[] = "'{$form['field']}' => is_object(\$this->{$form['field']}) ? json_encode(\$this->{$form['field']}) : \$this->{$form['field']}";
                } elseif ($form['cast'] == 'array') {
                    $searchable[] = "'{$form['field']}' => is_array(\$this->{$form['field']}) ? json_encode(\$this->{$form['field']}) : \$this->{$form['field']}";
                } elseif ($form['cast'] == 'decimal') {

                } else {
                    $searchable[] = "'{$form['field']}' => \$this->{$form['field']}";
                }
            }

            if ($form['view'] == true) {
                $fillable[] = "'{$form['field']}'";
                $search[] = "'{$form['field']}'";
                $resource[] = "'{$form['field']}' => \$this->{$form['field']}";
                if ($form['field'] == 'id') {
                    $codes['validation'][] = "\t\t\t'{$form['field']}'=>'nullable|integer',\n";
                } else {
                    $codes['validation'][] = "\t\t\t'{$form['field']}'=>'{$form['validator']}',\n";
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
        $config['forms'] = $forms;
        $config['grid'] = $grids;

        if (isset($config['relationships']) && count($config['relationships']) > 0) {
            $loader = [];
            foreach ($config['relationships'] as $relation) {
                if (isset($relation['key']) && $relation['key'] != '') {
                    $codes['relationships'][] = APIToolzGenerator::blend('relationship.key.tpl', $relation);
                } else {
                    $codes['relationships'][] = APIToolzGenerator::blend('relationship.tpl', $relation);
                }

                if ($relation['relation'] == 'hasManyThrough' || $relation['relation'] == 'hasMany' || $relation['relation'] == 'belongsToMany') {
                    $resource[] = "'{$relation['title']}' => {$relation['model']}Resource::collection(\$this->whenLoaded('{$relation['title']}'))";
                } else {
                    $resource[] = "'{$relation['title']}' => new {$relation['model']}Resource(\$this->whenLoaded('{$relation['title']}'))";
                }

                if (isset($relation['sub']) && explode(',', $relation['sub']) > 0) {
                    foreach (explode(',', $relation['sub']) as $sub) {
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
        $only_roles_fields = collect($config['grid'])
            ->filter(fn($item) => isset($item['only_roles']) && count($item['only_roles']) > 0)
            ->pluck('field');

        $only_roles = collect($config['grid'])
            ->filter(fn($item) => isset($item['only_roles']) && count($item['only_roles']) > 0)
            ->pluck('only_roles')
            ->flatten()
            ->unique();

        $codes['only_roles'] .= $only_roles_fields->isNotEmpty() ? "unset(" . $only_roles_fields->map(fn($field) => "\$data['{$field}']")->implode(', ') . ");\n" : "";
        // Generate role-based data assignment code from $only_roles
        if ($only_roles->isNotEmpty()) {
            $roleCases = [];
            foreach ($only_roles as $role) {
                $fields = $only_roles_fields->filter(function ($field, $key) use ($config, $role) {
                    $item = collect($config['grid'])->firstWhere('field', $field);
                    return isset($item['only_roles']) && in_array($role, $item['only_roles']);
                });
                if ($fields->isNotEmpty()) {
                    $assignments = $fields->map(function ($field) {
                        return "\$data['{$field}'] = \$this->{$field};";
                    })->implode("\n                ");
                    $roleCases[] = "if (\$request->user()->hasRole('{$role}')) {\n                {$assignments}\n            }";
                }
            }
            $codes['only_roles'] .= "\t\tif (\$request->user()) {\n            " . implode(" else", $roleCases) . "\n        }\n";
        }

        $codes['subject'] = "";
        $codes['receivers'] = [];
        $codes['create_notification'] = "";
        $codes['update_notification'] = "";
        $codes['delete_notification'] = "";
        $codes['create_event'] = "";
        $codes['update_event'] = "";
        $codes['delete_event'] = "";

        if ($model->auth && $config['policy']) {
            $codes['policy_index'] = "\$this->authorize('viewAny', {$codes['model']}::class);";
            $codes['policy_store'] = "\$this->authorize('create', {$codes['model']}::class);";
            $codes['policy_show'] = "\$this->authorize('show', \${$codes['alias']});";
            $codes['policy_update'] = "\$this->authorize('update', \${$codes['alias']});";
            $codes['policy_delete'] = "\$this->authorize('destroy', \${$codes['alias']});";
            $codes['policy_restore'] = "\$this->authorize('restore', \${$codes['alias']});";
            $codes['policy_force_delete'] = "\$this->authorize('forceDestroy', \${$codes['alias']});";
        }

        if ($model->auth && $config['policy']) {
            $policyFile = app_path("Policies/{$codes['model']}Policy.php");
            $buildPolicy = APIToolzGenerator::blend('policy.tpl', $codes);
            if (!file_exists($policyFile)) {
                if (!is_dir(app_path("Policies")))
                    mkdir(app_path("Policies"), 0775, true);
                file_put_contents($policyFile, $buildPolicy);
            }
        } else {
            $policyFile = app_path("Policies/{$codes['model']}Policy.php");
            @unlink($policyFile);
        }

        if ($config['observer']) {
            $observerFile = app_path("Observers/{$codes['model']}Observer.php");
            $buildObserver = APIToolzGenerator::blend('observer.tpl', $codes);
            if (!file_exists($observerFile)) {
                if (!is_dir(app_path("Observers")))
                    mkdir(app_path("Observers"), 0775, true);
                file_put_contents($observerFile, $buildObserver);
            }
        } else {
            $observerFile = app_path("Observers/{$codes['model']}Observer.php");
            @unlink($observerFile);
        }

        $codes['hook_handle'] = "";
        $codes['hook_creating'] = "";
        $codes['hook_created'] = "";
        $codes['hook_updating'] = "";
        $codes['hook_updated'] = "";
        $codes['hook_deleting'] = "";
        $codes['hook_deleted'] = "";
        $codes['hook_restored'] = "";

        if ($config['hook'] != null) {
            foreach (explode(",", $config['hook']) as $value) {
                if (trim($value) == 'handle')
                    $codes['hook_handle'] = "\$this->callHook('handle', \$request, \$query);";
                elseif (trim($value) == 'creating')
                    $codes['hook_creating'] = "\$data = \$this->callHook('creating', \$request, \$data);";
                elseif (trim($value) == "created")
                    $codes['hook_created'] = "\$this->callHook('created', \${$codes['alias']}, \$request);";
                elseif (trim($value) == 'updating')
                    $codes['hook_updating'] = "\$data = \$this->callHook('updating', \$request, \${$codes['alias']}, \$data);";
                elseif (trim($value) == 'updated')
                    $codes['hook_updated'] = "\$this->callHook('updated', \${$codes['alias']}, \$request);";
                elseif (trim($value) == 'deleting')
                    $codes['hook_deleting'] = "\$this->callHook('deleting', \${$codes['alias']});";
                elseif (trim($value) == 'deleted')
                    $codes['hook_deleted'] = "\$this->callHook('deleted', \${$codes['alias']});";
                elseif (trim($value) == 'restored')
                    $codes['hook_restored'] = "\$this->callHook('restored', \${$codes['alias']});";
            }
            $hookFile = app_path("Hooks/{$codes['model']}Hook.php");
            $buildHook = APIToolzGenerator::blend('hook.tpl', $codes);
            if (!file_exists($hookFile)) {
                if (!is_dir(app_path("Hooks")))
                    mkdir(app_path("Hooks"), 0775, true);
                file_put_contents($hookFile, $buildHook);
            }
        } else {
            $hookFile = app_path("Hooks/{$codes['model']}Hook.php");
            @unlink($hookFile);
        }

        if (!$model->lock || ($model->lock && !in_array('request', $model->lock))) {
            $requestFile = app_path("Http/Requests/{$codes['class']}Request.php");
            $buildRequest = APIToolzGenerator::blend('request.tpl', $codes);
            if (!is_dir(app_path("Http/Requests")))
                mkdir(app_path("Http/Requests"), 0775, true);
            file_put_contents($requestFile, $buildRequest);
        }

        if (!$model->lock || ($model->lock && !in_array('resource', $model->lock))) {
            $resourceFile = app_path("Http/Resources/{$codes['class']}Resource.php");
            $buildResource = APIToolzGenerator::blend('resource.tpl', $codes);
            if (!is_dir(app_path("Http/Resources")))
                mkdir(app_path("Http/Resources"), 0775, true);
            file_put_contents($resourceFile, $buildResource);
        }
        if (!$model->lock || ($model->lock && !in_array('service', $model->lock))) {
            $serviceFile = app_path(path: "Services/{$codes['class']}Service.php");
            $buildService = APIToolzGenerator::blend('service.tpl', $codes);
            if (!is_dir(app_path("Services")))
                mkdir(app_path("Services"), 0775, true);
            file_put_contents($serviceFile, $buildService);
        }

        if (!$model->lock || ($model->lock && !in_array('controller', $model->lock))) {
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
        Artisan::call('l5-swagger:generate');
        Artisan::call('scout:flush', ["model" => "App\\Models\\{$codes['model']}"]);
        Artisan::call('scout:import', ["model" => "App\\Models\\{$codes['model']}"]);
    }

    public static function buildConfiguration(Model $model, string $ask="") {
        $fields = \Schema::getColumns($model->table);
        $fields = collect($fields)->map(function ($field) {
            return $field["name"].":".$field["type"];
        })->toArray();
        $response = APIToolzGenerator::ask(
            "Create possible configuration commands for $model->name. $ask",
            self::getConfigurationHint(),
            $model->slug,
            $fields,
            ['general_configuration'],
            true);
        if($response->content) {
            preg_match_all("/'php artisan .*?'/", $response->content, $matches);
            // Clean up the quotes
            $commands = array_map(function ($cmd) {
                return trim($cmd, "'");
            }, $matches[0]);

            // Output the result
            foreach ($commands as $command) {
                echo $command . PHP_EOL;
                // Execute the artisan command
                $artisanCommand = str_replace('php artisan ', '', $command);
                Artisan::call($artisanCommand);
            }
        }
    }

    public static function buildMenuConfigure()
    {
        $models = Model::pluck('name');
        $response = APIToolzGenerator::ask(
            "Create complete menu configuration given json format, include dashbard, users and roles & permissions using lucide-react for icon. \n\n",
            self::getMenuHint(),
            'menu',
            $models,
            ['general_configuration'],
            true);

        // Extract JSON from the response content using regex
        if (preg_match('/\[\s*{.*}\s*\]/s', $response->content, $matches)) {
            $menuConfig = json_decode($matches[0], true);
        } else {
            $menuConfig = [];
        }
        $appSettings = AppSetting::where('key', 'default_settings')->first();
        if($appSettings) {
            $appSettings->menu_config = $menuConfig;
            $appSettings->save();
        }
    }

    public static function remove(Model $model)
    {
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

    static function getConfigurationHint()
    {
        return "
for cmd in \
    'php artisan apitoolz:request Product --field=category_id --input-type=select --opt-type=external --lookup-model=Category --lookup-value=name --label=\"Choose Category\' \
    'php artisan apitoolz:request Product --field=name --validator=\"required|string|max:255\" --input-type=text' \
    'php artisan apitoolz:request Product --field=price --validator=\"required|numeric|min:0\" --input-type=number' \
    'php artisan apitoolz:request Product --field=description --input-type=textarea' \
    'php artisan apitoolz:request Product --field=status --input-type=select --opt-type=datalist --lookup-query=\"0:In-Active|1:Active\"' \
    'php artisan apitoolz:response Product --field=name --label=\"Product Name\" --visible=true --export=true --position=1' \
    'php artisan apitoolz:response Product --field=price --label=\"Price\" --visible=true --export=true --position=2' \
    'php artisan apitoolz:response Product --field=category_id --label=\"Category\" --visible=true --export=true --position=3' \
    'php artisan apitoolz:summary Product --title=\"Total Products\" --type=kpi --method=count --position=1 --force' \
    'php artisan apitoolz:summary Product --title=\"Total Inventory Value\" --type=kpi --method=sum --column=price --position=3 --force' \
    'php artisan apitoolz:summary Purchaseorder --title=\"Product by Category\" --type=chart --chart-type=bar --group-by=category_id --group-model=Category --group-label=name --aggregate=count --position=3 --force'
    'php artisan apitoolz:relation Product --title=category --relation-model=Category --relation-type=belongsTo --foreign-key=category_id --display-field=name --force' \
    'php artisan apitoolz:filter Product --title=\"Cateory\" --filter-type=select --filter-model=Category --filter-key=category_id --filter-value=id --filter-label=name --position=1 --force' \
    'php artisan apitoolz:filter Product --title=\"Date\" --filter-type=date --filter-key=created_at --position=9 --force'
do
    echo \"Running: \$cmd\"
    eval \$cmd
done";
    }

    static function getMenuHint()
    {
        return '[
    {
        "icon": "home-2",
        "path": "/admin",
        "title": "Dashboards"
    },
    {
        "icon": "shield-search",
        "title": "News Feeds",
        "children": [
            {
                "path": "/admin/model/newsfeed",
                "title": "News"
            },
            {
                "path": "/admin/model/author",
                "title": "Authors"
            }
        ]
    },
    {
        "icon": "discount",
        "path": "/admin/model/promotionbanner",
        "title": "Promotion Banner"
    },
    {
        "heading": "My Mandalay"
    },
    {
        "icon": "map",
        "path": "/admin/model/zone",
        "title": "Zone"
    },
    {
        "icon": "two-credit-cart",
        "path": "/admin/model/payment",
        "title": "Payments"
    },
    {
        "icon": "users",
        "title": "Customers",
        "children": [
            {
                "path": "/admin/model/customer",
                "title": "Customers"
            },
            {
                "path": "/admin/model/country",
                "title": "Countries"
            },
            {
                "path": "/admin/model/city",
                "title": "Cities"
            },
            {
                "path": "/admin/model/township",
                "title": "Township"
            }
        ]
    },
    {
        "icon": "crown",
        "title": "Loyalty & Rewards",
        "children": [
            {
                "path": "/admin/model/loyaltypoint",
                "title": "Loyalty Points"
            },
            {
                "path": "/admin/model/redemption",
                "title": "Redemptions"
            },
            {
                "path": "/admin/model/bonusreward",
                "title": "Bonus Rewards"
            },
            {
                "path": "/admin/model/referral",
                "title": "Referrals"
            },
            {
                "path": "/admin/model/pointtransfer",
                "title": "Point Transfers"
            }
        ]
    },
    {
        "heading": "Manage User"
    },
    {
        "icon": "users",
        "path": "/admin/users",
        "title": "Users"
    },
    {
        "icon": "security-user",
        "path": "/admin/roles",
        "title": "Roles & Permssions"
    }
]';
    }


}
