<?php

namespace Sawmainek\Apitoolz\Integrations;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Yaml\Yaml;
use Inertia\Inertia;
use Illuminate\Support\Facades\View;

class WorkflowRunner
{
    protected array $workflow;
    protected PluginManager $plugins;
    protected array $context = [];

    public function __construct(string $yaml, PluginManager $plugins)
    {
        $this->workflow = Yaml::parse($yaml);
        $this->plugins = $plugins;

        Log::debug('Workflow loaded', ['workflow' => $this->workflow]);
    }

    public function getSteps(): array
    {
        return $this->workflow['steps'] ?? [];
    }

    public function runStep(string $stepId, array $context = [])
    {
        Log::debug('Fresh context data', ['context' => $context]);
        if (!empty($context)) {
            Log::debug('Fresh context data', ['context' => $context]);
            $this->context = array_merge($this->context, $context);
            Log::debug('After fresh context data', ['context' => $this->context]);
        }

        $step = collect($this->workflow['steps'])->firstWhere('id', $stepId);
        if (!$step) {
            Log::error("Step {$stepId} not found", ['context' => $this->context]);
            throw new \Exception("Step {$stepId} not found");
        }

        Log::debug("Running step {$stepId}", ['step' => $step, 'context' => $this->context]);

        $action = $step['action'] ?? null;

        return match ($action) {
            'redirect' => $this->handleRedirect($step),
            'poll_db' => $this->handlePollDb($step),
            'ui_form'  => $this->handleUiForm($step),
            'http_trigger' => $this->handleTriggerRequest($step),
            default => $this->handleHttpRequest($step),
        };
    }

    protected function handleHttpRequest(array $step)
    {
        if (!empty($step['mock_response'])) {
            Log::debug('Using mock response for step', ['step' => $step['id']]);
            $response = $step['mock_response'];
        } else {
            $body = $this->interpolate($step['request']['body'] ?? []);
            if (!empty($step['request']['plugins'])) {
                $body = $this->applyPlugins($step['request']['plugins'], $body);
            }

            $url = $this->interpolateString($step['request']['url'] ?? '');
            $headers = $this->interpolate($step['request']['headers'] ?? []);
            $method = strtoupper($step['request']['method'] ?? 'POST');

            $http = Http::withHeaders(array_merge(['Content-Type' => 'application/json'], $headers))
                        ->withOptions(['verify' => false]);

            $response = $http->send($method, $url, ['json' => $body])->json();
            Log::debug('Received response', ['response' => $response]);
        }

        // 3️⃣ Save fields to context
        if (!empty($step['response']['fields'])) {
            foreach ($step['response']['fields'] as $field) {
                if (is_array($field)) {
                    foreach ($field as $target => $path) {
                        $this->context[$target] = $this->getValueFrom($response, $path);
                    }
                } else {
                    $this->context[$field] = $this->getValueFrom($response, $field);
                }
            }
        }

        // 4️⃣ Handle response conditions
        $nextStepToRun = null;
        if (!empty($step['response']['conditions'])) {
            foreach ($step['response']['conditions'] as $conditionConfig) {
                $when = $conditionConfig['when'] ?? null;
                $updateToDb = $conditionConfig['update_to_db'] ?? null;
                $saveToDb = $conditionConfig['save_to_db'] ?? null;
                $nextStep = $conditionConfig['next'] ?? null;

                if ($when && $this->evaluateCondition(array_merge($this->context, $response), $when)) {
                    if ($updateToDb) $this->saveToDb($updateToDb, $response);
                    if ($saveToDb) $this->saveToDb($saveToDb, $response);
                    if ($nextStep) $nextStepToRun = $nextStep;
                    break; // Only first matching condition
                }
            }
        }

        // 5️⃣ Save to DB if defined outside conditions
        if (!empty($step['save_to_db'])) {
            $this->saveToDb($step['save_to_db'], $response);
        }

        // 6️⃣ Execute next step chain
        while ($nextStepToRun) {
            $nextStepResponse = $this->runStep($nextStepToRun);

            // Check if the next step itself has a 'next' in its conditions
            $nextStepToRun = null;
            $lastStep = collect($this->workflow['steps'])->firstWhere('id', $nextStepToRun);
            if (!empty($lastStep['response']['conditions'])) {
                foreach ($lastStep['response']['conditions'] as $conditionConfig) {
                    $when = $conditionConfig['when'] ?? null;
                    $nextStep = $conditionConfig['next'] ?? null;
                    if ($when && $this->evaluateCondition(array_merge($this->context, $nextStepResponse), $when)) {
                        $nextStepToRun = $nextStep;
                        break;
                    }
                }
            }
            $response = $nextStepResponse;
        }

        return $response ?? [];
    }

    protected function handleRedirect(array $step)
    {
        Log::debug('Redirect context data', ['context' => $this->context]);

        // Interpolate body and headers
        $body = $this->interpolate($step['request']['body'] ?? []);
        if (!empty($step['request']['plugins'])) {
            $body = $this->applyPlugins($step['request']['plugins'], $body);
        }

        $url = $this->interpolateString($step['request']['url'] ?? '');
        $method = strtoupper($step['request']['method'] ?? 'POST');

        if ($method === 'GET') {
            // Build query string for GET request
            $query = http_build_query($body);
            $redirectUrl = $url . (str_contains($url, '?') ? '&' : '?') . $query;
            return redirect()->to($redirectUrl);
        }

        // For POST method: generate a form
        $formInputs = '';
        foreach ($body as $key => $value) {
            $escapedKey = htmlspecialchars($key, ENT_QUOTES, 'UTF-8');
            $escapedValue = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
            $formInputs .= "<input type='hidden' name='{$escapedKey}' value='{$escapedValue}'>";
        }

        $escapedUrl = htmlspecialchars($url, ENT_QUOTES, 'UTF-8');

        $html = <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Redirecting...</title>
        </head>
        <body>
            <form id="redirectForm" action="{$escapedUrl}" method="{$method}">
                {$formInputs}
            </form>
            <script>document.getElementById('redirectForm').submit();</script>
        </body>
        </html>
        HTML;

        return response($html, 200)
            ->header('Content-Type', 'text/html');
    }

    protected function handlePollDb(array $step)
    {
        $table = $step['table'] ?? null;
        $queries = $this->interpolate($step['query'] ?? []);
        $interval = $step['interval_seconds'] ?? 5;
        $timeout = $step['timeout_seconds'] ?? 60;
        $onTimeout = $step['on_timeout'] ?? null; // 👈 support on_timeout

        Log::debug('Starting DB poll', [
            'table'     => $table,
            'queries'   => $queries,
            'interval'  => $interval,
            'timeout'   => $timeout,
        ]);

        $start   = time();
        $record  = null;
        $attempt = 0;

        // 🔄 Poll DB until record is found or timeout
        while (time() - $start < $timeout) {
            $attempt++;
            $builder = DB::table($table);

            foreach ($queries as $field => $value) {
                if (is_array($value)) {
                    if (isset($value['operator'], $value['value'])) {
                        $builder->where($field, $value['operator'], $value['value']);
                    } elseif (isset($value['in'])) {
                        $builder->whereIn($field, $value['in']);
                    } elseif (isset($value['not_in'])) {
                        $builder->whereNotIn($field, $value['not_in']);
                    } elseif (isset($value['or'])) {
                        $builder->where(function ($q) use ($value) {
                            foreach ($value['or'] as $orCondition) {
                                foreach ($orCondition as $orField => $orValue) {
                                    if (is_array($orValue) && isset($orValue['operator'], $orValue['value'])) {
                                        $q->orWhere($orField, $orValue['operator'], $orValue['value']);
                                    } else {
                                        $q->orWhere($orField, $orValue);
                                    }
                                }
                            }
                        });
                    }
                } else {
                    $builder->where($field, $value);
                }
            }

            $record = $builder->first();
            Log::debug('Polling attempt', ['attempt' => $attempt, 'record' => $record]);

            if ($record) {
                break;
            }

            sleep($interval);
        }

        $record = (array) $record ?? [];
        Log::debug('Final polled DB record', ['record' => $record]);

        // ✅ If record found, evaluate conditions
        if (!empty($record) && !empty($step['conditions'])) {
            foreach ($step['conditions'] as $conditionConfig) {
                $when      = $conditionConfig['when'] ?? null;
                $updateToDb = $conditionConfig['update_to_db'] ?? null;
                $saveToDb   = $conditionConfig['save_to_db'] ?? null;
                $nextStep   = $conditionConfig['next'] ?? null;

                $conditionMatched = $when && $this->evaluateCondition($record, $when);
                Log::debug('Evaluating condition', [
                    'when'   => $when,
                    'record' => $record,
                    'matched'=> $conditionMatched,
                ]);

                if ($conditionMatched) {
                    if ($updateToDb) {
                        $this->saveToDb($updateToDb, $record);
                    }
                    if ($saveToDb) {
                        $this->saveToDb($saveToDb, $record);
                    }

                    if ($nextStep) {
                        Log::debug('Next step determined by condition', ['nextStep' => $nextStep]);
                        return $this->runStep($nextStep, $record);
                    }

                    break; // stop at first match
                }
            }
        }

        // ⏰ Handle timeout
        if (empty($record) && $onTimeout) {
            Log::debug('Polling timed out, going to next step', ['nextStep' => $onTimeout]);
            return $this->runStep($onTimeout, []);
        }

        // default: just return record (could be empty)
        return $record;
    }

    protected function handleUiForm(array $step)
    {
        $template = $step['template'] ?? null;
        $ctx = $step['context'] ?? [];
        $renderType = strtolower($step['render_type'] ?? 'blade'); // default to blade

        if (!$template) {
            Log::error("UI Form step requires a template", ['step' => $step]);
            throw new \RuntimeException("UI Form step requires a template");
        }

        // Interpolate context values from workflow context
        $mergedContext = array_merge($this->context, $this->interpolate($ctx));

        Log::debug("Preparing UI Form render", [
            'template' => $template,
            'render_type' => $renderType,
            'context' => $mergedContext,
        ]);

        if ($renderType === 'react') {
            if (!class_exists(Inertia::class)) {
                throw new \RuntimeException("Inertia not available for React rendering");
            }
            Log::debug("Rendering React component via Inertia", [
                'component' => $template,
                'context' => $mergedContext,
            ]);
            return Inertia::render($template, $mergedContext);
        } elseif ($renderType === 'blade') {
            if (!View::exists($template)) {
                throw new \RuntimeException("Blade view not found: {$template}");
            }
            Log::debug("Rendering Blade view", [
                'view' => $template,
                'context' => $mergedContext,
            ]);
            return view($template, $mergedContext);
        } else {
            throw new \RuntimeException("Invalid render_type: {$renderType}");
        }
    }

    protected function handleTriggerRequest(array $step)
    {
        $body = $this->interpolate($step['request']['body'] ?? []);

        foreach ($body as $key => $path) {
            if (is_string($path)) {
                $body[$key] = $this->getValueFrom($this->context, $path);
            }
        }

        if (!empty($step['plugins'])) {
            $body = $this->applyPlugins($step['plugins'], $body);
        }

        Log::debug('Trigger request processed', ['body' => $body]);

        if (!empty($step['conditions'])) {
            foreach ($step['conditions'] as $conditionConfig) {
                $when       = $conditionConfig['when'] ?? null;
                $updateToDb = $conditionConfig['update_to_db'] ?? null;
                $nextStep   = $conditionConfig['next'] ?? null;
                $returnData = $conditionConfig['return'] ?? null;

                $conditionMatched = $when && $this->evaluateCondition($body, $when);

                Log::debug('Evaluating trigger condition', [
                    'when'    => $when,
                    'body'    => $body,
                    'matched' => $conditionMatched,
                ]);

                if ($conditionMatched) {
                    if ($updateToDb) {
                        $this->saveToDb($updateToDb, $body);
                    }

                    if ($nextStep) {
                        return $this->runStep($nextStep, $body);
                    }

                    if ($returnData) {
                        return $returnData;
                    }

                    break;
                }
            }
        }

        if (!empty($step['save_to_db'])) {
            $this->saveToDb($step['save_to_db'], $body);
        }

        if (!empty($step['return'])) {
            return $step['return'];
        }

        return $body;
    }

    protected function saveToDb(array $saveConfig, array $record): void
    {
        $table = $saveConfig['table'] ?? null;
        $data = $saveConfig['data'] ?? [];

        if (!$table || empty($data)) {
            Log::warning('save_to_db config missing table or data', ['config' => $saveConfig]);
            return;
        }

        // Resolve unique keys from expressions
        $uniqueKeys = [];
        if (!empty($saveConfig['unique_keys'])) {
            foreach ($saveConfig['unique_keys'] as $key => $expr) {
                $uniqueKeys[$key] = $this->interpolateString($expr, $record);
            }
        }

        // Resolve data fields from expressions
        $resolvedData = [];
        foreach ($data as $key => $expr) {
            $resolvedData[$key] = $this->interpolateString($expr, $record);
        }

        try {
            DB::table($table)->updateOrInsert(
                $uniqueKeys ?: $resolvedData, // fallback to all data if no unique_keys
                $resolvedData
            );
            Log::debug("Data saved to table {$table}", ['unique_keys' => $uniqueKeys, 'data' => $resolvedData]);
        } catch (\Exception $e) {
            Log::error("Failed to save to DB table {$table}", [
                'unique_keys' => $uniqueKeys,
                'data' => $resolvedData,
                'error' => $e->getMessage(),
            ]);
        }
    }

    protected function applyPlugins(array $plugins, array $body): array
    {
        foreach ($plugins as $pluginConfig) {
            $body = $this->plugins->apply($pluginConfig, $body, $this->context);
            Log::debug('Plugin applied', ['plugin' => $pluginConfig, 'body' => $body]);
        }
        return $body;
    }

    protected function interpolate(array $arr): array
    {
        return collect($arr)->map(function ($v) {
            if (is_array($v)) return $this->interpolate($v);
            return $this->interpolateString($v);
        })->toArray();
    }

    protected function interpolateString($value, array $record = [])
    {
        if (!is_string($value)) {
            return $value;
        }

        return preg_replace_callback('/{{\s*(.+?)\s*}}/', function ($matches) use ($record) {
            $context = !empty($record) ? array_merge($this->context, $record) : $this->context;

            $evaluated = (new ExpressionEvaluator())->evaluate($matches[1], $context);

            Log::debug('Interpolated string', [
                'template' => $matches[0],
                'context'  => $context,
                'result'   => $evaluated,
            ]);

            return $evaluated;
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
