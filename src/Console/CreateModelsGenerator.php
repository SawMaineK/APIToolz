<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;

class CreateModelsGenerator extends Command
{
    protected $signature = 'apitoolz:create-models {file}';
    protected $description = 'Run extractArtisanCmdAndRun asynchronously';

    public function handle()
    {
        $file = $this->argument('file');
        if (!file_exists($file)) {
            $this->error("Temp file not found!");
            return;
        }

        $rawBash = file_get_contents($file);

        // Run your existing method
        self::extractArtisanCmdAndRun($rawBash);

        // Optionally delete the temp file
        unlink($file);

        $this->info("✅ Finished running artisan model commands!");
    }

    static function extractArtisanCmdAndRun(string $markdown): void
    {
        // 1️⃣ Find all fenced bash blocks: ```bash … ```
        if (!preg_match_all('/```bash\s+([\s\S]*?)```/i', $markdown, $blocks)) {
            return; // no bash blocks found
        }

        foreach ($blocks[1] as $block) {
            $block = trim($block);
            if ($block === '') continue;

            // 2️⃣ Split the block into separate php artisan commands
            // We look for lines starting with "php artisan" and capture everything until the next "php artisan" OR end of block
            preg_match_all('/(php artisan[\s\S]*?)(?=(?:\nphp artisan|$))/i', $block, $commands);

            foreach ($commands[1] as $command) {
                $command = trim($command);
                if ($command === '') continue;

                \Log::info("➡ Running: {$command}");

                // Strip the leading php artisan (keep the rest intact)
                $artisanCommand = preg_replace('/^php artisan\s+/', '', $command);

                try {
                    \Artisan::call($artisanCommand);
                    \Log::info("✅ Success\n\n");
                } catch (\Throwable $e) {
                    \Log::error("❌ Command failed: {$artisanCommand}");
                    \Log::error("   ↳ {$e->getMessage()}");
                }
            }
        }
    }
}
