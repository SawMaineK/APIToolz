<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\SummaryBuilder;

class ModelSummaryGenerator extends Command
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
    protected $signature = 'apitoolz:summary {model} {--title=} {--model=} {--type=} {--icon=} {--method=} {--column=} {--chart-type=} {--group-by=} {--group-model=} {--group-label=} {--aggregate=} {--limit=} {--value-method=} {--where=} {--value-column=} {--max-method=} {--unit=} {--remove} {--force} {--doc}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Allow to add summary for model.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('doc')) {
            $this->printDocumentation();
            return;
        }

        $this->info('Adding summary report');

        $name = $this->argument('model');
        if($name == 'Dashboard') {
            if($this->option('model') == '') {
                $this->error("--model option is required.");
            }
            $name = $this->option('model');
        }
        $model = Model::where('name', $name)->first();
        if($model) {
            $roles = [
                'type'   => 'required|in:kpi,chart,progress',
                'model'  => 'required|string',
                'title'  => 'required|string',
                'icon'   => 'nullable|string',

                // KPI
                'method' => 'required_if:type,kpi|in:count,sum,avg,min,max',
                'column' => [
                    'required_if:method,sum,avg,min,max',
                    'string',
                    function ($attribute, $value, $fail) use ($model) {
                        if (!empty($value) && !\Schema::hasColumn($model->table, $value)) {
                            $fail("The selected column '{$value}' does not exist in the model table.");
                        }
                    }
                ],

                // Chart
                'chart_type' => 'required_if:type,chart|in:bar,line,pie,doughnut,area',
                'group_by'   => [
                    'required_if:type,chart',
                    'string',
                    function ($attribute, $value, $fail) use ($model) {
                        if (!empty($value) && strpos($value, '(') === false && !\Schema::hasColumn($model->table, $value)) {
                            $fail("The selected group_by column '{$value}' does not exist in the model table.");
                        }
                    }
                ],
                'aggregate' => 'required_if:type,chart|in:count,sum,avg,min,max',
                'limit'     => 'nullable|integer|min:1|max:100',

                // Progress
                'value_method' => 'required_if:type,progress|in:where',
                'value_column' => 'required_if:type,progress|string',
                'max_method'   => 'required_if:type,progress|in:count,sum,avg,min,max',
                'unit'        => 'nullable|string'
            ];
            $data = [
                'type'         => $this->option('type'),
                'model'        => $name,
                'title'        => $this->option('title'),
                'icon'         => $this->option('icon'),
                'method'       => $this->option('method'),
                'column'       => $this->option('column'),
                'chart_type'   => $this->option('chart-type'),
                'group_by'     => $this->option('group-by'),
                'group_model'  => $this->option('group-model'),
                'group_label'  => $this->option('group-label'),
                'aggregate'    => $this->option('aggregate'),
                'limit'        => $this->option('limit'),
                'value_method' => $this->option('value-method'),
                'value_column' => $this->option('value-column'),
                'max_method'   => $this->option('max-method'),
                'where'        => $this->option('where'),
                'unit'         => $this->option('unit'),
            ];

            // Remove keys with null values
            $data = array_filter($data, function($value) {
                return !is_null($value);
            });
            $validator = \Validator::make($data, $roles);
            if ($validator->fails()) {

                foreach($validator->errors()->messages() as $key => $err) {
                    $this->error($err[0]);
                }
                return;
            }
            if($this->option('remove')) {
                if($this->argument('model') == 'Dashboard') {
                    SummaryBuilder::buildDashboard($data, $this->option('force'), $this->option('remove'));
                } else {
                    SummaryBuilder::build($model, $data, $this->option('force'), $this->option('remove'));
                }
                return $this->info("The " . strtolower($this->option('title')) . " summary has removed successfully.");
            } else {
                if($this->argument('model') == 'Dashboard') {
                    SummaryBuilder::buildDashboard($data, $this->option('force'));
                } else {
                    SummaryBuilder::build($model, $data, $this->option('force'));
                }
                return $this->info("The " . strtolower($this->option('title')) . " summary has created successfully.");
            }

        } else {
            $this->error("This $name model not found.");
        }

    }

    protected function printDocumentation()
    {
        $this->info('Usage:');
        $this->info('  apitoolz:summary {model} {--title=} {--model=} {--type=} {--icon=} {--method=} {--column=} {--chart-type=} {--group-by=} {--aggregate=} {--limit=} {--value-method=} {--value-column=} {--max-method=} {--unit=} {--remove} {--force} {--doc}');
        $this->info('Options:');
        $this->info('  --title          The title of the summary report.');
        $this->info('  --model          The model of the dashboard summary report'         );
        $this->info('  --type           The type of the summary (kpi, chart, progress).');
        $this->info('  --icon           The icon for the summary report.');
        $this->info('  --method         The method for KPI (count, sum, avg, min, max).');
        $this->info('  --column         The column to apply the method on.');
        $this->info('  --chart-type     The type of chart (bar, line, pie, doughnut, area).');
        $this->info('  --group-by       The column to group by in charts.');
        $this->info('  --group-model    The model to group by in charts');
        $this->info('  --group-label    The model display field to group by in charts');
        $this->info('  --aggregate      The aggregation method for charts (count, sum, avg, min, max).');
        $this->info('  --limit          The limit for chart results.');
        $this->info('  --value-method   The method for progress value (where).');
        $this->info('  --value-column   The column for progress value.');
        $this->info('  --max-method     The method for maximum value in progress (count, sum, avg, min, max).');
        $this->info('  --where          The where condition(s) for filtering data.');
        $this->info('  --unit           The unit for progress.');
        $this->info('  --remove         Remove the existing summary report.');
        $this->info('  --force          Force overwrite existing summary report.');
        $this->info('  --doc            Show this documentation.');
    }

}
