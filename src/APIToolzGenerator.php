<?php

namespace Sawmainek\Apitoolz;

class APIToolzGenerator
{
    public static function blend($str, $data)
    {
        self::verifyValitation();
        $response = \Http::retry(3, 100)->post(config('apitoolz.host').'/apps/v1/blend', [
            'tpl' => $str,
            'codes' => json_encode($data),
            'key' => config('apitoolz.activated_key')
        ]);
        if($response->failed()) {
            switch ($response->status()) {
                case 400:
                case 419:
                    echo "{$response->body()}\n";
                    echo "Abort...\n";
                    dd();
                    break;
                default:
                    echo "{$response->body()}\n";
                    echo "Abort...\n";
                    dd();
                    break;
            }
        }
        if($response->successful()) {
            return $response->body();
        }
    }

    public static function ask($prompt, $tags = [], $onlyContent = false, $output = 'md')
    {
        self::verifyValitation();
        $response = \Http::post(config('apitoolz.host').'/apps/ask', [
            'prompt' => $prompt,
            'tags' => $tags,
            'only_content' => $onlyContent,
            'output' => $output,
            'key' => config('apitoolz.activated_key')
        ]);
        if($response->failed()) {
            switch ($response->status()) {
                case 400:
                case 419:
                    echo "{$response->body()}\n";
                    echo "Abort...\n";
                    dd();
                    break;
                default:
                    echo "{$response->body()}\n";
                    echo "Abort...\n";
                    dd();
                    break;
            }
        }
        if($response->successful()) {
            return json_decode($response->body());
        }
    }

    public static function madePlan($prompt, $id = null)
    {
        self::verifyValitation();
        if($id) {
            if($prompt == '') {
                $response = \Http::get(config('apitoolz.host').'/api/madeplan/'.$id, [
                    'problem' => $prompt,
                    'owner' => config('apitoolz.activated_key')
                ]);
            } else {
                $response = \Http::post(config('apitoolz.host').'/api/madeplan/'.$id, [
                    'id' => $id,
                    '_method' => 'PUT',
                    'next' => $prompt,
                    'owner' => config('apitoolz.activated_key')
                ]);
            }

        } else {
            if($prompt == '') {
                return "Please provide a problem description.\n";
            }
            $response = \Http::post(config('apitoolz.host').'/api/madeplan', [
                'problem' => $prompt,
                'owner' => config('apitoolz.activated_key')
            ]);
        }

        if($response->failed()) {
            switch ($response->status()) {
                case 400:
                case 419:
                    echo "{$response->body()}\n";
                    echo "Abort...\n";
                    return $response->body();
                default:
                    echo "{$response->body()}\n";
                    echo "Abort...\n";
                    return $response->body();
            }
        }
        if($response->successful()) {
            if($prompt == 'Generate models for this plan') {
                $result = json_decode($response->body(), true);

                // Save raw_model_bash to a temp file
                $tempFile = storage_path('app/create_model_cmd.txt');
                file_put_contents($tempFile, $result['raw_model_bash']);

                // Run another PHP process in the background
                $phpBinary = PHP_BINARY; // path to PHP
                $artisanPath = base_path('artisan');
                $cmd = "{$phpBinary} {$artisanPath} apitoolz:create-models {$tempFile} > /dev/null 2>&1 &";

                exec($cmd);
            }
            return json_decode($response->body());
        }
    }

    public static function askReact($project, $prompt, $theme, $ts, $f, $rollback)
    {
        self::verifyValitation();
        $response = \Http::timeout(180)->post(config('apitoolz.host').'/apps/ask-react', [
            'project' => $project,
            'theme' => $theme,
            'prompt' => $prompt,
            'ts' => $ts,
            'use_histories' => $f ? 0 : 1,
            'rollback' => $rollback,
            'key' => config('apitoolz.activated_key')
        ]);
        if($response->failed()) {
            switch ($response->status()) {
                case 400:
                case 419:
                    echo "{$response->body()}\n";
                    echo "Abort...\n";
                    dd();
                    break;
                default:
                    echo "{$response->body()}\n";
                    echo "Abort...\n";
                    dd();
                    break;
            }
        }
        if($response->successful()) {
            return json_decode($response->body());
        }
    }

    static function publishTemplate($name, $desc, $path) {
        self::verifyValitation();
        // Log the start of the upload
        echo "Uploading template file: " . basename($path) . "...\n";

        $response = \Http::attach(
            'file',
            file_get_contents($path),
            basename($path)
        )->post(config('apitoolz.host').'/apps/templates', [
            'name' => $name,
            'type' => 'form',
            'description' => $desc ?? '',
            'is_free' => true,
            'access_level' => 'free',
            'key' => config('apitoolz.activated_key')
        ]);

        // Log the response status
        echo "Upload response status: " . $response->status() . "\n";

        if($response->failed()) {
            echo "Upload failed: {$response->body()}\n";
            echo "Abort...\n";
            dd();
        }

        if($response->successful()) {
            echo "Upload successful.\n";
            return json_decode($response->body());
        }
    }

    static function downloadTemplate($templateId) {
        self::verifyValitation();

        $response = \Http::get(config('apitoolz.host') . '/apps/templates/' . $templateId . '/download', [
            'key' => config('apitoolz.activated_key')
        ]);

        if ($response->failed()) {
            echo "Download failed: {$response->body()}\n";
            echo "Abort...\n";
            dd();
        }

        if ($response->successful()) {
            // Save the file to disk
            $disposition = $response->header('Content-Disposition');
            $filename = "template_{$templateId}.zip";
            if (preg_match('/filename="?([^"]+)"?/', $disposition, $matches)) {
                $filename = $matches[1];
            }
            $storagePath = storage_path("apitoolz/imports/{$filename}");
            if (!is_dir(dirname($storagePath))) {
                mkdir(dirname($storagePath), 0755, true);
            }
            file_put_contents($storagePath, $response->body());
            echo "Template downloaded as {$storagePath}\n";
            return $storagePath;
        }
    }

    static function verifyValitation() {
        if(config('apitoolz.host') == '') {
            echo "Please define APITOOLZ_HOST= in env.\n";
            echo "Abort...\n";
            dd();
        }
        if(config('apitoolz.purchase_key') == '') {
            echo "Please define APITOOLZ_PURCHASE_KEY= in env.\n";
            echo "Abort...\n";
            dd();
        }
        if(config('apitoolz.activated_key') == '') {
            echo "Please define APITOOLZ_ACTIVATED_KEY= in env.\n";
            echo "Abort...\n";
            dd();
        }
    }
}
