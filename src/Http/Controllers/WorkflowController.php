<?php

namespace Sawmainek\Apitoolz\Http\Controllers;

use Http;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\View\View;
use Sawmainek\Apitoolz\APIToolzGenerator;
use Sawmainek\Apitoolz\Http\Requests\WorkflowRequest;
use Sawmainek\Apitoolz\Http\Resources\WorkflowInstanceResource;
use Sawmainek\Apitoolz\Http\Resources\WorkflowStepHistoryResource;
use Sawmainek\Apitoolz\Integrations\ExpressionEvaluator;
use Sawmainek\Apitoolz\Models\Workflow;
use Sawmainek\Apitoolz\Models\WorkflowInstance;
use Sawmainek\Apitoolz\Models\WorkflowStepHistory;
use Illuminate\Http\Request;
use Sawmainek\Apitoolz\Services\IntegrationService;
use Str;
use Symfony\Component\Yaml\Yaml;
use Symfony\Component\ExpressionLanguage\ExpressionLanguage;

class WorkflowController extends APIToolzController
{
    private ExpressionLanguage $language;

    public function __construct()
    {

    }

    protected function loadWorkflow(string $slug): array
    {
        $workflow = Workflow::firstWhere('slug', $slug);
        if (!$workflow) abort(404, "Workflow not found: {$workflow->name}");

        $definition = $workflow->definition ? Yaml::parse($workflow->definition) : null;
        if (!$definition) abort(500, "Workflow definition is empty or invalid for: {$workflow->name}");

        return $definition;
    }

    public function index(): JsonResponse
    {
        $workflows = Workflow::orderBy('created_at', 'desc')->get();
        return response()->json($workflows);
    }

    public function store(WorkflowRequest $request): JsonResponse
    {
        $workflow = Workflow::create($request->validated());
        $workflow->slug = \Str::slug($workflow->name, '-');
        if ($request->use_ai) {
            $prompt = $workflow->name;
            if(!empty($workflow->description)) {
                $prompt .="\n\n {$workflow->description}";
            }
            $definition = APIToolzGenerator::madeWorkflow($prompt);
            if (Yaml::parse($definition)) {
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

    public function deleteWorkflow(int $id)
    {
        $workflow = Workflow::findOrFail($id);
        $workflow->delete();

        return response()->noContent();
    }

    public function deleteInstance(int $id)
    {
        $workflow = WorkflowInstance::findOrFail($id);
        $workflow->delete();

        return response()->noContent();
    }

    public function definition(string $slug)
    {
        $workflow = $this->loadWorkflow($slug);

        return response()->json([
            'slug' => $slug,
            'steps' => $workflow['steps'] ?? []
        ]);
    }

    public function instances(Request $request, $slug): JsonResponse
    {
        $workflow = Workflow::firstWhere('slug', $slug);
        if (!$workflow) {
            return response()->json(['message' => 'Error fetching instances list with no workflow.'], 500);
        }

        $query = WorkflowInstance::filter($request);
        $query = $query->where('workflow_id', $workflow->id);
        $query->with('initiator');

        $user = $request->user();

        // If user is not super admin, filter instances by their roles
        if (!$user->hasRole('super')) {
            $userRoles = $user->roles()->pluck('name')->toArray();

            $query->where(function ($q) use ($user, $userRoles) {
                $q->where('initiator_id', $user->id);

                foreach ($userRoles as $role) {
                    $q->orWhereJsonContains('roles', $role);
                }
            });
        }

        $perPage = $request->query('per_page', 10);
        $results = $query->paginate($perPage);

        if (!$results) {
            return response()->json(['message' => 'Error fetching instances list'], 500);
        }

        return response()->json([
            'data' => WorkflowInstanceResource::collection($results),
            'meta' => [
                'current_page' => $results->currentPage(),
                'per_page' => $results->perPage(),
                'total' => $results->total(),
                'next_page_url' => $results->nextPageUrl(),
                'prev_page_url' => $results->previousPageUrl(),
                'last_page' => $results->lastPage(),
            ]
        ]);
    }


    // Add or update comment on a step
    public function updateComment(Request $request, $id)
    {
        $data = $request->validate([
            'comment' => 'nullable|string|max:2000',
        ]);

        $step = WorkflowStepHistory::findOrFail($id);

        // Only the owner or admin can edit
        if ($step->user_id !== auth()->id() && !auth()->user()->hasRole('admin')) {
            abort(403, 'Unauthorized');
        }

        $step->comment = $data['comment'];
        $step->save();

        return response()->json($step->load('user'));
    }

    // Delete comment
    public function destroyComment($id)
    {
        $step = WorkflowStepHistory::findOrFail($id);

        if ($step->user_id !== auth()->id() && !auth()->user()->hasRole('admin')) {
            abort(403, 'Unauthorized');
        }

        $step->comment = null;
        $step->save();

        return response()->json(['message' => 'Comment removed']);
    }

    public function start(Request $request, string $slug)
    {
        $definition = $this->loadWorkflow($slug);

        return response()->json([
            'step'     => collect($definition['steps'])->first(),
        ]);
    }

    protected function checkStepAccess(array $step, Request $request): void
{
    $currentUserRoles = $request->user()?->roles->pluck('name')->toArray() ?? [];
    $stepRoles        = $step['roles'] ?? [];

    if (!empty($stepRoles)) {
        $hasAccess = count(array_intersect($currentUserRoles, $stepRoles)) > 0;

        // Allow "super" to bypass
        if (!$hasAccess && !in_array('super', $currentUserRoles)) {
            abort(response()->json([
                'error'          => 'You do not have permission to perform this step.',
                'required_roles' => $stepRoles
            ], 403));
        }
    }
}

    public function submitStep(Request $request, string $slug, int|string $instanceId, string $stepId)
    {
        $workflow   = Workflow::firstWhere('slug', $slug);
        $definition = $this->loadWorkflow($slug);

        $steps = $definition['steps'] ?? [];
        if (!is_array($steps)) $steps = [];

        // --- Determine current step ---
        if ($instanceId == 'start') {
            $step = $steps[0] ?? null;
            if (!$step || !is_array($step)) abort(404, "Workflow has no steps defined");

            $this->checkStepAccess($step, $request);

            $instance = WorkflowInstance::create([
                'workflow_id'   => $workflow->id ?? null,
                'workflow_name' => $definition['name'] ?? '',
                'current_step'  => $step['id'] ?? null,
                'data'          => [],
                'model_type'    => $workflow->model_type ?? null,
                'model_id'      => null,
                'status'        => 'in_progress',
                'roles'         => $step['roles'] ?? [],
                'initiator_id'  => $request->user()?->id,
                'priority'      => $request->input('priority', 'normal'),
                'due_date'      => $request->input('due_date'),
                'completed_at'  => null,
                'metadata'      => $request->input('metadata', []),
            ]);
        } else {
            $instance = WorkflowInstance::findOrFail($instanceId);

            $step = collect($steps)->firstWhere('id', $instance->current_step);
            if (!$step || !is_array($step)) abort(404, "Step not found or invalid: {$instance->current_step}");

            $this->checkStepAccess($step, $request);
        }

        // --- Normalize step fields ---
        $fieldsRaw = $step['fields'] ?? ($step['form']['fields'] ?? []);
        if (!is_array($fieldsRaw)) $fieldsRaw = [];

        $fields = [];
        foreach ($fieldsRaw as $k => $v) {
            if (is_int($k) && is_array($v) && isset($v['name'])) {
                $fields[$v['name']] = $v;
            } elseif (is_string($k) && is_array($v)) {
                $fields[$k] = $v;
            } elseif (is_string($k) && is_string($v)) {
                $fields[$k] = ['type' => $v];
            }
        }

        // --- Process step-specific data ---
        $stepData = [];
        $instanceData = array_merge($instance->data ?? [], $request->except('_token', '_method'));

        foreach ($fields as $fieldName => $fieldConfig) {
            $value = $request->input($fieldName, null);

            // Handle file uploads
            if (($fieldConfig['type'] ?? null) === 'file') {
                $uploadedFile = $request->file($fieldName);
                if ($uploadedFile) {
                    $fileOptions = [
                        'image_multiple' => $fieldConfig['multipleFile'] ?? false,
                        'upload_type'    => $fieldConfig['uploadType'] ?? 'file',
                        'save_full_path' => $fieldConfig['saveFullPath'] ?? false,
                        'path_to_upload' => $fieldConfig['uploadDir'] ?? 'workflow_files',
                    ];
                    $savedFiles = $this->saveAsFile($uploadedFile, $fileOptions);
                    $value = $fileOptions['image_multiple'] ? $savedFiles : (object)$savedFiles;
                }
            }

            $stepData[$fieldName] = $value;
            $instanceData[$fieldName] = $value;
        }

        // --- Process models and HTTP requests ---
        $createdModels    = $this->processModels($step, $stepData, $request, $instance);
        $responseContext  = $this->processRequest($step, $instanceData);
        $stepData         = array_merge($stepData, $responseContext);
        $processWorkflow  = $this->processWorkflow($step, $instanceData);

        // --- Save step history (current step only) ---
        WorkflowStepHistory::create([
            'workflow_instance_id' => $instance->id,
            'step_id'              => $stepId,
            'label'                => $step['label'] ?? null,
            'status'               => $request->input('status', 'completed'),
            'data'                 => $stepData,
            'action'               => $request->input('action'),
            'comment'              => $request->input('comment'),
            'user_id'              => $request->user()?->id,
            'duration'             => $request->input('duration', null),
            'metadata'             => $request->input('metadata', []),
        ]);

        // --- Determine next step ---
        $instanceData = array_merge($instanceData, $stepData);
        $nextStepId = $this->determineNextStep($step, $steps, $stepId, $instanceData);
        $nextStep   = collect($steps)->firstWhere('id', $nextStepId);
        if (!is_array($nextStep)) $nextStep = null;

        // --- Persist instance ---
        $instance->data                 = $instanceData;
        $instance->roles                = $nextStep['roles'] ?? [];
        $instance->current_step         = $nextStepId;
        $instance->current_step_label   = $nextStep['label'] ?? null;
        $instance->status               = $nextStepId === 'completed' ? $request->input('status', 'completed') : 'in_progress';
        $instance->completed_at         = $nextStepId === 'completed' ? now() : null;

        if ($request->has('priority')) $instance->priority = $request->input('priority');
        if ($request->has('due_date')) $instance->due_date = $request->input('due_date');
        if ($request->has('metadata')) $instance->metadata = array_merge($instance->metadata ?? [], $request->input('metadata', []));

        $instance->save();

        // --- Handle special responses ---
        if ($processWorkflow instanceof RedirectResponse) {
            return response()->json(['type' => 'redirect', 'url' => $processWorkflow->getTargetUrl()]);
        }

        if ($processWorkflow instanceof View) {
            return response()->json(['type' => 'view', 'html' => $processWorkflow->render()]);
        }

        if ($processWorkflow instanceof Response) {
            return response()->json(['type' => 'view', 'html' => $processWorkflow->getContent()]);
        }

        return response()->json([
            'message'        => "Step '{$stepId}' completed",
            'next_step'      => $nextStep,
            'instance'       => $instance,
            'created_models' => $createdModels,
        ]);
    }

    private function processWorkflow(array $step, array &$data)
    {
        $workflow = $step['workflow'] ?? [];
        if(!empty($workflow) && isset($workflow['slug'])) {
            $slug = $workflow['slug'] ?? null;
            $stepId = $workflow['step_id'] ?? null;
            $context = $this->interpolate($workflow['context'] ?? []);

            if (!$slug) {
                throw new \InvalidArgumentException("Workflow step is missing slug.");
            }

            // Run integration
            $integration = new IntegrationService();
            return $integration->runWorkflow($slug, $stepId, $context);
        }
        return null;
    }

    private function processRequest(array $step, array &$data): array
    {
        $context = [];
        $request = $step['request'] ?? [];
        if(!empty($request) && isset($request['url'])) {
            $body = $this->interpolate($request['body'] ?? [], $data);

            $url = $this->interpolateString($request['url'] ?? '', $data);
            $headers = $this->interpolate($request['headers'] ?? [], $data);
            $method = strtoupper($request['method'] ?? 'POST');

            $http = Http::withHeaders(array_merge(['Content-Type' => 'application/json'], $headers))
                        ->withOptions(['verify' => false]);

            $response = $http->send($method, $url, ['json' => $body])->json();
            Log::debug('HTTP request completed', ['response' => $response]);

            // 3️⃣ Save fields to context
            if (!empty($step['response']['fields'])) {
                foreach ($step['response']['fields'] as $field) {
                    if (is_array($field)) {
                        foreach ($field as $target => $path) {
                            $context[$target] = $this->getValueFrom($response, $path);
                        }
                    } else {
                        $context[$field] = $this->getValueFrom($response, $field);
                    }
                }
            }
            return $context;
        }
        return $context;
    }

    private function processModels(array $step, array &$data, Request $request, WorkflowInstance $instance): array
    {
        $createdModels = [];

        Log::info("▶ Processing models for step", [
            'step_id' => $step['id'] ?? null,
            'workflow_instance' => $instance->id ?? null,
        ]);

        // --- CREATE_MODEL ---
        $createModels = $step['create_model'] ?? [];
        if (!empty($createModels) && isset($createModels['model_type'])) $createModels = [$createModels];

        foreach ($createModels as $cm) {
            if (!is_array($cm)) continue;

            $modelType = $cm['model_type'] ?? null;
            if (!$modelType || !class_exists($modelType)) {
                Log::warning("Skipping invalid create_model", $cm);
                continue;
            }

            $fieldsMap = is_array($cm['fields'] ?? []) ? $cm['fields'] : [];
            $attributes = [];
            foreach ($fieldsMap as $field => $source) {
                $value = $this->interpolateString($source, array_merge($instance->data, $data));
                // Fallback: normalize key & value
                if ($field == $value || Str::endsWith($value, '_id'))  {
                    $normalized = str_replace('_', '', strtolower($value));
                    foreach (array_merge($instance->data, $data) as $key => $fallbackValue) {
                        if (str_replace('_', '', strtolower($key)) === $normalized) {
                            $value = $fallbackValue;
                            break;
                        }
                    }
                }

                $model = new $modelType;
                $castType = $model->getCasts()[$field] ?? null;

                if ($castType === 'array' || $castType === 'object' || $castType === 'json') {
                    if (is_string($value)) {
                        $decoded = json_decode($value, true);
                        $attributes[$field] = $decoded ?? [];
                    } elseif (is_array($value) || is_object($value)) {
                        $attributes[$field] = $value;
                    } else {
                        $attributes[$field] = [];
                    }
                } else {
                    $attributes[$field] = $value;
                }

            }

            Log::info("Creating model", [
                'type' => $modelType,
                'attributes' => $attributes,
            ]);

            $model = $modelType::create($attributes);
            $idField = strtolower(class_basename($modelType)) . '_id';
            $data[$idField] = $model->id;

            if (!$instance->model_type) {
                $instance->model_type = $modelType;
                $instance->model_id = $model->id;
            }

            $createdModels[$idField] = $model->toArray();
        }

        // --- UPDATE_MODELS ---
        $updateModels = $step['update_models'] ?? [];
        if (!empty($updateModels) && isset($updateModels['model_type'])) $updateModels = [$updateModels];

        foreach ($updateModels as $modelConfig) {
            if (!is_array($modelConfig)) continue;

            $modelType = $modelConfig['model_type'] ?? null;
            $modelIdField = $modelConfig['model_id_field'] ?? null;
            if (!$modelType || !$modelIdField) {
                Log::warning("Invalid update_model config", $modelConfig);
                continue;
            }
            $resolvedValue = $this->interpolateString("{{ $modelIdField }}", array_merge($instance->data, $data));
            Log::debug("Resolved model field id: ", ['model_id_field' => $modelIdField, 'value' => $resolvedValue]);
            // Fallback: normalize key & value
            if (!$resolvedValue || $resolvedValue == $modelIdField || Str::endsWith($resolvedValue, '_id')) {
                $normalized = str_replace('_', '', strtolower($modelIdField));
                foreach (array_merge($instance->data, $data) as $key => $value) {
                    if (str_replace('_', '', strtolower($key)) === $normalized) {
                        $resolvedValue = $value;
                        break;
                    }
                }
                Log::debug("Fallback: normalize model field id: ", ['model_id' => $modelIdField, 'value' => $resolvedValue]);
            }

            if (!$resolvedValue) {
                Log::error("Model ID not found for update", [
                    'model_type' => $modelType,
                    'field' => $modelIdField,
                    'data' => array_merge($instance->data, $data),
                ]);
                continue;
            }

            $model = $modelType::find($resolvedValue);
            if (!$model) {
                Log::error("Model not found", [
                    'model_type' => $modelType,
                    'id' => $resolvedValue,
                ]);
                continue;
            }

            $fields = is_array($modelConfig['fields'] ?? []) ? $modelConfig['fields'] : [];
            foreach ($fields as $field => $valueOrSource) {
                $value = $this->interpolateString($valueOrSource, array_merge($instance->data, $data));

                $castType = $model->getCasts()[$field] ?? null;
                if ($castType === 'array' || $castType === 'object' || $castType === 'json') {
                    if (is_string($value)) {
                        $decoded = json_decode($value, true);
                        $model->$field = $decoded ?? [];
                    } elseif (is_array($value) || is_object($value)) {
                        $model->$field = $value;
                    } else {
                        $model->$field = [];
                    }
                } else {
                    $model->$field = $value;
                }

                Log::debug("Updating model field", [
                    'model_type' => $modelType,
                    'id' => $resolvedValue,
                    'field' => $field,
                    'value' => $value,
                ]);
            }
            $model->save();

            Log::info("Updated model", [
                'model_type' => $modelType,
                'id' => $resolvedValue,
            ]);
        }

        return array_merge($data, $createdModels);
    }

    private function determineNextStep(array $step, array $steps, string $currentStepId, array $data): string
    {
        foreach ($step['conditions'] ?? [] as $condition) {
            if (!is_array($condition)) continue;

            $when = $condition['when'] ?? null;
            $next = $condition['next'] ?? null;

            if (!$when || !$next) continue;

            if ($this->evaluateCondition($data, $when)) {
                return $next;
            }
        }

        if ($step['finished'] ?? false) {
            return 'completed';
        }
        // Default: next sequential step or 'completed'
        $index = array_search($currentStepId, array_column($steps, 'id'));
        return ($index !== false && isset($steps[$index + 1]['id'])) ? $steps[$index + 1]['id'] : 'completed';
    }

    public function instance(string $slug, int $id) {
        $instance = WorkflowInstance::findOrFail($id);
        $workflow = $this->loadWorkflow($slug);

        $steps = $workflow['steps'] ?? [];
        if (!is_array($steps)) {
            $steps = [];
        }
        $nextStep = collect($steps)->firstWhere('id', $instance->current_step);
        if (!is_array($nextStep)) {
            $nextStep = null;
        }

        return response()->json([
            'next_step'      => $nextStep,
            'instance'       => $instance,
            'created_models' => $instance->data,
        ]);
    }

    public function history(int $instanceId)
    {
        $instance = WorkflowInstance::with('workflow')->findOrFail($instanceId);

        $query = WorkflowStepHistory::with('user')
            ->where('workflow_instance_id', $instanceId);

        if ($action = request()->query('action')) {
            $query->where('action', $action);
        }

        if ($actor = request()->query('actor')) {
            $query->whereHas('user', fn($q) => $q->where('name', 'like', "%{$actor}%"));
        }

        if ($search = request()->query('search')) {
            $query->where('step_id', 'like', "%{$search}%");
        }

        $steps = $query->orderBy('created_at', 'asc')
            ->get();

        $actors = WorkflowStepHistory::where('workflow_instance_id', $instanceId)
            ->with('user')
            ->get()
            ->pluck('user.name')
            ->filter()
            ->unique()
            ->values();

        return response()->json([
            'instance' => new WorkflowInstanceResource($instance),
            'steps'    => WorkflowStepHistoryResource::collection($steps),
            'actors'   => $actors,
        ]);
    }

    protected function interpolate(array $arr, array $record = []): array
    {
        return collect($arr)->map(function ($v) use ($record) {
            if (is_array($v)) {
                return $this->interpolate($v, $record);
            }
            return $this->interpolateString($v, $record);
        })->toArray();
    }

    protected function interpolateString($value, array $record = [])
    {
        if (!is_string($value)) {
            return $value;
        }

        return preg_replace_callback('/{{\s*(.+?)\s*}}/', function ($matches) use ($record) {
            $evaluated = (new ExpressionEvaluator())->evaluate($matches[1], $record);

            if (is_object($evaluated) || is_array($evaluated)) {
                $evaluated = json_encode($evaluated, JSON_UNESCAPED_UNICODE);
            }

            Log::debug('Interpolated string', [
                'template' => $matches[0],
                'context'  => $record,
                'result'   => $evaluated,
            ]);

            return (string) $evaluated;
        }, $value);
    }

    protected function evaluateCondition(array|object $record, string $condition): bool
    {
        if (!$record) return false;

        $context = is_object($record) ? (array) $record : $record;

        try {
            Log::debug('Evaluating condition', [
                'condition' => $condition,
                'context'   => $context,
            ]);

            $result = (new ExpressionEvaluator())->evaluate($condition, $context);

            Log::debug('Condition evaluation result', [
                'condition' => $condition,
                'result'    => $result,
            ]);

            return $result;
        } catch (\Exception $e) {
            Log::error('Condition evaluation failed', [
                'condition' => $condition,
                'context'   => $context,
                'error'     => $e->getMessage(),
            ]);
            return false;
        }
    }

    protected function getValueFrom(array $response, string $path)
    {
        $value = data_get($response, $path);

        if ($value !== null) {
            return $value;
        }

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveArrayIterator($response),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $key => $val) {
            if ($key === $path) {
                return $val;
            }
        }

        return null;
    }
}
