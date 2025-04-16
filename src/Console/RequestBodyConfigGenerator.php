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
    protected $signature = 'apitoolz:request {model} {--field=} {--label=} {--input-type=} {--validator=} {--cast=} {--searchable=true} {--fillable=true} {--width=} {--criteria-key=} {--criteria-value=} {--position=} {--upload-path=} {--upload-max-size=} {--upload-type=image} {--upload-multiple=false} {--opt-type=} {--lookup-model=} {--lookup-value=} {--lookup-dependency-key=} {--lookup-filter-key=} {--lookup-query=} {--select-multiple=false} {--reset}';

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

                if($this->option('criteria-key')) {
                    $roles['criteria_value'] = 'required';
                }

                if($this->option('criteria-value')) {
                    $roles['criteria_key'] = 'required';
                }

                // For file upload
                if($this->option('input-type') == 'file') {
                    $roles['path_to_upload'] = 'required';
                    $roles['upload_max_size'] = 'required|numeric';
                    $roles['upload_type'] = 'required|in:image,file';
                }

                // For select, radio, checkbox
                if($this->option('input-type') == 'select' || $this->option('input-type') == 'radio') {
                    $roles['opt_type'] = 'required|in:datalist,external';
                    if($this->option('opt-type') == 'external') {
                        $roles['lookup_model'] = 'required';
                        $roles['lookup_value'] = 'required';
                        $roles['lookup_dependency-key'] = '';
                    }
                    if($this->option('opt-type') == 'datalist') {
                        $roles['lookup_query'] = 'required';
                    }
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
                'width' => $this->option('width'),
                'criteria_key' => $this->option('criteria-key'),
                'criteria_value' => $this->option('criteria-value'),
                'sortlist' => $this->option('position'),
                'path_to_upload' => $this->option('upload-path'),
                'upload_max_size' => $this->option('upload-max-size'),
                'upload_type' => $this->option('upload-type'),
                'image_multiple' => $this->option('upload-multiple') == 'true' ? true : false,
                'opt_type' => $this->option('opt-type'),
                'lookup_model' => $this->option('lookup-model'),
                'lookup_value' => $this->option('lookup-value'),
                'lookup_dependency_key' => $this->option('lookup-dependency-key'),
                'lookup_filter_key' => $this->option('lookup-filter-key'),
                'lookup_query' => $this->option('lookup-query'),
                'select_multiple' => $this->option('select-multiple') == 'true' ? true : false,
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
