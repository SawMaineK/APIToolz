<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\RelationBuilder;

class ModelRelationGenerator extends Command
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
    protected $signature = 'apitoolz:relation {model} {--title=} {--relation-model=} {--relation-type=belongsTo} {--foreign-key=} {--display-field=} {--sub-relation-model=} {--remove} {--force}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create relationships between two models.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Adding model relation...');

        $name = $this->argument('model');
        $model = Model::where('name', $name)->first();
        if($model) {
            $roles = [
                'title' => 'required|alpha_dash|min:3',
                'relation_type' => 'required|in:belongsTo,hasOne,hasMany'
            ];
            if(!$this->option('remove')) {
                $roles['relation_model'] = 'required|exists:Sawmainek\Apitoolz\Models\Model,name';
            }
            $data = [
                'title' => $this->option('title'),
                'relation_model' => $this->option('relation-model'),
                'relation_type' => $this->option('relation-type'),
                'foreign_key' => $this->option('foreign-key'),
                'display_field' => $this->option('display-field'),
                'sub' => $this->option('sub-relation-model')
            ];
            $validator = \Validator::make($data, $roles);
            if ($validator->fails()) {

                foreach($validator->errors()->messages() as $key => $err) {
                    $this->error($err[0]);
                }
                return;
            }
            if($this->option('remove')) {
                RelationBuilder::build($model, $data, $this->option('force'), $this->option('remove'));
                return $this->info("The {$this->option('title')} relation has removed successfully.");
            } else {
                RelationBuilder::build($model, $data, $this->option('force'));
                return $this->info("The {$this->option('title')} relation has created successfully.");
            }

        } else {
            $this->error("This $name model not found.");
        }

    }

}
