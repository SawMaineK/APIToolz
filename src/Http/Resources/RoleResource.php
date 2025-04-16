<?php

namespace Sawmainek\Apitoolz\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Schema(
 *     schema="RoleResource",
 *     @OA\Property(property="id", type="integer", example="20"),
 *     @OA\Property(property="name", type="string", example="Name Example"),
 *     @OA\Property(property="guard_name", type="string", example="Guard_name Example"),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-04-13 13:29:56"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2025-04-13 13:29:56")
 * )
 */

class RoleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
			'name' => $this->name,
			'guard_name' => $this->guard_name,
			'created_at' => $this->created_at,
			'updated_at' => $this->updated_at
        ];
    }
}
