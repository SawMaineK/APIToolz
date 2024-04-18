<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\ModelConfigUtils;
use Sawmainek\Apitoolz\ResponseConfigBuilder;

class ResponseConfigGenerator extends Command
{
    public function __construct()
    {
        parent::__construct();
    }
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'apitoolz:response {model} {--field=} {--label=} {--visible=true} {--export=true} {--position=} {--reset}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Field configuration for response body of model.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Field configuration start...');

        $name = $this->argument('model');
        $model = Model::where('name', $name)->first();
        if($model) {
            $config = ModelConfigUtils::decryptJson($model->config);
            $roles = [
                'field' => 'required|in:'.implode(',', array_map(fn($form) => $form['field'], $config['grid'])),
            ];

            $data = [
                'field' => $this->option('field'),
                'label' => $this->option('label'),
                'view' => $this->option('visible') == 'true' ? true : false,
                'download' => $this->option('export') == 'true' ? true : false,
                'sortlist' => $this->option('position')
            ];
            $validator = \Validator::make($data, $roles);
            if ($validator->fails()) {

                foreach($validator->errors()->messages() as $key => $err) {
                    $this->error("- {$err[0]}");
                }
                return;
            }
            if($this->option('reset')) {
                ResponseConfigBuilder::build($model, $data, $this->option('reset'));
                return $this->info("The {$this->option('field')} config has reset successfully.");
            } else {
                ResponseConfigBuilder::build($model, $data);
                return $this->info("The {$this->option('field')} config has updated successfully.");
            }
        } else {
            $this->error("This $name model not found.");
        }

    }

}
