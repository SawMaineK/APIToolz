<?php

namespace Sawmainek\Apitoolz\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Sawmainek\Apitoolz\Models\Integration;
use Sawmainek\Apitoolz\Services\IntegrationService;
use Sawmainek\Apitoolz\Http\Requests\IntegrationRequest;
use Symfony\Component\Yaml\Yaml;

class IntegrationController extends APIToolzController
{
    protected IntegrationService $integration;

    public function __construct(IntegrationService $integration)
    {
        $this->integration = $integration;
    }

    public function run(Request $request, string $slug): JsonResponse
    {
        $stepId  = $request->input('step');
        $context = $request->input('context', []);

        try {
            $result = $this->integration->runWorkflow($slug, $stepId, $context);
            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function index(Request $request): JsonResponse
    {
        $integrations = Integration::query()
            ->when($request->boolean('active_only'), fn($q) => $q->where('active', true))
            ->get();

        return response()->json($integrations);
    }

    public function show(string $slug): JsonResponse
    {
        $integration = Integration::where('slug', $slug)->firstOrFail();
        return response()->json($integration);
    }

    public function store(IntegrationRequest $request): JsonResponse
    {
        $baseSlug = Str::slug($request->name, '-');
        $slug = $baseSlug;

        if (Integration::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . Str::random(4);
        }

        $integration = Integration::create([
            'name'       => $request->name,
            'slug'       => $slug,
            'logo_url'=> $request->logo_url,
            'description'=> $request->description,
            'type' => $request->type,
            'definition' => json_encode($request->definition),
        ]);

        return response()->json($integration, 201);
    }

    public function update(IntegrationRequest $request, string $slug): JsonResponse
    {
        $integration = Integration::where('slug', $slug)->firstOrFail();

        if ($request->name) {
            $baseSlug = Str::slug($request->name, '-');
            $newSlug = $baseSlug;

            // Only regenerate slug if name changes
            if ($integration->name !== $request->name &&
                Integration::where('slug', $newSlug)->where('id', '!=', $integration->id)->exists()) {
                $newSlug = $baseSlug . '-' . Str::random(4);
            }

            $integration->name = $request->name;
            $integration->slug = $newSlug;
        }

        if ($request->logo_url) {
            $integration->logo_url = $request->logo_url;
        }

        if ($request->description) {
            $integration->description = $request->description;
        }

        if ($request->type) {
            $integration->type = $request->type;
        }

        if ($request->status) {
            $integration->status = $request->status;
        }

        if ($request->definition) {
            $integration->definition = json_encode($request->definition);
        }

        if ($request->definition && Yaml::parse($request->definition)) {
            $integration->definition = $request->definition;
        }

        $integration->save();

        return response()->json( $integration);
    }

    public function destroy(string $slug): JsonResponse
    {
        $integration = Integration::where('slug', $slug)->firstOrFail();
        $integration->delete();

        return response()->json(['success' => true, 'message' => 'Integration deleted']);
    }
}
