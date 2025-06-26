<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\Facades\ModelConfigUtils;
use Sawmainek\Apitoolz\ModelBuilder;
use Sawmainek\Apitoolz\DatatableBuilder;
use Sawmainek\Apitoolz\APIToolzGenerator;
use Illuminate\Support\Facades\Artisan;
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

    }

}
