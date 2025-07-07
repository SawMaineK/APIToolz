<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Sawmainek\Apitoolz\ReactComponentBuilder;
use Sawmainek\Apitoolz\Support\ReactScaffolder\ReactScaffolder;

class ReactAppGenerator extends Command
{
    protected $signature = <<<SIG
        apitoolz:react-frontend
        { name : The logical name of the React bundle (e.g. Frontend) }
        { --path=resources/js : Destination base directory }
        { --theme=blue : The Tailwind color to use as the primary theme (e.g. blue, teal, violet) }
        { --vite : Include Vite config + plugin }
        { --tailwind : Include Tailwind CSS preset }
        { --typescript : Use TypeScript (.tsx) entry + tsconfig.json }
        { --eslint : Add ESLint + Prettier + Tailwind class-sorting }
        { --storybook : Add Storybook 7 scaffold }
        { --use-ai= : Use AI to generate component layout from a BRS file (pass .txt or .md path) }
        { --rollback= : Remove current build to previous counts}
        { --force : Overwrite existing files }
    SIG;

    protected $description = 'Scaffold a React + Vite (optional Tailwind, TS, ESLint, Storybook) stack inside Laravel resources/js';

    public function handle(): int
    {
        $name  = Str::studly($this->argument('name'));
        $root  = base_path(trim(str_replace(['\\', '/'], DIRECTORY_SEPARATOR, $this->option('path')), DIRECTORY_SEPARATOR));
        $path  = $root.DIRECTORY_SEPARATOR.$name;
        $flags = collect([
            'vite'       => $this->option('vite'),
            'tailwind'   => $this->option('tailwind'),
            'typescript' => $this->option('typescript'),
            'eslint'     => $this->option('eslint'),
            'storybook'  => $this->option('storybook'),
            'force'      => $this->option('force'),
        ]);

        $reactScaffolder = new ReactScaffolder(
            projectName: $name,
            path:        $path,
            flags:       $flags,
            console:     $this,
        );
        $reactScaffolder->scaffold();

        if ($brs = $this->option('use-ai')) {
            $this->info("AI generating your BRS...");
            if (!file_exists($brs)) {
                $this->error("BRS file not found: {$brs}");
                return Command::FAILURE;
            }

            $brsText = file_get_contents($brs);
            $files = ReactComponentBuilder::buildComponentsFromBRS(
                $brsText,
                $name,
                $this->option('theme'),
                $this->option('typescript'),
                $this->option('force'),
                $this->option('rollback')
            );
            foreach ($files as $file => $code) {
                $target = base_path("resources/js/{$file}");
                $dir = dirname($target);
                if (! file_exists($dir)) {
                    mkdir($dir, 0755, true);
                }
                file_put_contents($target, $code);
                $this->line("• AI generated: {$file}");
            }
            $reactScaffolder->mergePackageJson();
        }

        $this->info("✨  React project [$name] successfully scaffolded at [$path]");
        $this->line('Run:   npm install  &&  npm run dev');
        return self::SUCCESS;
    }
}
