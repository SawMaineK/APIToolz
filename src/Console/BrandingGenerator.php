<?php
namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
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
                            {--theme-color= : Primary theme color (hex)}
                            {--favicon= : Favicon URL (relative or full)}
                            {-- doc : Print documentation}';

    protected $description = 'Set branding configuration for APIToolz-based apps';

    public function handle()
    {
        if ($this->option('doc')) {
            $this->printDocumentation();
            return;
        }
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
            'favicon' => $this->option('favicon') ?? $appSetting->branding['favicon'] ?? '/assets/favicon.ico',
        ];
        $appSetting->save();


        SeederBuilder::build();

        $this->info('Branding configuration saved successfully.');
    }

    protected function addBradingToAppBlade() {
        $htmlPath = __DIR__ . '/../dist/index.html';
        $bladePath = resource_path('views/vendor/apitoolz/app.blade.php');

        if (File::exists($htmlPath)) {
            $html = File::get($htmlPath);
            $html = $this->injectBranding($html);

            File::ensureDirectoryExists(dirname($bladePath));
            File::put($bladePath, $html);
        }
    }

    protected function injectBranding(string $html): string
    {
        // 1. Split <html ...> to inject style
        if (str_contains($html, '<html')) {
            [$beforeHtml, $rest] = explode('<html', $html, 2);

            // Split until first '>'
            $htmlParts = explode('>', $rest, 2);
            $htmlTag = $htmlParts[0];
            $afterHtmlTag = $htmlParts[1] ?? '';

            $styleBlock = <<<BLADE
    style="
        --tw-primary: {{ \$branding['theme_color'] ?? '#4f46e5' }};
        --tw-primary-active: {{ (\$branding['theme_color'] ?? '#4f46e5') }}e6;
        --tw-primary-hover: {{ (\$branding['theme_color'] ?? '#4f46e5') }}e6;
        --tw-primary-focus: {{ (\$branding['theme_color'] ?? '#4f46e5') }}e6;
        --tw-primary-visible: {{ (\$branding['theme_color'] ?? '#4f46e5') }}e6;
        --tw-primary-disabled: {{ (\$branding['theme_color'] ?? '#4f46e5') }}e6;
        --tw-primary-border: {{ (\$branding['theme_color'] ?? '#4f46e5') }}e6;"
    BLADE;

            $newHtmlTag = '<html' . $htmlTag .' '. $styleBlock . '>';
            $html = $beforeHtml . $newHtmlTag . $afterHtmlTag;
        }

        // 2. Replace favicon <link rel="icon" ...>
        if (str_contains($html, '<link rel="icon')) {
            $html = preg_replace(
                '/<link\s+rel="icon"[^>]*?>/i',
                '<link rel="icon" href="{{ $branding[\'favicon\'] ?? \'/media/app/favicon.ico\' }}" />',
                $html
            );
        }

        return $html;
    }


    protected function printDocumentation() {
        $this->info('Usage:');
        $this->info('  apitoolz:branding {--app-name=} {--app-desc=} {--logo-url=} {--logo-small-url=} {--logo-dark-url=} {--logo-dark-small-url=} {--theme-color=} {--favicon=} {--doc}');
        $this->info('Options:');
        $this->info('  --app-name: Application name');
        $this->info('  --app-desc: Application description');
        $this->info('  --logo-url: Logo URL (relative or full)');
        $this->info('  --logo-small-url: Small Logo URL (relative or full)');
        $this->info('  --logo-dark-url: Dark Logo URL (relative or full)');
        $this->info('  --logo-dark-small-url: Dark Small Logo URL (relative or full)');
        $this->info('  --theme-color: Primary theme color (hex)');
        $this->info('  --favicon: Favicon URL (relative or full)');
        $this->info('  --doc: Print this documentation');
    }
}
