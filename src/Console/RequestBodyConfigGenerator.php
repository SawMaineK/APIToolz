<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\Facades\ModelConfigUtils;
use Sawmainek\Apitoolz\RequestBodyConfigBuilder;

class RequestBodyConfigGenerator extends Command
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
    protected $signature = 'apitoolz:request {model} {--field=} {--label=} {--input-type=} {--validator=} {--cast=} {--searchable=true} {--fillable=true} {--position=} {--upload-path=} {--upload-max-size=} {--upload-type=image} {--upload-multiple=false} {--reset}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Field configuration for request body of model.';

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
                'field' => 'required|in:'.implode(',', array_map(fn($form) => $form['field'], $config['forms'])),
            ];
            if($this->option('input-type')) {
                $roles['type'] = 'required|in:text,text_number,text_tags,text_password,text_email,text_date,text_time,text_datetime,textarea,textarea_editor,select,radio,checkbox,file,hidden';

                // For file upload
                if($this->option('input-type') == 'file') {
                    $roles['path_to_upload'] = 'required';
                    $roles['upload_max_size'] = 'required|numeric';
                    $roles['upload_type'] = 'required|in:image,file';
                }
            }

            $data = [
                'field' => $this->option('field'),
                'label' => $this->option('label'),
                'type' => $this->option('input-type'),
                'validator' => $this->option('validator'),
                'cast' => $this->option('cast'),
                'search' => $this->option('searchable') == 'true' ? true : false,
                'view' => $this->option('fillable') == 'true' ? true : false,
                'sortlist' => $this->option('position'),
                'path_to_upload' => $this->option('upload-path'),
                'upload_max_size' => $this->option('upload-max-size'),
                'upload_type' => $this->option('upload-type'),
                'image_multiple' => $this->option('upload-multiple') == 'true' ? true : false,
            ];
            $validator = \Validator::make($data, $roles);
            if ($validator->fails()) {

                foreach($validator->errors()->messages() as $key => $err) {
                    $this->error("- {$err[0]}");
                }
                return;
            }
            if($this->option('reset')) {
                RequestBodyConfigBuilder::build($model, $data, $this->option('reset'));
                return $this->info("The {$this->option('field')} config has reset successfully.");
            } else {
                RequestBodyConfigBuilder::build($model, $data);
                return $this->info("The {$this->option('field')} config has updated successfully.");
            }
        } else {
            $this->error("This $name model not found.");
        }

    }

}
