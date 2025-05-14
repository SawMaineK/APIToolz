<?php
namespace Sawmainek\Apitoolz\Services;

use Sawmainek\Apitoolz\Models\AppSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AppSettingService
{
    public function get(Request $request)
    {
        $query = AppSetting::filter($request);
        if($request->has('aggregate')) {
            return $query;
        }

        $perPage = $request->query('per_page', 10);
        return $query->paginate($perPage);
    }

    public function createOrUpdate(array $data)
    {
        Log::info('Creating or updating a appSetting', ['data' => $data]);

        if (isset($data['id'])) {
            return AppSetting::updateOrCreate(['id' => $data['id']], $data);
        }

        // If no id, create a new appSetting
        return AppSetting::create($data);
    }

    public function update(AppSetting $appSetting, array $data)
    {
        Log::info('Updating appSetting', ['id' => $appSetting->id, 'data' => $data]);
        $appSetting->update($data);
        return $appSetting;
    }

    public function delete(AppSetting $appSetting)
    {
        Log::info('Deleting appSetting', ['id' => $appSetting->id]);
        $appSetting->delete();
    }

    public function restore($id)
    {
        Log::info('Restoring appSetting', ['id' => $id]);
        $appSetting = AppSetting::withTrashed()->findOrFail($id);
        $appSetting->restore();
    }

    public function forceDelete($id)
    {
        Log::info('Permanently deleting appSetting', ['id' => $id]);
        $appSetting = AppSetting::withTrashed()->findOrFail($id);
        $appSetting->forceDelete();
    }
}
