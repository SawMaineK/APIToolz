<?php

namespace Sawmainek\Apitoolz\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Sawmainek\Apitoolz\APIToolzGenerator;
use Sawmainek\Apitoolz\Http\Requests\WorkflowRequest;
use Sawmainek\Apitoolz\Models\Workflow;
use Sawmainek\Apitoolz\Models\WorkflowInstance;
use Sawmainek\Apitoolz\Models\WorkflowStepHistory;
use Illuminate\Http\Request;
use Symfony\Component\Yaml\Yaml;
use Symfony\Component\ExpressionLanguage\ExpressionLanguage;

class WorkflowController extends APIToolzController
{
    private ExpressionLanguage $language;

    public function __construct()
    {
        $this->language = new ExpressionLanguage();

        // Register 'in' function
        $this->language->register(
            'in',
            fn($value, $array) => sprintf('in_array(%s, %s)', $value, $array),
            fn(array $variables, $value, $array) => in_array($value, $array)
        );

        // Register 'contains' function
        $this->language->register(
            'contains',
            fn($haystack, $needle) => sprintf('strpos(%s, %s) !== false', $haystack, $needle),
            fn(array $variables, $haystack, $needle) => str_contains($haystack, $needle)
        );
    }

    protected function loadWorkflow(string $name): array
    {
        $workflow = Workflow::firstWhere('name', $name);
        if (!$workflow) {
            abort(404, "Workflow not found: {$name}");
        }
        $workflowYaml = $workflow->definition ? Yaml::parse($workflow->definition) : null;
        if (!$workflowYaml) {
            abort(500, "Workflow definition is empty or invalid for: {$name}");
        }
        return $workflowYaml;
    }

    public function index(): JsonResponse
    {
        $workflows = Workflow::orderBy('created_at', 'desc')->get();
        return response()->json($workflows);
    }

    public function store(WorkflowRequest $request): JsonResponse
    {
        $workflow = Workflow::create($request->validated());
        if($request->use_ai) {
            $definition = APIToolzGenerator::madeWorkflow($workflow->description);
            if( Yaml::parse($definition) ) {
                $workflow->definition = $definition;
                $workflow->save();
            }
        }
        return response()->json($workflow, 201);
    }

    public function update(WorkflowRequest $request, int $id): JsonResponse
    {
        $workflow = Workflow::findOrFail($id);
        $workflow->definition = $request->input('definition');
        $workflow->save();
        return response()->json($workflow);
    }

    public function delete(int $id) {
        $workflow = Workflow::findOrFail($id);
        $workflow->delete();
        return response()->noContent();
    }

    public function definition(string $name)
    {
        $workflow = $this->loadWorkflow($name);

        return response()->json([
            'name' => $name,
            'steps' => $workflow['steps'] ?? []
        ]);
    }

    /**
     * Start a workflow instance (does NOT create model — that happens on first step submit).
     * POST /api/workflow/{name}/start
     */
    public function start(Request $request, string $name)
    {
        $workflow = $this->loadWorkflow($name);
        $firstStep = $workflow['steps'][0]['id'] ?? null;

        $instance = WorkflowInstance::create([
            'workflow_name' => $name,
            'current_step' => $firstStep,
            'data' => [],
            'model_type' => $workflow['model_type'] ?? null,
            'model_id' => null
        ]);

        return response()->json([
            'instance' => $instance,
            'step' => collect($workflow['steps'])->first(), // full step definition
        ]);
    }

    /**
     * Submit a step.
     * POST /api/workflow/{name}/{instanceId}/step/{stepId}
     */
    public function submitStep(Request $request, string $name, int $instanceId, string $stepId)
    {
        $workflow = $this->loadWorkflow($name);
        $instance = WorkflowInstance::findOrFail($instanceId);
        $step = collect($workflow['steps'])->firstWhere('id', $stepId);
        if (!$step) abort(404, "Step not found: {$stepId}");

        // Merge incoming data with existing workflow data
        $data = array_merge($instance->data ?? [], $request->all());

        $createdModels = [];

        // 1) If this step has create_model, create it now and save the id to workflow data
        if (isset($step['create_model']) && is_array($step['create_model'])) {
            $cm = $step['create_model'];
            $modelType = $cm['model_type'];
            $fieldsMap = $cm['fields'] ?? [];

            $modelAttributes = [];
            foreach ($fieldsMap as $modelField => $source) {
                if($source == 'user_id') {
                    $modelAttributes[$modelField] = $request->user()?->id;
                    continue;
                }
                // if $source exists in $data, use it; otherwise treat it as literal
                $modelAttributes[$modelField] = array_key_exists($source, $data) ? $data[$source] : $source;
            }

            $model = $modelType::create($modelAttributes);

            // make a key like loan_id from class name
            $idFieldName = strtolower(class_basename($modelType)) . '_id';
            $data[$idFieldName] = $model->id;

            // Link primary model on instance if not set
            if (!$instance->model_type) {
                $instance->model_type = $modelType;
                $instance->model_id = $model->id;
            }

            $createdModels[$idFieldName] = $model->toArray();
        }

        // 2) Update models declared in update_models (can be multiple)
        if (isset($step['update_models']) && is_array($step['update_models'])) {
            foreach ($step['update_models'] as $modelConfig) {
                $modelType = $modelConfig['model_type'];
                $modelIdField = $modelConfig['model_id_field'] ?? null;
                if (!$modelIdField) continue;

                $modelId = $data[$modelIdField] ?? null;
                if (!$modelId) continue;

                $model = $modelType::find($modelId);
                if (!$model) continue;

                foreach ($modelConfig['fields'] as $field => $valueOrSource) {
                    if ($valueOrSource == 'user_id') {
                        $model->$field = $request->user()?->id;
                        continue;
                    }
                    $model->$field = array_key_exists($valueOrSource, $data) ? $data[$valueOrSource] : $valueOrSource;
                }
                $model->save();
            }
        }

        // 3) Also apply update_model (single-model convenience), e.g. update_model: { status: 'applied' }
        if (isset($step['update_model']) && is_array($step['update_model'])) {
            $primaryModelType = $instance->model_type;
            $primaryModelId = $instance->model_id;
            if ($primaryModelType && $primaryModelId) {
                $pModel = $primaryModelType::find($primaryModelId);
                if ($pModel) {
                    foreach ($step['update_model'] as $field => $valueOrSource) {
                        if ($valueOrSource == 'user_id') {
                            $pModel->$field = $request->user()?->id;
                            continue;
                        }
                        $pModel->$field = array_key_exists($valueOrSource, $data) ? $data[$valueOrSource] : $valueOrSource;
                    }
                    $pModel->save();
                }
            }
        }

        // 4) Save step history (audit)
        WorkflowStepHistory::create([
            'workflow_instance_id' => $instance->id,
            'step_id' => $stepId,
            'data' => $request->all(),
            'action' => $request->input('action'),
            'user_id' => $request->user()?->id
        ]);

        // 5) Evaluate conditions to determine next step
        $nextStepId = null;
        if (isset($step['conditions']) && is_array($step['conditions'])) {
            foreach ($step['conditions'] as $condition) {
                if (!isset($condition['when']) || !isset($condition['next'])) continue;
                if ($this->evaluateCondition($condition['when'], $data)) {
                    $nextStepId = $condition['next'];
                    break;
                }
            }
        }

        // 6) Fallback to next ordered step if none matched
        if (!$nextStepId) {
            $steps = collect($workflow['steps']);
            $index = $steps->search(fn($s) => $s['id'] === $stepId);
            $nextStepId = ($index !== false && isset($steps[$index + 1])) ? $steps[$index + 1]['id'] : 'completed';
        }

        // 7) Persist instance data & state
        $instance->data = $data;
        $instance->current_step = $nextStepId;
        $instance->save();

        $nextStep = collect($workflow['steps'])->firstWhere('id', $instance->current_step);

        return response()->json([
            'message' => "Step '{$stepId}' completed",
            'next_step' => $nextStep,
            'instance' => $instance,
            'created_models' => $createdModels,
        ]);
    }

    /**
     * Return step history for an instance
     * GET /api/workflow/{instanceId}/history
     */
    public function history(int $instanceId)
    {
        $instance = WorkflowInstance::with('stepHistories.user')->findOrFail($instanceId);
        return response()->json($instance->stepHistories);
    }

    private function evaluateCondition(string $expr, array $data): bool
    {
        try {
            // ExpressionLanguage expects variables keyed by name; we supply $data
            return (bool) $this->language->evaluate($expr, $data);
        } catch (\Throwable $e) {
            // log($e->getMessage());
            return false;
        }
    }
}
