<?php

namespace Sawmainek\Apitoolz\Http\Controllers;

use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Http\Request;
use Sawmainek\Apitoolz\Factory\LaravelResponseFactory;
use League\Glide\ServerFactory;
use Storage;

class FileStorageController extends APIToolzController
{

    public function image(Filesystem $filesystem, $path)
    {
        $server = ServerFactory::create([
            'response' => new LaravelResponseFactory(app('request')),
            'source' => $filesystem->getDriver(),
            'cache' => $filesystem->getDriver(),
            'cache_path_prefix' => '.cache',
            'base_url' => 'img',
        ]);

        return $server->getImageResponse($path, request()->except(['expires', 'signature']));
    }

    public function file(Request $request, $url)
    {
        $url = ltrim($url, '/'); // normalize path

        $disk = config('filesystems.default'); // current default disk

        // If S3 or cloud disk, generate temporary URL
        if (in_array($disk, ['s3', 's3-other'])) { // add your cloud disks here
            try {
                $tempUrl = Storage::disk($disk)->temporaryUrl($url, now()->addMinutes(5));
                return redirect()->away($tempUrl);
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Unable to generate temporary URL: ' . $e->getMessage()
                ], 500);
            }
        }

        // If local disk (public or local), serve file directly
        if (Storage::disk('public')->exists($url)) {
            return Storage::disk('public')->download($url);
        }

        if (Storage::disk('local')->exists($url)) {
            return Storage::disk('local')->download($url);
        }

        return response()->json([
            'message' => 'File not found.'
        ], 404);
    }

}
