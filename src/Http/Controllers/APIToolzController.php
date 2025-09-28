<?php

namespace Sawmainek\Apitoolz\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\Facades\ModelConfigUtils;

/**
 * @OA\Info(title="API Documentation", version="0.1")
 * @OA\SecurityScheme(
 *     securityScheme="apiAuth",
 *     type="http",
 *     description="Login with email and password to get the authentication token",
 *     name="Token Based Authentication",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 */

class APIToolzController extends Controller
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    protected $info;
    protected $model;
    protected $slug;

    public function __construct()
    {
        // You may want to set $this->info and $this->model here,
        // or in each method before they are used.
        // Example:
        // $this->info = Model::where('slug', request()->route('slug'))->first();
        // $this->model = app($this->info->model_class ?? Model::class);
    }

    public function response($result, $code = 200)
    {
        switch ($code) {
            case 400:
                $response['code'] = $code;
                $response['message'] = "There is something wrong in your request.";
                if (is_string($result)) {
                    $response['error']['general'] = $result;
                } else {
                    if(is_array($result)) {
                        $response = $result;
                    } else {
                        foreach ($result->toArray() as $key => $error) {
                            $response['error'][$key] = $error[0];
                        }
                    }
                }
                break;

            case 204:
                $response['code'] = $code;
                $response['message'] = $result;
                $code = 200;
                break;

            default:
                //TODO: transform response body
                $response = $result;
                break;
        }
        return response()->json($response, $code);
    }

    public function makeInfo()
    {
        $info = Model::where('slug', $this->slug)->first();
        $info->config = ModelConfigUtils::decryptJson($info->config);
        return $info;
    }

    public function validateData(Request $request)
    {
        $data = $request->all();
        $form = $this->info->config['forms'];

        foreach ($form as $f) {
            // Password handling
            if ($f['type'] === 'password') {
                if (!empty($data[$f['field']])) {
                    $data[$f['field']] = bcrypt($data[$f['field']]);
                } else {
                    unset($data[$f['field']]);
                }
            }

            // File handling
            if ($f['type'] === 'file' && $request->hasFile($f['field'])) {
                $uploadedFile = $request->file($f['field']);
                $fileOption = $f['file'] ?? [];

                // Normalize to array for multiple/single files
                $files = is_array($uploadedFile) ? $uploadedFile : [$uploadedFile];

                // Validate each file
                $acceptFiles = $fileOption['acceptFiles'] ?? [];
                foreach ($files as $file) {
                    if (!$file->isValid()) {
                        return false;
                    }
                    if ($acceptFiles && !in_array($file->extension(), $acceptFiles)) {
                        return false;
                    }
                }

                $fileOption['image_multiple'] = $fileOption['image_multiple'] ?? is_array($uploadedFile);
                $fileOption['path_to_upload'] = $fileOption['path_to_upload'] ?? 'uploads';
                $fileOption['upload_type'] = $fileOption['upload_type'] ?? 'file';
                $fileOption['save_full_path'] = !empty($fileOption['save_full_path']);

                $savedFiles = $this->saveAsFile($uploadedFile, $fileOption);

                // Merge with old files if multiple
                if ($fileOption['image_multiple'] && isset($data[$this->info['key']])) {
                    $model = $this->model->find($data[$this->info['key']]);
                    if ($model) {
                        $savedFiles = array_merge($savedFiles, $model->{$f['field']} ?? []);
                    }
                }

                $data[$f['field']] = $fileOption['image_multiple'] ? $savedFiles : (object) $savedFiles;

                // Delete old single file if replacing
                if (!$fileOption['image_multiple'] && isset($data[$this->info['key']])) {
                    $model = $this->model->find($data[$this->info['key']]);
                    if ($model && $model->{$f['field']}?->url) {
                        $oldPath = str_replace(url('/'), '', $model->{$f['field']}->url);
                        Storage::delete($oldPath);
                    }
                }
            }

            // Casting fields
            if ($f['cast'] === 'boolean' && isset($data[$f['field']])) {
                $data[$f['field']] = filter_var($data[$f['field']], FILTER_VALIDATE_BOOLEAN);
            }

            if (($f['cast'] === 'array' || $f['cast'] === 'object') && isset($data[$f['field']])) {
                $data[$f['field']] = is_array($data[$f['field']]) || is_object($data[$f['field']])
                    ? $data[$f['field']]
                    : json_decode($data[$f['field']], $f['cast'] === 'array');
            }
        }

        return $data;
    }

    public function saveAsFile($file, array $option)
    {
        if (!$file) return null;

        $destFolder = Str::slug(env('FILESYSTEM_PREFIX', 'APIToolz'));
        $storeFilePath = $destFolder . '/' . ($option['path_to_upload'] ?? 'uploads');
        $uploadType = $option['upload_type'] ?? 'file';
        $saveFullPath = !empty($option['save_full_path']);

        $filesToProcess = is_array($file) ? $file : [$file];
        $results = [];

        foreach ($filesToProcess as $f) {
            $filename = date("YmdHis") . "-" . mt_rand(100000, 999999) . "." . $f->extension();
            $path = $f->storeAs($storeFilePath, $filename, env('FILESYSTEM_DISK', 'public'));

            $fileData = [
                'name' => $f->getClientOriginalName(),
                'type' => $f->getMimeType(),
                'size' => $f->getSize(),
                'url' => ($uploadType === 'image')
                    ? ($saveFullPath ? Storage::url($path) : $path)
                    : ($saveFullPath ? Storage::url($path) : $path),
            ];

            $results[] = $fileData;
        }

        return $option['image_multiple'] ? $results : $results[0];
    }

}
