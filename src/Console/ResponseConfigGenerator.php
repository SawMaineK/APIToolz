<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\Facades\ModelConfigUtils;
use Sawmainek\Apitoolz\ResponseConfigBuilder;
use Spatie\Permission\Models\Role;

class ResponseConfigGenerator extends Command
{
    protected $signature = 'apitoolz:response
        {model : The model name}
        {--field= : Field name to configure}
        {--label= : Field label for display}
        {--visible=true : Show in response (true|false)}
        {--export=true : Allow export (true|false)}
        {--position= : Sorting position}
        {--width= : Optional columns width for the field in the response}
        {--only-roles= : Comma-separated list of roles to apply this config}
        {--link= : Optional link for the field, e.g., "https://example.com/{id}"}
        {--reset : Reset existing field config}
        {--doc : Show detailed documentation}';

    protected $description = 'Generate or update field response configuration for the given model.';

    public function handle()
    {
        if ($this->option('doc')) {
            $this->printDoc();
            return;
        }

        $this->info('Field configuration start...');

        $name = $this->argument('model');
        $model = Model::where('name', $name)->first();
        if (!$model) {
            $this->error("Model \"$name\" not found.");
            return;
        }

        $config = ModelConfigUtils::decryptJson($model->config);
        $roles = [
            'field' => 'required|in:' . implode(',', array_map(fn($form) => $form['field'], $config['grid'])),
        ];

        if ($this->option('only-roles')) {
            $roleNames = array_map('trim', explode(',', $this->option('only-roles')));
            $existingRoles = Role::whereIn('name', $roleNames)->pluck('name')->toArray();
            $invalidRoles = array_diff($roleNames, $existingRoles);

            if (!empty($invalidRoles)) {
                $this->error('Invalid roles: ' . implode(', ', $invalidRoles));
                return;
            }
            $roles['only_roles'] = 'array';
        }

        $data = [
            'field' => $this->option('field'),
            'label' => $this->option('label'),
            'view' => $this->option('visible') === 'true',
            'download' => $this->option('export') === 'true',
            'sortlist' => $this->option('position'),
            'width' => $this->option('width'),
            'only_roles' => $this->option('only-roles') ? explode(',', $this->option('only-roles')) : [],
            'link' => $this->option('link') ?? '',
        ];

        $validator = \Validator::make($data, $roles);

        if ($validator->fails()) {
            foreach ($validator->errors()->messages() as $err) {
                $this->error("- {$err[0]}");
            }
            return;
        }

        ResponseConfigBuilder::build($model, $data, $this->option('reset'));

        $action = $this->option('reset') ? 'reset' : 'updated';
        $this->info("The \"{$this->option('field')}\" config has been {$action} successfully.");
    }

    protected function printDoc()
    {
        $this->info("=== Response Config Generator Help ===");
        $this->line("Command:");
        $this->line("  php artisan apitoolz:response {model} [options]");
        $this->newLine();

        $this->info("Arguments:");
        $this->line("  model              The name of the model (e.g., User)");

        $this->info("Options:");
        $this->line("  --field=FIELD      Field name to configure (required)");
        $this->line("  --label=LABEL      Optional label for the field");
        $this->line("  --visible=BOOL     Whether to show the field in response (default: true)");
        $this->line("  --export=BOOL      Whether to include field in export (default: true)");
        $this->line("  --position=NUM     Optional position index for ordering");
        $this->line("  --width=WIDTH      Optional width for the field in the response");
        $this->line("  --only-roles=ROLES Comma-separated list of roles to apply this config");
        $this->line("  --link=URL         Optional link for the field, e.g., 'https://example.com/{id}'");
        $this->line("  --reset            Reset the field's existing response config");
        $this->line("  --doc              Show this doc message");

        $this->newLine();
        $this->info("Examples:");
        $this->line("  php artisan apitoolz:response User --field=email --label=\"Email Address\"");
        $this->line("  php artisan apitoolz:response Product --field=price --visible=false --export=true");
        $this->line("  php artisan apitoolz:response Order --field=status --reset");

        $this->newLine();
        $this->info("=======================================");
    }
}
