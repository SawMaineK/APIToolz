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

    public static function ask($prompt, $tags = [], $onlyContent = false)
    {
        self::verifyValitation();
        $response = \Http::post(config('apitoolz.host').'/apps/ask', [
            'prompt' => $prompt,
            'tags' => $tags,
            'only_content' => $onlyContent,
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
