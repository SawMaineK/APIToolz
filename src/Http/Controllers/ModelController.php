<?php

namespace Sawmainek\Apitoolz\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Sawmainek\Apitoolz\Http\Requests\ModelRequest;
use Sawmainek\Apitoolz\Http\Resources\ModelResource;
use Sawmainek\Apitoolz\Services\ModelService;

class ModelController extends Controller
{
    protected $modelService;

    public function __construct(ModelService $modelService)
    {
        $this->modelService = $modelService;
    }

    public function index(Request $request)
    {
        $results = $this->modelService->get($request);

        if (isset($results['status']) && $results['status'] === 'error') {
            return response()->json(['message' => $results['message']], 500);
        }

        return response()->json([
            'data' => ModelResource::collection($results),
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

    public function tables()
    {
        $tables = $this->modelService->listTables();

        if (isset($tables['status']) && $tables['status'] === 'error') {
            return response()->json(['message' => $tables['message']], 500);
        }

        return response()->json($tables);
    }

    public function show($id)
    {
        $model = $this->modelService->find($id);

        if (isset($model['status']) && $model['status'] === 'error') {
            return response()->json(['message' => $model['message']], 404);
        }

        return response()->json(new ModelResource($model));
    }

    public function store(ModelRequest $request)
    {
        $data = $request->validated();
        $model = $this->modelService->create($data);

        if (isset($model['status']) && $model['status'] === 'error') {
            return response()->json(['message' => $model['message']], 400);
        }

        return response()->json($model, 201);
    }

    public function update(Request $request, $id)
    {
        $data = $request->all();
        $model = $this->modelService->update($id, $data);

        if (isset($model['status']) && $model['status'] === 'error') {
            return response()->json(['message' => $model['message']], 400);
        }

        return response()->json(new ModelResource($model));
    }

    public function askRequest($slug, Request $request)
    {
        $response = $this->modelService->ask($slug, $request);

        if (isset($response['status']) && $response['status'] === 'error') {
            return response()->json(['message' => $response['message']], 400);
        }

        return response()->json($response);
    }

    public function destroy($id, $deleteTable)
    {
        $response = $this->modelService->delete($id, $deleteTable);

        if (isset($response['status']) && $response['status'] === 'error') {
            return response()->json(['message' => $response['message']], 400);
        }

        return response()->json(['message' => 'Model deleted successfully']);
    }
}
