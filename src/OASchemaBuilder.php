<?php

namespace Sawmainek\Apitoolz;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class OASchemaBuilder
{
    public static function generateSchema(string $table, string $model, bool $isResource = false): string
    {
        if (!Schema::hasTable($table)) {
            throw new \Exception("Table '{$table}' does not exist.");
        }

        $columns = Schema::getColumnListing($table);

        return $isResource
            ? self::generateResourceSchema($model, $columns, $table)
            : self::generateRequestSchema($model, $columns, self::getRequiredColumns($table), $table);
    }

    private static function getRequiredColumns(string $table): array
    {
        $columns = \Schema::getColumns($table);
        $requiredColumns = [];
        foreach ($columns as $col) {
            if (isset($col['null']) && $col['null'] === 'NO' && $col['default'] === null) {
                $requiredColumns[] = $col['name'];
            }
        }
        return $requiredColumns;
    }

    private static function generateRequestSchema(string $model, array $columns, array $requiredColumns, string $table): string
    {
        $columns = array_diff($columns, ['id','created_at', 'updated_at', 'deleted_at']);
        $properties = self::generateProperties($columns, $table);
        $requiredList = implode('", "', $requiredColumns);

        return <<<PHP
/**
 * @OA\Schema(
 *     schema="{$model}Request",
 *     required={ "{$requiredList}" },
$properties * )
 */

PHP;
    }

    private static function generateResourceSchema(string $model, array $columns, string $table): string
    {
        $columns = array_diff($columns, ['deleted_at']);
        $properties = self::generateProperties($columns, $table, includeTimestamps: true);

        return <<<PHP
/**
 * @OA\Schema(
 *     schema="{$model}Resource",
$properties * )
 */

PHP;
    }

    private static function generateProperties(array $columns, string $table, bool $includeTimestamps = false): string
    {
        $properties = '';
        $count = count($columns);
        $index = 0;

        foreach ($columns as $column) {
            $type = self::mapColumnTypeToSwaggerType($table, $column);

            $format = ($column === 'email') ? ', format="email"' : '';
            $format = ($type === 'string' && str_contains($column, '_at')) ? ', format="date-time"' : $format;
            $eType = ($type === 'string' && str_contains($column, '_at')) ? 'date-time' : $type;
            $example = self::generateExampleValue($eType, $column);

            $index++;
            $comma = ($index === $count) ? '' : ','; // Remove comma for last property if no timestamps

            $properties .= " *     @OA\Property(property=\"{$column}\", type=\"{$type}\"{$format}, example=\"{$example}\"){$comma}\n";
        }

        if ($includeTimestamps && !in_array('created_at', $columns)) {
            $properties .= " *     @OA\Property(property=\"created_at\", type=\"string\", format=\"date-time\", example=\"2025-02-11T12:00:00Z\"),\n";
            $properties .= " *     @OA\Property(property=\"updated_at\", type=\"string\", format=\"date-time\", example=\"2025-02-11T12:30:00Z\")\n"; // No comma here
        }

        return $properties;
    }

    private static function mapColumnTypeToSwaggerType(string $table, string $column): string
    {
        $type = DB::getSchemaBuilder()->getColumnType($table, $column);

        return match ($type) {
            'integer', 'bigint', 'smallint' => 'integer',
            'decimal', 'float', 'double' => 'number',
            'boolean' => 'boolean',
            'json' => 'object',
            default => 'string',
        };
    }

    private static function generateExampleValue(string $type, string $column): string
    {
        return match ($type) {
            'integer' => rand(1, 100),
            'number' => round(mt_rand(100, 1000) / 10, 2),
            'boolean' => 'true',
            'object' => '{}',
            'date-time' => now()->toDateTimeString(),
            default => ucfirst($column) . " Example",
        };
    }
}
