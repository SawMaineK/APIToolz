<?php
namespace Sawmainek\Apitoolz\Http\Controllers;

use Illuminate\Http\Request;
use Sawmainek\Apitoolz\Http\Requests\UsersRequest;
use Sawmainek\Apitoolz\Services\UsersService;
use Sawmainek\Apitoolz\Http\Resources\UsersResource;
use Sawmainek\Apitoolz\Http\Controllers\APIToolzController;
use Sawmainek\Apitoolz\Models\User;
use Spatie\Permission\Models\Role;

class UsersController extends APIToolzController
{
    protected $usersService;
    public $slug = 'users';


    public function __construct(UsersService $usersService)
    {
        $this->usersService = $usersService;
    }

   /**
     * @OA\Get(
     *     path="/api/users",
     *     summary="Get a list of users with dynamic filtering, sorting, pagination, and advanced search",
     *     tags={"User"},
     *     security={{"apiAuth":{}}},
     *     @OA\Parameter(name="filter", in="query", description="Dynamic filtering with multiple fields (e.g., `status:active|age:gt:30`)", @OA\Schema(type="string")),
     *     @OA\Parameter(name="search", in="query", description="Full-text search (e.g., `keywords`)", @OA\Schema(type="string")),
     *     @OA\Parameter(name="sort_by", in="query", description="Sort the results by a specific field (e.g., `price` or `name`)", @OA\Schema(type="string", example="created_at")),
     *     @OA\Parameter(name="sort_dir", in="query", description="Direction of sorting (asc or desc)", @OA\Schema(type="string", enum={"asc", "desc"}, default="asc")),
     *     @OA\Parameter(name="page", in="query", description="Page number for pagination (default: 1)", @OA\Schema(type="integer", default=1)),
     *     @OA\Parameter(name="per_page", in="query", description="Number of items per page (default: 10)", @OA\Schema(type="integer", default=10)),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/UsersResource")),
     *             @OA\Property(property="meta", type="object",
     *                 @OA\Property(property="current_page", type="integer"),
     *                 @OA\Property(property="per_page", type="integer"),
     *                 @OA\Property(property="total", type="integer"),
     *                 @OA\Property(property="next_page_url", type="string", nullable=true),
     *                 @OA\Property(property="prev_page_url", type="string", nullable=true),
     *                 @OA\Property(property="last_page", type="integer")
     *             )
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $results = $this->usersService->get($request);

        if (!$results) {
            return response()->json(['message' => 'Error fetching users list'], 500);
        }

        if($request->has('aggregate')) {
            return $results;
        }

        return response()->json([
            'data' => UsersResource::collection($results),
            'meta' => [
                'current_page' => $results->currentPage(),
                'per_page' => $results->perPage(),
                'total' => $results->total(),
                'next_page_url' => $results->nextPageUrl(),
                'prev_page_url' => $results->previousPageUrl(),
                'last_page' => $results->lastPage(),
            ]
        ]);
    }


    /**
     * @OA\Post(
     *     path="/api/users",
     *     summary="Store a new users",
     *     tags={"User"},
     *     security={{"apiAuth":{}}},
     *     @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(ref="#/components/schemas/UsersRequest")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="User created successfully",
     *         @OA\JsonContent(ref="#/components/schemas/UsersResource")
     *     )
     * )
     */
    public function store(UsersRequest $request)
    {
        $data = $request->validated();
        if ($request->hasFile('avatar') && $request->file('avatar')->isValid()) {
            $file = $request->file('avatar');
            $filename = date("Ymdhms") . "-" . mt_rand(100000, 999999) . "." . $file->extension();
            $avatar = $file->storeAs('users', $filename);
            $data['avatar'] = $avatar;
        }
        $data['password'] = bcrypt($data['password']);
        $data['is_2fa_enabled'] = $data['is_2fa_enabled'] == 'true' ? 1 : 0;
        $user = $this->usersService->createOrUpdate($data);
        if(isset($data['roles'])) {
            $roles = explode(',', $data['roles']);
            foreach($roles as $roleId) {
                $role = Role::find($roleId);
                if(!$role) {
                    return $this->response("Role not found", 404);
                }
                $user->roles()->attach($role);
            }
        }
        return $this->response(new UsersResource($user), 201);
    }

    /**
     * @OA\Get(
     *     path="/api/users/{id}",
     *     summary="Get a specific users",
     *     tags={"User"},
     *     security={{"apiAuth":{}}},
     *     @OA\Parameter(in="path", name="id", required=true, description="User ID"),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/UsersResource")
     *     )
     * )
     */
    public function show(User $user)
    {
        return $this->response(new UsersResource($user));
    }

    /**
     * @OA\Put(
     *     path="/api/users/{id}",
     *     summary="Update a specific users",
     *     tags={"User"},
     *     security={{"apiAuth":{}}},
     *     @OA\Parameter(in="path", name="id", required=true, description="User ID"),
     *     @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(ref="#/components/schemas/UsersRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="User updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/UsersResource")
     *     )
     * )
     */
    public function update(UsersRequest $request, $id)
    {
        $user = User::findOrFail($id);
        if (!$user) {
            return $this->response("User not found", 404);
        }
        $data = $request->validated();
        if ($request->hasFile('avatar') && $request->file('avatar')->isValid()) {
            $file = $request->file('avatar');
            $filename = date("Ymdhms") . "-" . mt_rand(100000, 999999) . "." . $file->extension();
            $avatar = $file->storeAs('users', $filename);
            $data['avatar'] = $avatar;
        } else {
            unset($data['avatar']);
        }
        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }
        if(isset($data['roles'])) {
            $roles = explode(',', $data['roles']);
            $user->roles()->detach();
            foreach($roles as $roleId) {
                $role = Role::find($roleId);
                if(!$role) {
                    return $this->response("Role not found", 404);
                }
                $user->roles()->attach($role);
            }
        }
        if (isset($data['is_2fa_enabled'])) {
            $data['is_2fa_enabled'] = $data['is_2fa_enabled'] == 'true' ? 1 : 0;
        } else {
            unset($data['is_2fa_enabled']);
        }
        $updatedUsers = $this->usersService->update($user, $data);
        return $this->response(new UsersResource($updatedUsers));
    }

    /**
     * @OA\Delete(
     *     path="/api/users/{id}",
     *     summary="Delete a users",
     *     tags={"User"},
     *     security={{"apiAuth":{}}},
     *     @OA\Parameter(in="path", name="id", required=true, description="User ID"),
     *     @OA\Response(
     *         response=204,
     *         description="User deleted successfully"
     *     )
     * )
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $this->usersService->delete($user);
        return $this->response("The record has been deleted successfully.", 204);
    }

    /**
     * @OA\Put(
     *     path="/api/users/{id}/restore",
     *     summary="Restore a deleted users",
     *     tags={"User"},
     *     security={{"apiAuth":{}}},
     *     @OA\Parameter(in="path", name="id", required=true, description="User ID"),
     *     @OA\Response(
     *         response=200,
     *         description="User restored successfully",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="message",
     *                 type="string",
     *                 example="The record has been restored successfully."
     *             )
     *         )
     *     )
     * )
     */
    public function restore($id)
    {
        $this->usersService->restore($id);
        return $this->response("The record has been restored successfully.");
    }

    /**
     * @OA\Delete(
     *     path="/api/users/{id}/force-destroy",
     *     summary="Permanently delete a users",
     *     tags={"User"},
     *     security={{"apiAuth":{}}},
     *     @OA\Parameter(in="path", name="id", required=true, description="User ID"),
     *     @OA\Response(
     *         response=204,
     *         description="User permanently deleted"
     *     )
     * )
     */
    public function forceDestroy($id)
    {
        $this->usersService->forceDelete($id);
        return $this->response("The record has been permanently deleted.", 204);
    }
}
