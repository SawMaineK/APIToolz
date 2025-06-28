<?php

namespace Sawmainek\Apitoolz\Support\ReactScaffolder;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

readonly class ReactScaffolder
{
    /** The entry file extension we need to use (.jsx | .tsx) */
    private string $entryExt;

    public function __construct(
        private string     $projectName,
        private string     $path,
        private Collection $flags,
        private Command    $console,
        private Filesystem $files = new Filesystem,
    ) {
        // decide once and reuse everywhere
        $this->entryExt = $this->flags->get('typescript') ? 'tsx' : 'jsx';
    }

    /* ------------------------------------------------------------------ */
    /*  MAIN ENTRY                                                        */
    /* ------------------------------------------------------------------ */

    public function scaffold(): void
    {
        $this->createDirectory();
        $this->copyBaseStubs();       // copies App.jsx / main.jsx
        $this->mergePackageJson();
        $this->maybeAddTailwind();
        $this->maybeAddTypeScript();  // renames main.jsx → main.tsx when needed
        $this->maybeAddEslint();
        $this->maybeAddStorybook();
        $this->updateViteConfig();    // adjusts path + plugin
        $this->publishBladeStub();    // adjusts path inside @vite(...)
        $this->updateWebRoutes();
    }

    /* ------------------------------------------------------------------ */
    /*  DIRECTORY                                                         */
    /* ------------------------------------------------------------------ */

    private function createDirectory(): void
    {
        if ($this->files->exists($this->path)) {
            if (! $this->flags['force']) {
                $this->console->error(
                    "Directory {$this->path} already exists (use --force to overwrite)."
                );
                exit(Command::FAILURE);
            }
            $this->files->deleteDirectory($this->path);
        }

        $this->files->makeDirectory($this->path, 0755, recursive: true);
        $this->console->line("• Created directory <fg=gray>{$this->path}</>");
    }

    /* ------------------------------------------------------------------ */
    /*  ROUTES/WEB.PHP CATCH-ALL ROUTE                                    */
    /* ------------------------------------------------------------------ */

    private function updateWebRoutes(): void
    {
        $webRoutes = base_path('routes/web.php');
        if (! $this->files->exists($webRoutes)) {
            $this->console->error('routes/web.php not found – skipping SPA route.');
            return;
        }

        $routeLine = "Route::view('/{any}', 'app')->where('any', '^(?!api).*');";
        $content   = $this->files->get($webRoutes);

        if (! Str::contains($content, $routeLine)) {
            // ensure trailing newline, then append
            if (! str_ends_with($content, PHP_EOL)) {
                $content .= PHP_EOL;
            }
            $content .= $routeLine . PHP_EOL;
            $this->files->put($webRoutes, $content);
            $this->console->line('• Added SPA catch-all route to routes/web.php');
        } else {
            $this->console->line('• SPA catch-all route already present in routes/web.php');
        }
    }

    /* ------------------------------------------------------------------ */
    /*  COPY BASE STUBS                                                   */
    /* ------------------------------------------------------------------ */

    private function copyBaseStubs(): void
    {
        $stubDir = __DIR__ . '/stubs/base';
        $this->files->copyDirectory($stubDir, $this->path);

        // we always copy a JSX version first → replace placeholder in whichever exists
        foreach (['main.tsx', 'main.jsx'] as $file) {
            $entry = $this->path . '/' . $file;
            if ($this->files->exists($entry)) {
                $this->files->put(
                    $entry,
                    str_replace('{{ name }}', $this->projectName, $this->files->get($entry))
                );
            }
        }
    }

    /* ------------------------------------------------------------------ */
    /*  PACKAGE.JSON MERGE                                                */
    /* ------------------------------------------------------------------ */

    public function mergePackageJson(): void
    {
        /* -----------------------------------------------------------
        * 1) Base merge from stub package.json → root package.json
        * --------------------------------------------------------- */
        $stubPkgPath  = $this->path . '/package.json';
        $projectPkg   = $this->files->exists($stubPkgPath)
            ? json_decode($this->files->get($stubPkgPath), true)
            : [];

        $rootPkgPath  = base_path('package.json');
        $rootPkg      = $this->files->exists($rootPkgPath)
            ? json_decode($this->files->get($rootPkgPath), true)
            : ['private' => true];

        foreach (['scripts', 'dependencies', 'devDependencies'] as $section) {
            $rootPkg[$section] = array_merge(
                $projectPkg[$section] ?? [],
                $rootPkg[$section]   ?? []
            );
            ksort($rootPkg[$section]);
        }

        /* -----------------------------------------------------------
        * 2) Extra merge from dependencies.txt
        * --------------------------------------------------------- */
        $depFile = $this->path . '/dependencies.txt';
        if ($this->files->exists($depFile)) {

            $runtime = $rootPkg['dependencies']     ?? [];
            $devTime = $rootPkg['devDependencies'] ?? [];

            $devKeywords = ['tailwind', 'typescript', 'eslint', 'vite', 'postcss', '@types/'];

            foreach (preg_split('/\R/', $this->files->get($depFile)) as $raw) {
                $line = trim($raw);
                if ($line === '' || str_starts_with($line, '#')) continue;

                /**
                 * Accept either “pkg@1.0.0”  OR  “pkg  ^1.0.0”
                 *            “@scope/pkg@1.0” OR  “@scope/pkg  1.0.0”
                 */
                if (! preg_match(
                    '/^(@?[\w\-\/]+)\s*(?:@|\s+)\s*([\^\~]?\d[\dA-Za-z\.\-\+]*)$/',
                    $line,
                    $m
                )) {
                    // malformed line → skip
                    continue;
                }

                [$full, $pkg, $ver] = $m;

                $isDev = collect($devKeywords)->first(fn($kw) => str_contains($pkg, $kw)) !== null;

                if ($isDev) {
                    $devTime[$pkg] = $ver;
                } else {
                    $runtime[$pkg] = $ver;
                }
            }

            ksort($runtime);
            ksort($devTime);

            $rootPkg['dependencies']     = $runtime;
            $rootPkg['devDependencies']  = $devTime;
        }

        /* -----------------------------------------------------------
        * 3) Write the combined package.json
        * --------------------------------------------------------- */
        $this->files->put(
            $rootPkgPath,
            json_encode($rootPkg, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL
        );
        $this->console->line('• Merged package.json');

        // remove stub package.json so it doesn’t linger
        if ($this->files->exists($stubPkgPath)) {
            $this->files->delete($stubPkgPath);
        }
    }


    /* ------------------------------------------------------------------ */
    /*  OPTIONAL ADD-ONS                                                  */
    /* ------------------------------------------------------------------ */

    private function maybeAddTailwind(): void
    {
        if (! $this->flags['tailwind']) {
            return;
        }

        $this->files->copyDirectory(__DIR__ . '/stubs/tailwind', base_path());

        $css = $this->path . '/styles.css';
        if ($this->files->exists($css)) {
            $this->files->prepend(
                $css,
                "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n"
            );
        }

        $this->console->line('• TailwindCSS enabled');
    }

    private function maybeAddTypeScript(): void
    {
        if (! $this->flags['typescript']) {
            return;
        }

        $this->files->copy(
            __DIR__ . '/stubs/typescript/tsconfig.json',
            base_path('tsconfig.json')
        );

        // rename ONLY if the JSX version still exists (fresh scaffold)
        $jsx = $this->path . '/main.jsx';
        $tsx = $this->path . '/main.tsx';
        if ($this->files->exists($jsx) && ! $this->files->exists($tsx)) {
            $this->files->move($jsx, $tsx);
        }

        $this->console->line('• TypeScript support added');
    }

    private function maybeAddEslint(): void
    {
        if (! $this->flags['eslint']) {
            return;
        }

        $this->files->copy(
            __DIR__ . '/stubs/eslint/.eslintrc.cjs',
            base_path('.eslintrc.cjs')
        );
        $this->files->copy(
            __DIR__ . '/stubs/eslint/.prettierrc',
            base_path('.prettierrc')
        );

        $this->console->line('• ESLint + Prettier configured');
    }

    private function maybeAddStorybook(): void
    {
        if (! $this->flags['storybook']) {
            return;
        }

        $this->files->copyDirectory(
            __DIR__ . '/stubs/storybook',
            base_path('.storybook')
        );
        $this->console->line('• Storybook scaffolded (run `npm run storybook`)');
    }

    /* ------------------------------------------------------------------ */
    /*  VITE CONFIG                                                        */
    /* ------------------------------------------------------------------ */

    private function updateViteConfig(): void
    {
        $viteConfig = base_path('vite.config.js');
        if (! $this->files->exists($viteConfig) || $this->flags['force']) {
            $this->files->copy(
                __DIR__ . '/stubs/vite/vite.config.js',
                $viteConfig
            );
        }

        $config = $this->files->get($viteConfig);

        /* ── 1. ensure React plugin ──────────────────────────────────── */
        if (! str_contains($config, '@vitejs/plugin-react')) {
            $config = str_replace(
                "import { defineConfig } from 'vite';",
                "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';",
                $config
            );
            $config = preg_replace('/plugins:\s*\[/', 'plugins: [react(),', $config);
        }

        /* ── 2. ensure alias for @ProjectName ────────────────────────── */
        $aliasNeedle = "'@" . $this->projectName . "'";
        if (! str_contains($config, $aliasNeedle)) {
            $replace = "resolve: {\n        alias: [\n            { find: '" .
                $aliasNeedle .
                "', replacement: '/resources/js/{$this->projectName}' },";
            $config  = preg_replace('/resolve:\s*\{[^}]*alias:\s*\[/', $replace, $config);
        }

        /* ── 3. fix input extension (.jsx → .tsx) if required ────────── */
        $config = $this->flags['typescript']
            ? str_replace('.jsx', '.tsx', $config)
            : str_replace('.tsx', '.jsx', $config);

        $config = str_replace(['{{ name }}'], [$this->projectName], $config);
        $this->files->put($viteConfig, $config);
        $this->console->line('• Vite config updated');
    }

    /* ------------------------------------------------------------------ */
    /*  BLADE VIEW                                                         */
    /* ------------------------------------------------------------------ */

    private function publishBladeStub(): void
    {
        $target = resource_path('views/app.blade.php');
        if (! $this->files->exists($target) || $this->flags['force']) {
            $this->files->ensureDirectoryExists(dirname($target));
            $this->files->copy(
                __DIR__ . '/stubs/blade/app.blade.php.stub',
                $target
            );
        }

        // always make sure the entry path inside @vite(...) matches our extension
        $view = $this->files->get($target);
        $view = str_replace(['{{ name }}', '.jsx', '.tsx'], [$this->projectName, '.' . $this->entryExt, '.' . $this->entryExt], $view);
        $this->files->put($target, $view);

        $this->console->line('• Blade view published / updated (views/app.blade.php)');
    }
}
