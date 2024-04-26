<?php

namespace Sawmainek\Apitoolz;
use Sawmainek\Apitoolz\APIToolzGenerator;

class DatatableBuilder
{
    public static function build($table, $fields, $softDelete = false, $foreignKeys=[], $fileDir = "")
    {
        $codes['class'] = \Str::studly($table);
        $codes['table'] = \Str::lower($table);
        $codes['fields'] = [];
        $codes['soft_delete'] = $softDelete ? '$table->softDeletes();': '';
        $codes['foreign_keys'] = [];

        // Create table fields
        $data['fields'] = $fields;
        foreach ($data['fields'] as $i => $field) {
            if ($field['name'] && $field['name'] != 'id') {
                $codes['fields'][] = self::getFieldMigrate($field['name'], [
                    'type' => $field['type'],
                    'default' => isset($field['default']) ? $field['default'] : null,
                    'null' => isset($field['null']) ? $field['null'] : null,
                ]);
            }
        }

        //Create foreignkey
        foreach($foreignKeys as $key) {
            $codes['foreign_keys'][] = "\t\t\t\$table->foreign('{$key['columns'][0]}')->references('{$key['foreign_columns'][0]}')->on('{$key['foreign_table']}');\n";
        }

        try {
            $dir = "";
            if($fileDir != "") {
                $dir = $fileDir;
            } else {
                $dir = base_path("database/migrations/" . date('Y_m_d_his') . "_create_{$codes['table']}_table.php");
            }
            $build_migration = APIToolzGenerator::blend('database.table.create.tpl', $codes);
            file_put_contents($dir, $build_migration);
            \Artisan::call('migrate', ["--force" => true]);
        } catch (\Exception $e) {
            @unlink($dir);
            echo "{$e->getMessage()}\n";
            echo "Abort...\n";
            dd();
        }
    }

    public static function buildWithSql($table, $sql, $softDelete = false)
    {
        try {
            \DB::unprepared($sql);
            $columns = \Schema::getColumns(\Str::lower($table));
            $indexes = \Schema::getIndexes(\Str::lower($table));
            $foreignKeys = \Schema::getForeignKeys(\Str::lower($table));
            $fields = [];
            foreach($columns as $col) {
                if($col['type_name'] != "int auto_increment" && $col['name'] != 'id' && $col['name'] != 'created_at' && $col['name'] != 'updated_at' && $col['name'] != 'deleted_at') {
                    $field['name'] = $col['name'];
                    $field['type'] = self::toCastFieldType($col['type_name']);
                    $field['null'] = $col['nullable'];
                    $fields[] = $field;
                }
            }
            \DB::unprepared("DROP table $table;");
            self::build($table, $fields, $softDelete, $foreignKeys);
        } catch (\Exception $e) {
            @unlink($dir);
            echo "{$e->getMessage()}\n";
            echo "Abort...\n";
            dd();
        }
    }

    public static function remove($table)
    {
        \DB::unprepared("Drop Table $table;");
        $migrations = glob(base_path("database/migrations/*_{$table}_table.php"));
        foreach($migrations as $filePath) {
            @unlink($filePath);
        }
    }

    static function getFieldMigrate($field, $option = [], $after = null, $modify = false)
    {
        $column = "\t\t\t\$table->{$option['type']}('{$field}')";
        if ($option['default'] != "") {
            $column = "{$column}->default({$option['default']})";
        }
        if ($option['null'] == 'yes' || $option['null'] == 'y') {
            $column = "{$column}->nullable()";
        } else {
            $column = "{$column}->nullable(false)";
        }
        if ($after) {
            $column = "{$column}->after('{$after}')";
        }
        if ($modify) {
            $column = "{$column}->change()";
        }
        return  "{$column}; \n";
    }

    public static function toCastFieldType($type = null)
    {
        switch ($type) {
            case 'bigint':
                return 'bigInteger';
            case 'int':
                return 'integer';
            case 'mediuminit':
                return 'mediumInteger';
            case 'smallint':
                return 'smallInteger';
            case 'tinyint':
                return 'tinyInteger';
            case 'varchar':
                return 'string';
            case 'character':
                return 'string';
            case 'numeric':
                return 'decimal';
            default:
                return $type;
        }
    }
}
