<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\APIToolzGenerator;

class OpenAIGenerator extends Command
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
    protected $signature = 'apitoolz:ai {--requirement=} {--dummy-data}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Try your solution with our AI';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Requesting your requirement...');

        $requirement = $this->option('requirement');
        if($requirement == '') {
            $requirement = $this->ask("Please enter your requirement.");
        }
        $results = APIToolzGenerator::askSolution($requirement, $this->option('dummy-data'));
        foreach($results as $table => $value) {
            $model = \Str::singular($table);
            if(!\Schema::hasTable($table)) {
                $this->info("Generating model for $model...");
                \Artisan::call("apitoolz:model", [
                    'model' => $model,
                    '--table' => $table,
                    '--sql' => $value->tables[0],
                    '--force' => true
                ]);
                if(\Schema::hasTable($table)) {
                    if($this->option('dummy-data') && isset($value->data)) {
                        foreach($value->data as $row) {
                            \DB::unprepared($row);
                        }
                    }
                }
            }

        }
        return $this->info("Your solution has created successfully, Now you can check swagger docs [/api/documentation].");
    }
}
