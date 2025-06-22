<?php
namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\Models\AppSetting;
use Sawmainek\Apitoolz\SeederBuilder;

class BrandingGenerator extends Command
{
    protected $signature = 'apitoolz:branding
                            {--app-name= : Application name}
                            {--app-desc= : Application desc}
                            {--logo-url= : Logo URL (relative or full)}
                            {--logo-small-url= : Small Logo URL (relative or full)}
                            {--logo-dark-url= : Dark Logo URL (relative or full)}
                            {--logo-dark-small-url= : Dark Small Logo URL (relative or full)}
                            {--theme-color= : Primary theme color (hex)}';

    protected $description = 'Set branding configuration for APIToolz-based apps';

    public function handle()
    {
        $appSetting = AppSetting::where('key', 'default_settings')->first();
        if (!$appSetting) {
            $this->error('AppSetting with key "default_settings" not found.');
            return;
        }
        $appSetting->branding = [
            'app_name' => $this->option('app-name') ?? $appSetting->branding['app_name'] ?? 'My App',
            'app_desc' => $this->option('app-desc') ?? $appSetting->branding['app_desc'] ?? 'My App Description',
            'logo_url' => $this->option('logo-url') ?? $appSetting->branding['logo_url'] ?? '/assets/logo.png',
            'logo_small_url' => $this->option('logo-small-url') ?? $appSetting->branding['logo_small_url'] ?? '/assets/logo.png',
            'logo_dark_url' => $this->option('logo-dark-url') ?? $appSetting->branding['logo_dark_url'] ?? '/assets/logo.png',
            'logo_dark_small_url' => $this->option('logo-dark-small-url') ?? $appSetting->branding['logo_dark_small_url'] ?? '/assets/logo.png',
            'theme_color' => $this->option('theme-color') ?? $appSetting->branding['theme_color'] ?? '#4f46e5',
        ];
        $appSetting->save();

        SeederBuilder::build();

        $this->info('Branding configuration saved successfully.');
    }
}
