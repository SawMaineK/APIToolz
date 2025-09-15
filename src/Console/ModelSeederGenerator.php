<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\SeederBuilder;

class ModelSeederGenerator extends Command
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
    protected $signature = 'apitoolz:seeder {model} {--key=} {--data=} {--count=} {--use-ai} {--ask=} {--force} {--doc}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('doc')) {
            $this->printDocumentation();
            return;
        }
        $name = $this->argument('model');
        $model = Model::where('name', $name)->first();
        if($model) {
            $roles = [
                'key' => [
                    'required',
                    'string',
                    function ($attribute, $value, $fail) use ($model) {
                        if (!empty($value) && !\Schema::hasColumn($model->table, $value)) {
                            $fail("The selected key '{$value}' does not exist in the model table.");
                        }
                    }
                ],
                'data'  => 'nullable'
            ];
            $data = [
                'key'         => $this->option('key'),
                'data'        => $this->option('data') ?? '[]',
                'count'        => $this->option('count') ?? 5,
                'force'       => $this->option('force'),
                'use_ai'      => $this->option('use-ai'),
                'ask'      => $this->option('ask')
            ];

            // Remove keys with null values
            $data = array_filter($data, function($value) {
                return !is_null($value);
            });
            $validator = \Validator::make($data, $roles);
            if ($validator->fails() && !$this->option('remove')) {
                foreach($validator->errors()->messages() as $key => $err) {
                    $this->error($err[0]);
                }
                return;
            }
            SeederBuilder::run($model, $data);

            return $this->info("The " . strtolower($name) . " seeder has created successfully.");

        } else {
            $this->error("This $name model not found.");
        }
    }

    protected function printDocumentation()
    {
        $this->info("Usage: php artisan apitoolz:seeder {model} {--key=} {--data=} {--count=} {--use-ai} {--ask=} {--force} {--doc}");
        $this->info("");
        $this->info("Options:");
        $this->info("  --key=         The unique key field in the model table to ensure uniqueness.");
        $this->info("  --data=       JSON string of additional data to include in each record.");
        $this->info("  --count=      Number of records to generate (default is 5).");
        $this->info("  --use-ai      Use AI to generate realistic data.");
        $this->info("  --ask=        Comma-separated list of fields to prompt for user input.");
        $this->info("  --force       Overwrite existing records with the same key.");
        $this->info("  --doc         Display this documentation.");
        $this->info("");
        $this->info("Example:");
        $this->info('  php artisan apitoolz:seeder User --key=email --data=\'{\"status\":\"active\"}\' --count=10 --use-ai --ask=first_name,last_name');
    }

}
