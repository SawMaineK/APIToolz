<?php
namespace Sawmainek\Apitoolz\Services;

use Illuminate\Http\Request;
use Sawmainek\Apitoolz\APIToolzGenerator;
use Sawmainek\Apitoolz\Facades\ModelConfigUtils;
use Sawmainek\Apitoolz\Models\Model as ApiToolzModel;
use Sawmainek\Apitoolz\SeederBuilder;

class ModelService
{
    protected $model;

    public function __construct()
    {
        $this->model = new ApiToolzModel();
    }

    public function get(Request $request)
    {
        $request->merge(['only_trashed' => true]);
        $perPage = $request->get('per_page', 15);
        return $this->model->paginate($perPage);
    }

    public function listTables()
    {
        $excludedTables = [
            'sessions',
            'cache',
            'cache_locks',
            'jobs',
            'failed_jobs',
            'job_batches',
            'migrations',
            'models',
            'password_reset_tokens',
            'password_resets',
            'personal_access_tokens'
        ];

        $tables = [];
        foreach (\Schema::getTables() as $table) {
            $tableName = $table['name'];

            if (!in_array($tableName, $excludedTables)) {
                $tables[] = [
                    'name' => $tableName,
                    'id' => $tableName,
                ];
            }
        }

        return $tables;
    }

    public function find($slug)
    {
        return $this->model->where('slug', $slug)->first();
    }

    public function create(array $data)
    {
        try {
            if ($data['build_with'] == 'table') {
                \Artisan::call('apitoolz:model', [
                    'model' => $data['name'],
                    '--table' => $data['table'],
                    '--soft-delete' => true
                ]);

                return [
                    'status' => 'success',
                    'message' => "Model '{$data['name']}' created using the table '{$data['table']}'."
                ];
            } elseif ($data['build_with'] == 'sql') {
                // Extract table name from SQL
                preg_match('/CREATE\s+TABLE\s+`?([a-zA-Z0-9_]+)`?\s*\(/i', $data['custom_sql'], $matches);

                if (empty($matches[1])) {
                    throw new \Exception("Invalid SQL: Could not determine table name from the CREATE TABLE statement.");
                }

                $tableName = $matches[1];

                \Artisan::call('apitoolz:model', [
                    'model' => $data['name'],
                    '--table' => $tableName,
                    '--soft-delete' => true,
                    '--sql' => $data['custom_sql'],
                    '--force' => true
                ]);

                return [
                    'status' => 'success',
                    'message' => "Model '{$data['name']}' created using SQL for table '{$tableName}'."
                ];
            } else {
                \Artisan::call('apitoolz:use-ai', [
                    '--requirement' => "Create {$data['name']} table. ". ($data['instruction'] ?? '')
                ]);
                return [
                    'status' => 'success',
                    'message' => "Model '{$data['name']}' created using AI-generated SQL."
                ];
            }
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }

    public function update($id, array $data)
    {
        $model = $this->model->find($id);
        if ($model) {
            $data['config'] = ModelConfigUtils::encryptJson($data['config']);
            $model->update($data);
            SeederBuilder::build();
            return $model;
        }
        return null;
    }

    public function ask($slug, Request $request) {
        if($slug == 'plan') {
            return APIToolzGenerator::madePlan(
                $request->question,
                $request->id ?? null
            );
        } else  if($slug == 'dashboard' || $slug == 'general_configuration') {
            preg_match_all('/#([A-Za-z0-9_]+)/', $request->get('question', ''), $matches);
            $fields = [];
            foreach($matches[1] as $model) {
                $model = $this->model->where("name",$model)->first();
                if ($model) {
                    $fields[] = "{$model->name} Model's fields >> ";
                    $tableFields = collect(\Schema::getColumns($model->table))->map(fn($column) => $column['name'] . ':' . $column['type']);
                    $fields = array_merge($fields, $tableFields->toArray());
                }
            }
        } else {
            $model = $this->model->where('slug', $slug)->first();
            if ($model) {
                $config = ModelConfigUtils::decryptJson($model->config);
                $fields = collect($config['forms'])->filter(function ($field) {
                    return isset($field['view']) && $field['view'] == true &&
                        !in_array($field['field'], ['id', 'created_at', 'updated_at', 'deleted_at']);
                })->map(function ($field) {
                    return $field['field'];
                });
            }
        }
        $question = $request->get('question');
        $tags = [$slug];
        return APIToolzGenerator::ask(
            $question,
            $tags,
            $request->lastone ?? false
        );
    }

    public function delete($slug, $deleteTable)
    {
        $model = $this->model->where('slug', $slug)->first();
        if ($model) {
            \Artisan::call('apitoolz:model', [
                'model' => $model->name,
                '--remove' => true,
                '--force-delete' => true,
                '--remove-table' => $deleteTable == 'delete-table'
            ]);
            return true;
        }
        return false;
    }
}
