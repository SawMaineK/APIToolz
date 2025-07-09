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
                    'enum' => isset($field['enum']) ? $field['enum'] : null,
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
        return 1;
    }

    public static function buildWithSql($table, $sql, $softDelete = false)
    {
        try {
            // ────────── SQLite-specific rewrites ──────────
            if (\DB::getDriverName() === 'sqlite') {

                // 1️⃣  back-ticks → double quotes
                $sql = str_replace('`', '"', $sql);

                // 2️⃣  ENUM(…) → TEXT CHECK(…)
                $sql = preg_replace_callback(
                    '/ENUM\s*\(([^)]+)\)/i',
                    function ($matches) {
                        // extract enum values, keep quotes clean
                        $values = array_map(
                            fn ($v) => trim($v, " '\""),
                            explode(',', $matches[1])
                        );
                        // find the column name immediately before ENUM
                        if (preg_match('/([\w"]+)\s+ENUM/i', $matches[0], $m)) {
                            $col = trim($m[1], '"');
                        } else {
                            $col = 'value';
                        }
                        return 'TEXT CHECK("' . $col . '" IN (\'' . implode("','", $values) . "'))";
                    },
                    $sql
                );

                // 3️⃣  INT AUTO_INCREMENT PRIMARY KEY → INTEGER PRIMARY KEY AUTOINCREMENT
                $sql = preg_replace(
                    '/\bINT\s+AUTO_INCREMENT\s+PRIMARY\s+KEY\b/i',
                    'INTEGER PRIMARY KEY AUTOINCREMENT',
                    $sql
                );

                // 4️⃣  standalone AUTO_INCREMENT (rare in CREATE TABLE …) → nothing
                $sql = preg_replace('/\bAUTO_INCREMENT\b/i', '', $sql);

                // 5️⃣  UNIQUE KEY name (a,b)  →  UNIQUE(a,b)
                $sql = preg_replace(
                    '/UNIQUE\s+KEY\s+\w+\s*\(([^)]+)\)/i',
                    'UNIQUE($1)',
                    $sql
                );

                // 6️⃣  ordinary KEY / INDEX lines – strip them (SQLite needs CREATE INDEX)
                $sql = preg_replace('/,\s*KEY\s+\w+\s*\([^)]+\)/i', '', $sql);
            }

            // ────────── run the (now compatible) SQL ──────────
            \DB::unprepared($sql);

            /* ------ rest of your original logic ------ */
            $columns     = \Schema::getColumns(\Str::lower($table));
            $foreignKeys = \Schema::getForeignKeys(\Str::lower($table));

            $fields = [];
            foreach ($columns as $col) {
                if (
                    $col['type_name'] !== 'int auto_increment' &&
                    ! in_array($col['name'], ['id', 'created_at', 'updated_at', 'deleted_at'])
                ) {
                    $field = [
                        'name'    => $col['name'],
                        'type'    => self::toCastFieldType($col['type_name']),
                        'null'    => $col['nullable'],
                        'default' => $col['default'],
                    ];

                    // capture enum values (if Schema reader still exposes them)
                    if (isset($col['type']) && str_starts_with($col['type'], 'enum(')) {
                        if (preg_match('/^enum\((.*)\)$/', $col['type'], $m)) {
                            $field['enum'] = array_map(
                                fn ($v) => trim($v, " '\""),
                                explode(',', $m[1])
                            );
                        }
                    } else {
                        $field['enum'] = $col['enum'] ?? null;
                    }

                    $fields[] = $field;
                }
            }

            // rebuild via APIToolz column builder
            \Schema::dropIfExists($table);
            self::build($table, $fields, $softDelete, $foreignKeys);

        } catch (\Exception $e) {
            echo $e->getMessage() . PHP_EOL . 'Abort…' . PHP_EOL;
            dd();
        }

        return 1;
    }


    public static function addField($table, $field = [])
    {
        $columns = \Schema::getColumns(\Str::lower($table));
        if (count($columns) >= 1) {
            $codes['title'] = \Str::studly($field['name']);
            $codes['class'] = \Str::studly($table);
            $codes['table'] = \Str::lower($table);
            $codes['column'] = $field['name'];
            $codes['field'] = self::getFieldMigrate($field['name'], [
                'type' => $field['type'],
                'default' => isset($field['default']) ? $field['default'] : null,
                'null' => isset($field['null']) ? $field['null'] : null,
            ], $field['after']);

            try {
                $dir = base_path("database/migrations/" . date('Y_m_d_his') . "_add_{$codes['column']}_to_{$codes['table']}_table.php");
                $build_migration = APIToolzGenerator::blend('database.field.add.tpl', $codes);
                file_put_contents($dir, $build_migration);

                \Artisan::call('migrate', ["--force" => true]);
            } catch (\Exception $e) {
                @unlink($dir);
                echo "{$e->getMessage()}\n";
                echo "Abort...\n";
                dd();
            }
        } else {
            echo "This {$table} table is don\'t exist.\n";
            echo "Abort...\n";
            dd();
        }
        return 1;
    }

    public static function updateField($table, $name = "", $field = [])
    {
        $columns = \Schema::getColumns(\Str::lower($table));
        if (count($columns) >= 1) {
            $codes['title'] = \Str::studly($name);
            $codes['class'] = \Str::studly($table);
            $codes['table'] = \Str::lower($table);
            $codes['rename'] = $field['name'] != $name ? "\t\t\t\$table->renameColumn('{$name}', '{$field['name']}');" : "";
            $codes['field'] = self::getFieldMigrate($name, [
                'type' => $field['type'],
                'default' => isset($field['default']) ? $field['default'] : null,
                'null' => isset($field['null']) ? $field['null'] : null,
            ], $field['after'], true);
            try {
                $dir = base_path("database/migrations/" . date('Y_m_d_his') . "_update_{$name}_field_in_{$table}_table.php");
                $build_migration = APIToolzGenerator::blend('database.field.edit.tpl', $codes);
                file_put_contents($dir, $build_migration);
                \Artisan::call('migrate', ["--force" => true]);
            } catch (\Exception $e) {
                @unlink($dir);
                echo "{$e->getMessage()}\n";
                echo "Abort...\n";
                dd();
            }
        } else {
            echo "This {$table} table is don\'t exist.\n";
            echo "Abort...\n";
            dd();
        }
        return 1;
    }

    public static function dropField($table, $field = "")
    {
        $columns = \Schema::getColumns(\Str::lower($table));
        if (count($columns) >= 1) {
            $codes['title'] = \Str::studly($field);
            $codes['class'] = \Str::studly($table);
            $codes['table'] = \Str::lower($table);
            $codes['column'] = $field;

            try {
                $dir = base_path("database/migrations/" . date('Y_m_d_his') . "_drop_{$codes['column']}_from_{$codes['table']}_table.php");
                $build_migration = APIToolzGenerator::blend("database.field.drop.tpl", $codes);
                file_put_contents($dir, $build_migration);

                \Artisan::call('migrate', ["--force" => true]);
            } catch (\Exception $e) {
                @unlink($dir);
                echo "{$e->getMessage()}\n";
                echo "Abort...\n";
                dd();
            }
        } else {
            echo "This {$table} table is don\'t exist.\n";
            echo "Abort...\n";
            dd();
        }
        return 1;
    }

    public static function remove($table)
    {
        if (\DB::getDriverName() === 'sqlite') {
            \DB::statement('PRAGMA foreign_keys = OFF');
        }
        \Schema::dropIfExists($table);
        $migrations = glob(base_path("database/migrations/*_{$table}_table.php"));
        foreach($migrations as $filePath) {
            @unlink($filePath);
        }
        if (\DB::getDriverName() === 'sqlite') {
            \DB::statement('PRAGMA foreign_keys = ON');
        }
    }

    static function getFieldMigrate($field, $option = [], $after = null, $modify = false)
    {
        $type = $option['type'];
        if (isset($option['enum']) && $option['enum'] != null) {
            $type = 'enum';
            $option['default'] = isset($option['default']) ? $option['default'] : $option['enum'][0];
            $column = "\t\t\t\$table->{$type}('{$field}', ['" . implode("', '", $option['enum']) . "'])";
        } else {
           $column = "\t\t\t\$table->{$type}('{$field}')";
        }
        if ($option['default'] != "") {
            $defaultValue = str_replace("'", "", $option['default']);
            $column = "{$column}->default('{$defaultValue}')";
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
            case 'bigint unsigned':
                return 'unsignedBigInteger';
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
            case 'enum':
                return 'enum';
            default:
                return $type;
        }
    }
}
