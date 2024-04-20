<?php

namespace Sawmainek\Apitoolz\Facades;

class ModelConfigUtils
{
    public static function checkAvailableName($name) {
        $dontUseName = ['User','Role'];
        return count(array_filter($dontUseName, fn($usedName) => $usedName === $name)) > 0;
    }

    public static function findPrimaryKey($table)
    {
        $indexs = \Schema::getIndexes($table);
        $primaryKey = array_filter($indexs, fn($index) => $index['name'] === 'primary');
        return $primaryKey[0]['columns'][0] ?? "id";
    }

    public static function hasTable($name)
    {
        $tables = \Schema::getTables();
        $hasTabel = array_filter($tables, fn($table) => $table['name'] === $name);
        return count($hasTabel) > 0;
    }

    public static function decryptJson($str)
    {
        $dec = strtr($str, '123456poligamI', 'poligamI123456');
        $dec = base64_decode($dec);
        $obj = json_decode($dec, true);
        return $obj;
    }

    public static function encryptJson($arr)
    {
        $str = json_encode($arr);
        $enc = base64_encode($str);
        $enc = strtr($enc, 'poligamI123456', '123456poligamI');
        return $enc;
    }

    public static function getFormConfig($class, $table, $column, $forms = [], $sort, $reset = false)
    {
        $field = explode(' ', $column['name']);
        // return the field already existing in config;
        if ($forms && !$reset) {
            foreach ($forms as $form) {
                if ($form['field'] == $field[0]) {
                    return $form;
                }
            }
        }

        // else return new field config;
        $type = explode(' ', $column['type']);
        return self::configForm($class, $field[0], $table, $type[0], $column['nullable'], $column['ordinal_position'] ?? $sort);
    }

    public static function getGridConfig($class, $table, $column, $grids = [], $sort)
    {
        $field = explode(' ', $column['name']);
        // return existing field config;
        if ($grids) {
            foreach ($grids as $grid) {
                if ($grid['field'] == $field[0]) {
                    return $grid;
                }
            }
        }
        // else return new field config;
        return self::configGrid($class, $field[0], $table, $column['ordinal_position'] ?? $sort);
    }

    static function configForm($class, $field, $table, $type, $null, $sort, $opt = array())
    {
        $forms = array(
            "class" => $class,
            "field" => $field,
            "alias" => $table,
            'data_type' => $type,
            'type' => self::getType($type),
            'length' => self::getLength($type),
            'cast' => self::getCast($type),
            "label" => \Str::title(str_replace('_', ' ', $field)),
            'validator' => $type != 'hidden' && !$null ? 'required' : '',
            'view' => $field == 'created_at' || $field == 'updated_at' || $field == 'deleted_at' ? false : true,
            'add' => $field == 'deleted_at' ? false : true,
            'edit' => $field == 'deleted_at' ? false : true,
            'search' => $field == 'deleted_at' ? false : true,
            'size'  => 'auto',
            "sortlist" => $sort,
            'format_value' => '',
            'file' => array(
                'image_multiple' => false,
                'save_full_path' => false,
                'path_to_upload' => '',
                'upload_type' => '',
                'upload_max_size' => '',
            ),
            'option' => array(
                'opt_type'  => '',
                'lookup_model' => '',
                'lookup_table' => '',
                'lookup_key' => '',
                'lookup_value' => '',
                'lookup_dependency_key' => '',
                'lookup_is_dependency_query' => '0',
                'is_dependency' => '',
                'lookup_query' => '',
                'allow_filter_listing' => '0',
                'typeahead' => '0',
                'select_multiple' => '0',
                'tooltip' => '',
                'helptext'  => '',
                'placeholder' => '',
                'attribute'  => '',
                'prefix' => '',
                'sufix' => '',
            )
        );
        return $forms;
    }

    static function configGrid($class, $field, $alias, $sort)
    {
        $grid = array(
            "class" => $class,
            "field" => $field,
            "alias" => $alias,
            "label" => ucwords(str_replace('_', ' ', $field)),
            "language" => array(),
            "search" => true,
            "download" => true,
            "align"  => 'left',
            "view" => $field == 'updated_at' || $field == 'deleted_at' ? false : true,
            "detail" => true,
            "sortable" => true,
            "frozen" => false,
            'hidden' => false,
            "sortlist" => $sort,
            "width" => 'auto',
            "conn" => array('valid' => false, 'db' => '', 'key' => '', 'display' => '', 'model' => ''),
            "format_as" => '',
            "format_value" => '',
        );
        return $grid;
    }

    static function getType($type)
    {
        $types = explode('(', $type);
        switch ($types[0]) {
            case 'varchar':
                return 'text';
            case 'text':
                return 'textarea';
            case 'mediumtext':
                return 'textarea';
            case 'longtext':
                return 'texteditor';
            case 'date':
                return 'date';
            case 'datetime':
                return 'datetime';
            case 'timestamp':
                return 'datetime';
            case 'blob':
                return 'textarea';
            default:
                return 'text';
        }
    }

    static function getLength($type)
    {
        preg_match("/\((.*)\)/i", $type, $length);
        return (isset($length[1])) ? $length[1] : '';
    }

    static function getCast($type)
    {
        $types = explode('(', $type);
        switch ($types[0]) {
            case 'bigint':
                return 'integer';
            case 'int':
                return 'integer';
            case 'mediuminit':
                return 'integer';
            case 'smallint':
                return 'integer';
            case 'tinyint':
                return 'boolean';
            case 'timestamp':
                return 'datetime';
            case 'varchar':
                return 'string';
            case 'character':
                return 'string';
            case 'text':
                return 'string';
            case 'mediumtext':
                return 'string';
            case 'numeric':
                return 'float';
            default:
                return $types[0];
        }
    }
}
