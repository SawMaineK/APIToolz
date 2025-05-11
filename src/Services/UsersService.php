<?php
namespace Sawmainek\Apitoolz\Services;
use Sawmainek\Apitoolz\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UsersService
{
    public function get(Request $request)
    {
        $query = User::filter($request);

        if($request->has('aggregate')) {
            return $query;
        }
        $perPage = $request->query('per_page', 10);
        return $query->paginate($perPage);
    }

    public function createOrUpdate(array $data)
    {
        Log::info('Creating or updating a users', ['data' => $data]);

        if (isset($data['id'])) {
            return User::updateOrCreate(['id' => $data['id']], $data);
        }

        // If no id, create a new users
        return User::create($data);
    }

    public function update(User $users, array $data)
    {
        Log::info('Updating users', ['id' => $users->id, 'data' => $data]);
        $users->update($data);
        return $users;
    }

    public function delete(User $user)
    {
        Log::info('Deleting users', ['id' => $user->id]);
        $user->delete();
    }

    public function restore($id)
    {
        Log::info('Restoring users', ['id' => $id]);
        $users = User::withTrashed()->findOrFail($id);
        $users->restore();
    }

    public function forceDelete($id)
    {
        Log::info('Permanently deleting users', ['id' => $id]);
        $users = User::withTrashed()->findOrFail($id);
        $users->forceDelete();
    }
}
