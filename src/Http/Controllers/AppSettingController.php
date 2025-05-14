<?php
namespace Sawmainek\Apitoolz\Http\Controllers;

use Sawmainek\Apitoolz\Models\AppSetting;
use Sawmainek\Apitoolz\Http\Requests\AppSettingRequest;
use Sawmainek\Apitoolz\Services\AppSettingService;
use Illuminate\Http\Request;
use Sawmainek\Apitoolz\Http\Resources\AppSettingResource;
use Sawmainek\Apitoolz\Http\Controllers\APIToolzController;

class AppSettingController extends APIToolzController
{
    protected $appSettingService;
    public $slug = 'appsetting';


    public function __construct(AppSettingService $appSettingService)
    {
        $this->appSettingService = $appSettingService;
    }

   /**
     * @OA\Get(
     *     path="/api/appsetting",
     *     summary="Get a list of appSetting with dynamic filtering, sorting, pagination, and advanced search",
     *     tags={"AppSetting"},
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
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/AppSettingResource")),
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
        $results = $this->appSettingService->get($request);

        if (!$results) {
            return response()->json(['message' => 'Error fetching appSetting list'], 500);
        }

        if($request->has('aggregate')) {
            return $results;
        }

        return response()->json([
            'data' => AppSettingResource::collection($results),
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
     *     path="/api/appsetting",
     *     summary="Store a new appsetting",
     *     tags={"AppSetting"},
     *     @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(ref="#/components/schemas/AppSettingRequest")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="AppSetting created successfully",
     *         @OA\JsonContent(ref="#/components/schemas/AppSettingResource")
     *     )
     * )
     */
    public function store(AppSettingRequest $request)
    {
        $appSetting = $this->appSettingService->createOrUpdate($this->validateData($request));
        return $this->response(new AppSettingResource($appSetting), 201);
    }

    /**
     * @OA\Get(
     *     path="/api/appsetting/{id}",
     *     summary="Get a specific appsetting",
     *     tags={"AppSetting"},
     *     @OA\Parameter(in="path", name="id", required=true, description="AppSetting ID"),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/AppSettingResource")
     *     )
     * )
     */
    public function show($id)
    {
        $appSetting = AppSetting::findOrFail($id);
        return $this->response(new AppSettingResource($appSetting));
    }

    /**
     * @OA\Put(
     *     path="/api/appsetting/{id}",
     *     summary="Update a specific appsetting",
     *     tags={"AppSetting"},
     *     @OA\Parameter(in="path", name="id", required=true, description="AppSetting ID"),
     *     @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(ref="#/components/schemas/AppSettingRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="AppSetting updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/AppSettingResource")
     *     )
     * )
     */
    public function update(AppSettingRequest $request, $id)
    {
        $appSetting = AppSetting::findOrFail($id);
        $updatedAppSetting = $this->appSettingService->update($appSetting, $request->validated());
        return $this->response(new AppSettingResource($updatedAppSetting));
    }

    /**
     * @OA\Delete(
     *     path="/api/appsetting/{id}",
     *     summary="Delete a appsetting",
     *     tags={"AppSetting"},
     *     @OA\Parameter(in="path", name="id", required=true, description="AppSetting ID"),
     *     @OA\Response(
     *         response=204,
     *         description="AppSetting deleted successfully"
     *     )
     * )
     */
    public function destroy(AppSetting $appSetting)
    {
        $this->appSettingService->delete($appSetting);
        return $this->response("The record has been deleted successfully.", 204);
    }

    /**
     * @OA\Put(
     *     path="/api/appsetting/{id}/restore",
     *     summary="Restore a deleted appsetting",
     *     tags={"AppSetting"},
     *     @OA\Parameter(in="path", name="id", required=true, description="AppSetting ID"),
     *     @OA\Response(
     *         response=200,
     *         description="AppSetting restored successfully",
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
        $this->appSettingService->restore($id);
        return $this->response("The record has been restored successfully.");
    }

    /**
     * @OA\Delete(
     *     path="/api/appsetting/{id}/force-destroy",
     *     summary="Permanently delete a appsetting",
     *     tags={"AppSetting"},
     *     @OA\Parameter(in="path", name="id", required=true, description="AppSetting ID"),
     *     @OA\Response(
     *         response=204,
     *         description="AppSetting permanently deleted"
     *     )
     * )
     */
    public function forceDestroy($id)
    {
        $this->appSettingService->forceDelete($id);
        return $this->response("The record has been permanently deleted.", 204);
    }
}
