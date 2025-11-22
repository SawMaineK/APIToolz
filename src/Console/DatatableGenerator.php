<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;
use Sawmainek\Apitoolz\DatatableBuilder;

class DatatableGenerator extends Command
{
    public $fields = [];

    protected $signature = 'apitoolz:datatable
        {table : The name of the table to process}
        {--sql= : Provide raw SQL for table creation}
        {--add-field= : Add a new field to existing table}
        {--update-field= : Update a field in existing table}
        {--rename= : Rename the field being updated}
        {--drop-field= : Remove a field from the table}
        {--type=string : Field type (default string)}
        {--not-null : Make field NOT NULL}
        {--default= : Default value for the field}
        {--field-after=id : Place new field after which column}
        {--soft-delete : Enable soft deletes}
        {--remove : Drop entire table}
        {--generate-migration : Generate migration file from existing table}
        {--doc : Show documentation}';

    protected $description = 'Generate or modify datatable and optionally generate migration from existing table.';

    public function handle()
    {
        if ($this->option('doc')) {
            $this->printDocumentation();
            return;
        }

        $table = Str::lower($this->argument('table'));

        if ($this->option('generate-migration')) {
            if (!\Schema::hasTable($table)) {
                return $this->error("❌ The table '$table' does not exist in the database.");
            }

            $this->info("🔄 Generating migration for existing table: {$table}");
            DatatableBuilder::generateMigrationFromExisting($table);
            $this->info("✅ Migration for '{$table}' has been created successfully in database/migrations/");
            return;
        }

        $this->info('🧱 Generating Datatable...');
        $this->warn('Note: id, created_at, updated_at, deleted_at are added automatically.');

        if (!\Schema::hasTable($table)) {
            if ($this->option('sql')) {
                DatatableBuilder::buildWithSql($table, $this->option('sql'), $this->option('soft-delete'));
                $this->info("✅ The $table table has been created successfully.");
            } else {
                $fields = $this->askTableField();
                DatatableBuilder::build($table, $fields, $this->option('soft-delete'));
                $this->info("✅ The $table table has been created successfully.");
            }

            if ($this->option('migrate')) {
                Artisan::call('migrate');
                $this->info("📦 Migration executed for $table.");
            }
        } else {
            // Table already exists — perform updates/removals
            if ($this->option('add-field')) {
                DatatableBuilder::addField($table, [
                    'name' => $this->option('add-field'),
                    'type' => $this->option('type'),
                    'default' => $this->option('default'),
                    'null' => !$this->option('not-null'),
                    'after' => $this->option('field-after'),
                ]);
                return $this->info("✅ Added new field '{$this->option('add-field')}' to $table.");
            } elseif ($this->option('update-field')) {
                DatatableBuilder::updateField($table, $this->option('update-field'), [
                    'name' => $this->option('rename') ?: $this->option('update-field'),
                    'type' => $this->option('type'),
                    'default' => $this->option('default'),
                    'null' => !$this->option('not-null'),
                    'after' => $this->option('field-after'),
                ]);
                return $this->info("✅ Updated field '{$this->option('update-field')}' in $table.");
            } elseif ($this->option('drop-field')) {
                DatatableBuilder::dropField($table, $this->option('drop-field'));
                return $this->info("🗑️ Dropped field '{$this->option('drop-field')}' from $table.");
            } elseif ($this->option('remove')) {
                DatatableBuilder::remove($table);
                return $this->info("❌ Table $table has been removed successfully.");
            }

            $this->error("⚠️ The table $table already exists. Use options like --add-field, --update-field, or --generate-migration.");
        }
    }

    protected function askTableField()
    {
        $field['name'] = $this->ask("- What is the field name? (e.g., name, age)");
        $field['type'] = $this->ask("- What is the data type of {$field['name']}? (string, text, int, etc.)", 'string');
        $field['null'] = $this->ask("- Is {$field['name']} nullable? (yes/no)", 'yes');
        $this->fields[] = $field;

        $more = $this->ask("Do you want to add another field? (yes/no)", 'no');
        if (in_array(strtolower($more), ['yes', 'y'])) {
            return $this->askTableField();
        }

        return $this->fields;
    }

    protected function printDocumentation()
    {
        $this->info("📘 API Toolz Datatable Generator Documentation");
        $this->line("");
        $this->line("Usage:");
        $this->line("  php artisan apitoolz:datatable table_name [options]");
        $this->line("");
        $this->info("Options:");
        $this->line("  --sql=                Create table from raw SQL");
        $this->line("  --add-field=          Add a new column");
        $this->line("  --update-field=       Update or rename a column");
        $this->line("  --rename=             Rename a field");
        $this->line("  --drop-field=         Drop a field");
        $this->line("  --soft-delete         Enable soft deletes");
        $this->line("  --remove              Drop the table");
        $this->line("  --generate-migration  Create migration file from existing table");
        $this->line("  --migrate             Run the migration after creation");
        $this->line("  --doc                 Show documentation");
        $this->line("");
        $this->info("Examples:");
        $this->line("  php artisan apitoolz:datatable users --generate-migration");
        $this->line("  php artisan apitoolz:datatable posts --add-field=title --type=string --not-null");
        $this->line("  php artisan apitoolz:datatable products --sql=\"CREATE TABLE products (...)\"");
    }
}
