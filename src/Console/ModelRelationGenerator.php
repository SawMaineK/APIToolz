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
    protected $signature = 'apitoolz:relation
        {model : The base model name}
        {--title= : Title of the relation (alpha_dash)}
        {--relation-model= : The related model name}
        {--relation-type=belongsTo : Relation type: belongsTo, hasOne, or hasMany}
        {--foreign-key= : Foreign key for the relationship}
        {--related-key= : Related key for the relationship (optional)}
        {--table= : Table name for the relationship (optional)}
        {--display-field= : Field to use for display purposes}
        {--sub-relation-model= : Sub-related model to include (optional)}
        {--remove : Remove the specified relationship}
        {--list : List all relations for the specified model}
        {--force : Force overwrite the existing relation}
        {--doc : Show command documentation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create or remove relationships between two models.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('doc')) {
            $this->line($this->getDoc());
            return;
        }

        $this->info('Adding model relation...');

        $name = $this->argument('model');
        $model = Model::where('name', $name)->first();
        if ($model) {
            if($this->option('list')) {
                $this->printRelationLists($model);
                return;
            }
            $roles = [
                'title' => 'required|alpha_dash|min:3',
                'relation_type' => 'required|in:belongsTo,hasOne,hasMany,belongsToMany',
            ];
            if (!$this->option('remove')) {
                $roles['relation_model'] = 'required|exists:Sawmainek\Apitoolz\Models\Model,name';
            }

            $data = [
                'title' => $this->option('title'),
                'relation_model' => $this->option('relation-model'),
                'relation_type' => $this->option('relation-type'),
                'foreign_key' => $this->option('foreign-key'),
                'related_key' => $this->option('related-key'),
                'table' => $this->option('table'),
                'display_field' => $this->option('display-field'),
                'sub' => $this->option('sub-relation-model'),
            ];

            $validator = \Validator::make($data, $roles);
            if ($validator->fails()) {
                foreach ($validator->errors()->messages() as $err) {
                    $this->error($err[0]);
                }
                return;
            }

            if ($this->option('remove')) {
                RelationBuilder::build($model, $data, $this->option('force'), true);
                return $this->info("The '{$this->option('title')}' relation has been removed successfully.");
            } else {
                RelationBuilder::build($model, $data, $this->option('force'));
                return $this->info("The '{$this->option('title')}' relation has been created successfully.");
            }
        } else {
            $this->error("Model '{$name}' not found.");
        }
    }

    protected function printRelationLists(Model $model) {
        $this->info("Relations for model '{$model->name}':");
        $relations = RelationBuilder::getRelations($model);
        if (empty($relations)) {
            $this->line("  No relations configured for this model.");
            return;
        }
        foreach ($relations as $relation) {
            $this->line('-');
            foreach ($relation as $key => $value) {
                $this->line("    {$key}: " . (is_array($value) ? json_encode($value, JSON_PRETTY_PRINT) : $value));
            }
            $this->line('');
        }
    }

    /**
     * Return usage documentation.
     */
    protected function getDoc(): string
    {
        return <<<README
🧩 APItoolz: Model Relation Generator
-------------------------------------
This command creates or removes relationships between two models.

🔧 Usage:
  php artisan apitoolz:relation {model} [options]

📌 Arguments:
  model                  The name of the base model.

📎 Options:
  --title=               Relation title (used as the key in configuration).
  --relation-model=      Related model name.
  --relation-type=       Relationship type: belongsTo (default), hasOne, hasMany.
  --foreign-key=         Foreign key field in base model.
  --related-key=        Related key field in the related model (optional).
  --table=              Table name for the relationship (optional).
  --display-field=       Field to display from related model.
  --sub-relation-model=  Optional nested relation (e.g., for chained relations).
  --remove               Remove this relationship instead of creating it.
  --list                 List all relations for the specified model.
  --force                Force overwrite if relation already exists.
  --doc                  Show this help message.

📌 Examples:
  Create relation:
    php artisan apitoolz:relation Product --title=category --relation-model=Category --relation-type=belongsTo --foreign-key=category_id --display-field=name
    php artisan apitoolz:relation Product --title=details --relation-model=ProductDetail --relation-type=hasMany
    php artisan apitoolz:relation Product --title=detail --relation-model=Detail --relation-type=blongsToMany --table=product_detail --related-key=detail_id --forgeign-key=product_id

  Remove relation:
    php artisan apitoolz:relation Product --title=category --remove

📘 Note:
  - You must create both models before defining a relationship.
  - If you use --remove, only --title is required.

README;
    }
}
