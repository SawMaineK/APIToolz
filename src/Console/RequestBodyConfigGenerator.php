<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\APIToolzGenerator;
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
    protected $signature = 'apitoolz:request {model} {--field=} {--label=} {--input-type=} {--validator=} {--cast=} {--searchable=true} {--fillable=true} {--width=} {--criteria-key=} {--criteria-value=} {--position=} {--upload-path=} {--upload-max-size=} {--upload-type=image} {--upload-multiple=false} {--opt-type=} {--lookup-model=} {--lookup-value=} {--lookup-dependency-key=} {--lookup-filter-key=} {--lookup-query=} {--select-multiple=false} {--reset} {--ask-ai} {--doc}';

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
        if ($this->option('doc')) {
            $this->printDoc();
            return;
        }

        $this->info('Field configuration start...');
        $name = $this->argument('model');
        $model = Model::where('name', $name)->first();
        if($model) {
            if ($this->option('ask-ai')) {
                $field = $this->option('field');
                if (!$field) {
                    $this->error("The --field option is required when using --ask-ai.");
                    return;
                }

                $question = "Create {$name} model's request configuration for $field field with above format.";
                $answer = APIToolzGenerator::askRequestHint($question);
                $this->line($answer);
                return;
            }
            $config = ModelConfigUtils::decryptJson($model->config);
            $roles = [
                'field' => 'required|in:'.implode(',', array_map(fn($form) => $form['field'], $config['forms'])),
            ];
            if($this->option('input-type')) {
                $roles['type'] = 'required|in:text,number,tags,password,text_email,date,time,datetime,textarea,editor,select,radio,checkbox,file,hidden';

                if($this->option('criteria-key')) {
                    $roles['criteria_value'] = 'required';
                }

                if($this->option('criteria-value')) {
                    $roles['criteria_key'] = 'required';
                }

                // For file upload
                if($this->option('input-type') == 'file') {
                    $roles['path_to_upload'] = 'required';
                    $roles['upload_max_size'] = 'nullable|numeric';
                    $roles['upload_type'] = 'required|in:image,file';
                }

                // For select, radio, checkbox
                if($this->option('input-type') == 'select' || $this->option('input-type') == 'radio') {
                    $roles['opt_type'] = 'required|in:datalist,external';
                    if($this->option('opt-type') == 'external' && $this->option('lookup-model') != 'User') {
                        $roles['lookup_model'] = 'required|exists:Sawmainek\Apitoolz\Models\Model,name';
                        $roles['lookup_value'] = [
                            'required',
                            function ($attribute, $value, $fail) {
                                $lookupModelName = $this->option('lookup-model');
                                if (!$lookupModelName) {
                                    return $fail('The lookup-model option is required.');
                                }
                                $modelClass = '\\App\\Models\\' . $lookupModelName;
                                if (!class_exists($modelClass)) {
                                    return $fail("Model class $modelClass does not exist.");
                                }
                                $table = (new $modelClass)->getTable();
                                if (!\Schema::hasColumn($table, $value)) {
                                    return $fail("The column '$value' does not exist in the '$table' table.");
                                }
                            }
                        ];
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
                'upload_max_size' => $this->option('upload-max-size') ?? '2048',
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

    protected function printDoc()
    {
        $this->info("=== apitoolz:request Command Documentation ===");
        $this->line("Configure field behavior for request body handling of a model.");
        $this->newLine();

        $this->info("Usage:");
        $this->line("  php artisan apitoolz:request {model} [options]");
        $this->newLine();

        $this->info("Arguments:");
        $this->line("  model                      Required. Name of the model (e.g., User)");

        $this->info("Common Options:");
        $this->line("  --field=FIELD              Required. Field name from the model's form config");
        $this->line("  --label=LABEL              Optional. Custom display label");
        $this->line("  --input-type=TYPE          Optional. Input type (e.g. text, number, select, file)");
        $this->line("  --validator=RULES          Optional. Validation rules string");
        $this->line("  --cast=TYPE                Optional. Cast type (e.g. int, float)");
        $this->line("  --searchable=true|false    Optional. Include in search (default: true)");
        $this->line("  --fillable=true|false      Optional. Include in fillable/request (default: true)");
        $this->line("  --width=WIDTH              Optional. UI width (e.g. col-md-6)");
        $this->line("  --position=NUM             Optional. Sorting position in the form");

        $this->info("Conditional Options:");
        $this->line("  --criteria-key=KEY         Used with criteria-value (conditional visibility)");
        $this->line("  --criteria-value=VALUE     Value to match for criteria-key");

        $this->info("File Upload Options:");
        $this->line("  --upload-path=PATH         Required if input-type=file");
        $this->line("  --upload-max-size=NUM      Required if input-type=file");
        $this->line("  --upload-type=image|file   Upload type (default: image)");
        $this->line("  --upload-multiple=true     Allow multiple file upload (default: false)");

        $this->info("Select/Radio/Checkbox Options:");
        $this->line("  --opt-type=datalist|external    Required for select/radio");
        $this->line("  --lookup-model=MODEL            Required if opt-type=external");
        $this->line("  --lookup-value=FIELD            Value field from the lookup model");
        $this->line("  --lookup-dependency-key=FIELD   Optional. Field to use for dynamic dependency");
        $this->line("  --lookup-filter-key=FIELD       Optional. Used for filtering dependent values");
        $this->line("  --lookup-query=key:value        Required if opt-type=datalist");
        $this->line("  --select-multiple=true          Allow multiple selections");

        $this->info("Other:");
        $this->line("  --reset                    Reset the existing configuration");
        $this->line("  --doc                      Show this command documentation");

        $this->newLine();
        $this->info("Examples:");
        $this->line("  php artisan apitoolz:request User --field=email --label='Email Address' --input-type=text");
        $this->line("  php artisan apitoolz:request Product --field=image --input-type=file --upload-path=products/ --upload-max-size=1024");
        $this->line("  php artisan apitoolz:request Order --field=status --input-type=select --opt-type=datalist --lookup-query='0:Pending,1:Processing,2:Completed'");
        $this->line("  php artisan apitoolz:request Profile --field=avatar --reset");

        $this->newLine();
        $this->info("===============================================");
    }

}
