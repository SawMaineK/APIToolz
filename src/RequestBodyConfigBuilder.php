<?php

namespace Sawmainek\Apitoolz;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\Facades\ModelConfigUtils;

class RequestBodyConfigBuilder
{
    public static function build($model, $request, $reset = false)
    {
        $config = ModelConfigUtils::decryptJson($model->config);
        foreach ($config['forms'] as $i => $form) {
            if($form['field'] == $request['field']) {
                if($reset) {
                    $columns = \Schema::getColumns($form['alias']);
                    $fieldIndex = array_search($form['field'], array_column($columns, 'name'));
                    $column = $columns[$fieldIndex];
                    $config['forms'][$i] = ModelConfigUtils::getFormConfig($form['class'], $form['alias'], $column, $config['forms'], $i, true);
                } else {
                    $config['forms'][$i]['label'] = $request['label'] ?? $form['label'];
                    $config['forms'][$i]['type'] = $request['type'] ?? $form['type'];
                    $config['forms'][$i]['validator'] = $request['validator'] ?? $form['validator'];
                    $config['forms'][$i]['cast'] = $request['cast'] ?? $form['cast'];
                    $config['forms'][$i]['search'] = $request['search'] ?? $form['search'];
                    $config['forms'][$i]['view'] = $request['view'] ?? $form['view'];
                    $config['forms'][$i]['width'] = $request['width'] ?? $form['width'];
                    $config['forms'][$i]['sortlist'] = $request['sortlist'] ?? $form['sortlist'];

                    if($request['type'] == 'file') {
                        $config['forms'][$i]['file']['path_to_upload'] = $request['path_to_upload'];
                        $config['forms'][$i]['file']['upload_type'] = $request['upload_type'];
                        $config['forms'][$i]['file']['upload_max_size'] = $request['upload_max_size'];

                        if ($request['upload_max_size']) {
                            $max_size = $request['upload_max_size'] * 1024;
                            if($config['forms'][$i]['validator']) {
                                $config['forms'][$i]['validator'] .= "|file|max:{$max_size}";
                            } else {
                                $config['forms'][$i]['validator'] = "file|max:{$max_size}";
                            }
                        }
                        if ($request['image_multiple']) {
                            $config['forms'][$i]['file']['image_multiple'] = true;
                            $config['forms'][$i]['cast'] = 'array';
                        } else {
                            $config['forms'][$i]['file']['image_multiple'] = false;
                            $config['forms'][$i]['cast'] = 'object';
                        }
                    }

                    if ($request['type'] == 'number') {
                        $config['forms'][$i]['cast'] = 'integer';
                    }

                    if ($request['type'] == 'tags') {
                        $config['forms'][$i]['cast'] = 'array';
                    }

                    if ($request['type'] == 'date') {
                        $config['forms'][$i]['cast'] = 'date:Y-m-d';
                    }

                    if ($request['type'] == 'datetime') {
                        $config['forms'][$i]['cast'] = 'datetime:Y-m-d h:i:s';
                    }

                    if ($request['type'] == 'checkbox') {
                        $config['forms'][$i]['cast'] = 'boolean';
                    }

                    if ($request['type'] == 'select' || $request['type'] == 'radio') {

                        // Option Database Link Input Type
                        if ($request['opt_type'] == 'external') {
                            $lookupModel = Model::where('name', $request['lookup_model'])->first();
                            if($lookupModel || 'User') {
                                $config['forms'][$i]['option']['opt_type'] = $request['opt_type'];
                                $config['forms'][$i]['option']['lookup_model'] = $request['lookup_model'] == 'User' ? 'Users' : $request['lookup_model'];
                                $config['forms'][$i]['option']['lookup_table'] = $lookupModel->table ?? 'users';
                                $config['forms'][$i]['option']['lookup_key'] = $request['lookup_key'] ?? $lookupModel->key ?? 'id';
                                $config['forms'][$i]['option']['lookup_value'] = $request['lookup_value'];
                                if ($request['lookup_dependency_key']) {
                                    $config['forms'][$i]['option']['is_dependency'] = true;
                                    $config['forms'][$i]['option']['lookup_dependency_key'] = $request['lookup_dependency_key'];
                                    $config['forms'][$i]['option']['lookup_filter_key'] = $request['lookup_filter_key'] ??  $request['lookup_dependency_key'];
                                } else {
                                    $config['forms'][$i]['option']['is_dependency'] = false;
                                    $config['forms'][$i]['option']['lookup_dependency_key'] = '';
                                }
                            }
                        }

                        // Option Custom Input Type [Enum]
                        if ($request['opt_type'] == 'datalist') {
                            $config['forms'][$i]['option']['opt_type'] = $request['opt_type'];
                            $config['forms'][$i]['option']['lookup_query'] = $request['lookup_query'];
                        }

                        if ($request['select_multiple']) {
                            $config['forms'][$i]['option']['select_multiple'] = true;
                            $config['forms'][$i]['cast'] = 'array';
                        } else {
                            $config['forms'][$i]['option']['select_multiple'] = false;
                            $config['forms'][$i]['cast'] = ModelConfigUtils::getCast($config['forms'][$i]['data_type']);
                        }
                    }
                    // Additional Options
                    if(isset($request['size'])) {
                        $config['forms'][$i]['size'] = $request['size'];
                    }
                    if(isset($request['placeholder']) || isset($request['tooltip']) || isset($request['helptext']) || isset($request['prefix']) || isset($request['sufix'])) {
                        $config['forms'][$i]['option']['placeholder'] = $request['placeholder'];
                        $config['forms'][$i]['option']['tooltip'] = $request['tooltip'];
                        $config['forms'][$i]['option']['helptext'] = $request['helptext'];
                        $config['forms'][$i]['option']['prefix'] = $request['prefix'];
                        $config['forms'][$i]['option']['sufix'] = $request['sufix'];
                    }

                    if(isset($request['criteria_key']) && isset($request['criteria_value'])) {
                        $config['forms'][$i]['criteria'] = array();
                        $config['forms'][$i]['criteria']['key'] = $request['criteria_key'];
                        $config['forms'][$i]['criteria']['value'] = $request['criteria_value'];
                    }
                }

            }
        }
        usort($config['forms'], "self::_sort");
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
