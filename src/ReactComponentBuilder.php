<?php
namespace Sawmainek\Apitoolz;

use Illuminate\Support\Facades\Artisan;
use OpenAI\Laravel\Facades\OpenAI;

class ReactComponentBuilder
{
    public static function buildComponentsFromBRS(string $brsText, string $projectName, $themeColor = 'blue', $ts = false, $force = false, $rollback = 0): array
    {
        $response = APIToolzGenerator::madeReactApp(
            project: $projectName,
            theme: $themeColor,
            prompt: $brsText,
            ts: $ts,
            f: $force,
            rollback: $rollback
        );
        $appFiles = self::extractFilesFromMarkdown($response);
        self::extractArtisanCmdAndRun($response);
        return $appFiles;
    }

    static function extractFilesFromMarkdown(string $markdown): array
    {
        $files = [];

        // Match: /path/to/file\n```lang\n<code>\n```
        $pattern = '/^\/([^\n]+)\n```[a-zA-Z0-9]*\s*\n(.*?)```/ms';

        if (preg_match_all($pattern, $markdown, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $filePath = trim($match[1]);  // E.g. Ecommere/theme.ts
                $code     = trim($match[2]);  // Code inside the block
                $files[$filePath] = $code;
            }
        }

        return $files;
    }

    static function extractArtisanCmdAndRun(string $markdown): void
    {
        // 1️⃣ Grab the contents of every fenced bash block: ```bash … ```
        if (!preg_match_all('/```bash\s+([\s\S]*?)```/i', $markdown, $blocks)) {
            return; // nothing to run
        }

        foreach ($blocks[1] as $block) {
            $block = trim($block);

            // Ignore empty blocks
            if ($block === '') {
                continue;
            }

            // 2️⃣ We only care if the first non-blank line starts with `php artisan`
            $firstLine = strtok($block, "\r\n");
            $firstLine = ltrim($firstLine);

            if (str_starts_with($firstLine, 'php artisan')) {
                $command  = $block;                      // full multiline command
                echo $command . PHP_EOL . PHP_EOL;      // show what we’re about to run

                // Strip the leading `php artisan ` before handing to Artisan::call()
                $artisanCommand = substr($command, strlen('php artisan '));

                // 3️⃣ Execute the command
                try {
                    Artisan::call($artisanCommand);
                } catch (\Throwable $e) {
                    // 4️⃣ Log the error but DON’T abort the loop
                    echo "Command failed: {$artisanCommand}". PHP_EOL;
                    echo "   ↳ {$e->getMessage()}" . PHP_EOL . PHP_EOL;
                    // continue to next command
                }
            }
        }
    }
}
