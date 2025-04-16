<?php
namespace Sawmainek\Apitoolz\Http\Controllers;

use Sawmainek\Apitoolz\Models\Role;
use Sawmainek\Apitoolz\Http\Requests\RoleRequest;
use Sawmainek\Apitoolz\Services\RoleService;
use Sawmainek\Apitoolz\Http\Resources\RoleResource;
use Illuminate\Http\Request;
use Sawmainek\Apitoolz\Http\Controllers\APIToolzController;

class RoleController extends APIToolzController
{
    protected $roleService;
    public $slug = 'role';


    public function __construct(RoleService $roleService)
    {
        $this->roleService = $roleService;
    }

   /**
     * @OA\Get(
     *     path="/api/role",
     *     summary="Get a list of role with dynamic filtering, sorting, pagination, and advanced search",
     *     tags={"Role"},
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
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/RoleResource")),
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
        $results = $this->roleService->get($request);

        if (!$results) {
            return response()->json(['message' => 'Error fetching role list'], 500);
        }

        if($request->has('aggregate')) {
            return $results;
        }

        return response()->json([
            'data' => RoleResource::collection($results),
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
     *     path="/api/role",
     *     summary="Store a new role",
     *     tags={"Role"},
     *     security={{"apiAuth":{}}},
     *     @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(ref="#/components/schemas/RoleRequest")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Role created successfully",
     *         @OA\JsonContent(ref="#/components/schemas/RoleResource")
     *     )
     * )
     */
    public function store(RoleRequest $request)
    {
        $role = $this->roleService->createOrUpdate($request->validated());
        return $this->response(new RoleResource($role), 201);
    }

    /**
     * @OA\Get(
     *     path="/api/role/{id}",
     *     summary="Get a specific role",
     *     tags={"Role"},
     *     security={{"apiAuth":{}}},
     *     @OA\Parameter(in="path", name="id", required=true, description="Role ID"),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/RoleResource")
     *     )
     * )
     */
    public function show(string $id)
    {
        $role = Role::findOrFail($id);
        if (!$role) {
            return $this->response("Role not found", 404);
        }
        return $this->response(new RoleResource($role));
    }

    /**
     * @OA\Put(
     *     path="/api/role/{id}",
     *     summary="Update a specific role",
     *     tags={"Role"},
     *     security={{"apiAuth":{}}},
     *     @OA\Parameter(in="path", name="id", required=true, description="Role ID"),
     *     @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(ref="#/components/schemas/RoleRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Role updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/RoleResource")
     *     )
     * )
     */
    public function update(RoleRequest $request, string $id)
    {
        $role = Role::findOrFail($id);
        if (!$role) {
            return $this->response("Role not found", 404);
        }
        $updatedRole = $this->roleService->update($role, $request->validated());
        return $this->response(new RoleResource($updatedRole));
    }

    /**
     * @OA\Delete(
     *     path="/api/role/{id}",
     *     summary="Delete a role",
     *     tags={"Role"},
     *     security={{"apiAuth":{}}},
     *     @OA\Parameter(in="path", name="id", required=true, description="Role ID"),
     *     @OA\Response(
     *         response=204,
     *         description="Role deleted successfully"
     *     )
     * )
     */
    public function destroy(string $id)
    {
        $role = Role::findOrFail($id);
        if (!$role) {
            return $this->response("Role not found", 404);
        }
        $this->roleService->delete($role);
        return $this->response("The record has been deleted successfully.", 204);
    }

    /**
     * @OA\Put(
     *     path="/api/role/{id}/restore",
     *     summary="Restore a deleted role",
     *     tags={"Role"},
     *     security={{"apiAuth":{}}},
     *     @OA\Parameter(in="path", name="id", required=true, description="Role ID"),
     *     @OA\Response(
     *         response=200,
     *         description="Role restored successfully",
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
    public function restore(string $id)
    {
        $this->roleService->restore($id);
        return $this->response("The record has been restored successfully.");
    }

    /**
     * @OA\Delete(
     *     path="/api/role/{id}/force-destroy",
     *     summary="Permanently delete a role",
     *     tags={"Role"},
     *     security={{"apiAuth":{}}},
     *     @OA\Parameter(in="path", name="id", required=true, description="Role ID"),
     *     @OA\Response(
     *         response=204,
     *         description="Role permanently deleted"
     *     )
     * )
     */
    public function forceDestroy(string $id)
    {
        $this->roleService->forceDelete($id);
        return $this->response("The record has been permanently deleted.", 204);
    }
}
