<?php
namespace Sawmainek\Apitoolz\Services;

use Sawmainek\Apitoolz\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RoleService
{
    public function get(Request $request)
    {
        $query = Role::filter($request);
        if($request->has('aggregate')) {
            return $query;
        }

        $perPage = $request->query('per_page', 10);
        return $query->paginate($perPage);
    }

    public function createOrUpdate(array $data)
    {
        Log::info('Creating or updating a role', ['data' => $data]);

        if (isset($data['id'])) {
            return Role::updateOrCreate(['id' => $data['id']], $data);
        }

        // If no id, create a new role
        return Role::create($data);
    }

    public function update(Role $role, array $data)
    {
        Log::info('Updating role', ['id' => $role->id, 'data' => $data]);
        $role->update($data);
        return $role;
    }

    public function delete(Role $role)
    {
        Log::info('Deleting role', ['id' => $role->id]);
        $role->delete();
    }

    public function restore($id)
    {
        Log::info('Restoring role', ['id' => $id]);
        $role = Role::withTrashed()->findOrFail($id);
        $role->restore();
    }

    public function forceDelete($id)
    {
        Log::info('Permanently deleting role', ['id' => $id]);
        $role = Role::withTrashed()->findOrFail($id);
        $role->forceDelete();
    }
}
