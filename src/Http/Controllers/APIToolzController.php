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

    public function makePageInfo($id)
    {
        $info = Page::where('id', $id)->first();
        $info->config = ModelConfigUtils::decryptJson($info->config);
        return $info;
    }

    public function makeResponse($result)
    {
        $data['data'] = $result['data'];
        $data['per_page'] = $result['per_page'];
        $data['current_page'] = $result['current_page'];
        $data['previous_page'] = $result['from'];
        $data['next_page'] = $result['to'];
        $data['total'] = $result['total'];
        return $data;
    }

    public function validateData(Request $request)
    {
        $data = $request->all();
        $form = $this->info->config['forms'];
        foreach ($form as $f) {
            if ($f['type'] == 'password') {
                if (!empty($data[$f['field']])) {
                    $data[$f['field']] = bcrypt($data[$f['field']]);
                }
            }
            if ($f['type'] == 'file' && $request->hasFile($f['field'])) {
                if ($f['file']['image_multiple']) {
                    foreach ($request->file($f['field']) as $file) {
                        if (!$file->isValid()) {
                            return false;
                        }
                    }
                    $data[$f['field']] = $this->saveAsFile($request->file($f['field']), $f['file']);
                    // merge old images with new image files
                    if(isset($data[$this->info['key']])) {
                        $model = $this->model->find($data[$this->info['key']]);
                        if($model) {
                            $data[$f['field']] = array_merge($data[$f['field']] ?? [], $model->{$f['field']} ?? []);
                        }
                    }
                } else {
                    if ($request->file($f['field'])->isValid()) {
                        $data[$f['field']] = (object) $this->saveAsFile($request->file($f['field']), $f['file']);
                        //delete old image file
                        if(isset($data[$this->info['key']]) && isset($data[$f['field']])) {
                            $model = $this->model->find($data[$this->info['key']]);
                            if ($model && $model->{$f['field']}) {
                                if($f['file']['save_full_path'] == "1") {
                                    $deletePath = str_replace(url('/img'), '', $model->{$f['field']}->url);
                                    Storage::delete($deletePath);
                                } else {
                                    Storage::delete($model->{$f['field']}->url);
                                }
                            }
                        }
                    }
                }
            }
            if ($f['cast'] == 'boolean' && isset($data[$f['field']]) && $data[$f['field']] != null) {
                $data[$f['field']] = $data[$f['field']] == 'true' ? true : false;
            }
            if ($f['cast'] == 'object' && isset($data[$f['field']]) && $data[$f['field']] != null) {
                $data[$f['field']] = is_object($data[$f['field']]) || is_array($data[$f['field']]) ? $data[$f['field']] : json_decode($data[$f['field']]);
            }
            if ($f['cast'] == 'array' && isset($data[$f['field']]) && $data[$f['field']] != null) {
                $data[$f['field']] = is_array($data[$f['field']]) ? $data[$f['field']] : json_decode($data[$f['field']], true);
            }
        }
        return $data;
    }

    public function getAccessLimit()
    {
        $limits = [];
        if($this->info['auth'] && isset($this->info['config']['access'])) {
            foreach ($this->info['config']['access'] as $role => $task) {
                if(request()->user() && request()->user()->hasRole($role) && @$task['limit']) {
                    $limits[] = Str::of($task['limit'])->replace('{$user->id}', request()->user()->id ?? null);
                }
            }
            return implode('|', $limits);
        }
        return null;
    }

    public function saveAsFile($file, $option)
    {
        if ($option['image_multiple']) {
            if (is_array($file) && count($file) > 0) {
                $files = [];
                foreach ($file as $f) {
                    $filename = date("Ymdhms") . "-" . mt_rand(100000, 999999) . "." . $f->extension();
                    $destFolder = Str::slug(env('FILESYSTEM_PREFIX', 'APIToolz'));
                    $storeFilePath = $destFolder . '/' . $option['path_to_upload'];
                    $path = $f->storeAs($storeFilePath, $filename);
                    $saveAsFile['name'] = $f->getClientOriginalName();
                    $saveAsFile['type'] = $f->getMimeType();
                    $saveAsFile['size'] = $f->getSize();
                    if ($option['upload_type'] == 'image') {
                        $saveAsFile['url'] = $option['save_full_path'] ? url("img/{$path}") : $path;
                    } else {
                        $saveAsFile['url'] = $option['save_full_path'] ? url("files/{$path}") : $path;
                    }
                    $files[] = $saveAsFile;
                }
                return $files;
            }
        } else {
            $filename = date("Ymdhms") . "-" . mt_rand(100000, 999999) . "." . $file->extension();
            $destFolder = Str::slug(env('FILESYSTEM_PREFIX', ''));
            $storeFilePath = $destFolder . '/' . $option['path_to_upload'];
            $path = $file->storeAs($storeFilePath, $filename);
            $saveAsFile['name'] = $file->getClientOriginalName();
            $saveAsFile['type'] = $file->getMimeType();
            $saveAsFile['size'] = $file->getSize();
            if ($option['upload_type'] == 'image') {
                $saveAsFile['url'] = $option['save_full_path'] ? url("img/{$path}") : $path;
            } else {
                $saveAsFile['url'] = $option['save_full_path'] ? url("files/{$path}") : $path;
            }
            return $saveAsFile;
        }
    }

    public function uploadFile(Request $request)
    {
        $option = [];
        $maxFileSize = 1024 * 10; //100MB
        $request->validate([
            'files' => "required|mimes:jpg,jpeg,png,bmp,gif,csv,txt,xlx,xls,pdf,mp3,mp4|max:{$maxFileSize}"
        ]);
        if($request->file('files') && $request->file('files')->isValid()) {
            $option['image_multiple'] = is_array($request->file('files')) ? true : false;
            $option['upload_type'] = 'file';
            $option['save_full_path'] = false;
            $option['path_to_upload'] = 'raws';

            $files = $this->saveAsFile($request->file('files'), $option);
            $files['id'] = $request->id;
            return $this->response($files);
        }

    }

    public function deleteFile($path)
    {
        Storage::delete($path);
        return $this->response(['message' => 'Successfully deleted file.']);
    }

    public function removeFile(Request $request)
    {
        $form = $this->info->config['forms'];
        foreach ($form as $f) {
            if($f['field'] == $request->field) {
                $model = $this->model->find($request->{$this->info['key']});
                if ($model && $f['cast'] == 'array' && is_array($model->{$request->field})) {
                    $leftimg = [];
                    foreach ($model->{$request->field} as $img) {
                        if($img['url'] == $request->path) {
                            $deletePath = str_replace(url('/img'), '', $img['url']);
                            Storage::delete($deletePath);
                        } else {
                            $leftimg[] = $img;
                        }
                    }
                    $model->{$request->field} = $leftimg;
                    $model->save();
                } elseif( $model && $f['cast'] != 'array' && $model->{$request->field}) {
                    $deletePath = str_replace(url('/img'), '', $request->path);
                    if($deletePath) {
                        Storage::delete($deletePath);
                        $model->{$request->field} = null;
                        $model->save();
                    }
                }
            }
        }
        return $this->response("The file has deleted successfully.", 204);
    }

    public function copyRecord($id)
    {
        $data = $this->model->find($id);
        if($data) {
            unset($data->{$this->info['key']});
            $data = $this->model->create($data->toarray());
        }
        return $this->response($data);
    }

    public function lookUpDataList(Request $request)
    {
        if ($request->parent_id) {
            $list = $this->model->where($request->parent_id, $request->parent_value)->pluck($request->param1, $request->param2);
        } else {
            $list = $this->model->pluck($request->param1, $request->param2);
        }
        return response()->json($list);
    }

    public function bulkImport(Request $request)
    {
        $bulk = $request->all();
        foreach ($bulk as $data) {
            if (isset($data[$this->info['key']])) {
                $model = $this->model->find($data[$this->info['key']]);
                $model->update($data);
            } else {
                $this->model->create($data);
            }
        }
        return $this->response("The bulk data has created successfully.", 204);
    }

    function skipFields($field)
    {
        if ($field == 'id' || $field == 'created_at' || $field == 'updated_at' || $field == 'deleted_at') {
            return false;
        }
        return true;
    }
}
