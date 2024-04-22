<?php

namespace Sawmainek\Apitoolz\Http\Controllers;

use Illuminate\Contracts\Filesystem\Filesystem;
use Sawmainek\Apitoolz\Factory\LaravelResponseFactory;
use League\Glide\ServerFactory;

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
        $tempUrl = \Storage::temporaryUrl(
            $url, now()->addMinutes(5)
        );
        return response()->json($tempUrl);
    }

}
