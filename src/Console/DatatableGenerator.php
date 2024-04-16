<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\DatatableBuilder;

class DatatableGenerator extends Command
{
    public $fields = [];
    public function __construct()
    {
        parent::__construct();
    }
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'apitoolz:datatable {table} {--soft-delete} {--sql=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate data table based on provided name.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating Datatable...');
        $this->warn('Do not include table\'s id, created_at, updated_at and deleted_at. It will be auto included when generating.');
        
        $table = $this->argument('table');

        $columns = \Schema::getColumns(\Str::lower($table));
        if (count($columns) == 0) {
            if($this->option('sql') != '') {
                DatatableBuilder::buildWithSql($table, $this->option('sql'), $this->option('soft-delete'));
                $this->info("The $table table has created successfully.");
                return;
            }
            $fields = $this->askTableField();
            DatatableBuilder::build($table, $fields, $this->option('soft-delete'));
            $this->info("The $table table has created successfully.");
        } else {
            $this->error("This $table table is already exist.");
        }
        
    }

    function askTableField()
    {
        $field['name'] = $this->ask("- What is field name? (name, age, etc..)");
        $field['type'] = $this->ask("- What is data type of {$field['name']}? (string, text, int, etc..)",'string');
        $field['null'] = $this->ask("- This {$field['name']} is nullable? (yes/no)",'yes');
        $more = $this->ask("Do you want to add more field? (yes/no)", 'no');
        if($more == 'yes' || $more == 'y') {
            $this->fields[] = $field;
            return $this->askTableField();
        } else {
            $this->fields[] = $field;
        }
        return $this->fields;
    }
}
