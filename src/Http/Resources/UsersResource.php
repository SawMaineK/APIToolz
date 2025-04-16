<?php

namespace Sawmainek\Apitoolz\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Schema(
 *     schema="UsersResource",
 *     @OA\Property(property="id", type="integer", example="67"),
 *     @OA\Property(property="name", type="string", example="Name Example"),
 *     @OA\Property(property="email", type="string", format="email", example="Email Example"),
 *     @OA\Property(property="email_verified_at", type="string", format="date-time", example="2025-04-12 16:00:33"),
 *     @OA\Property(property="password", type="string", example="Password Example"),
 *     @OA\Property(property="remember_token", type="string", example="Remember_token Example"),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-04-12 16:00:33"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2025-04-12 16:00:33"),
 *     @OA\Property(property="phone", type="string", example="Phone Example"),
 *     @OA\Property(property="gender", type="string", example="Gender Example"),
 *     @OA\Property(property="dob", type="string", example="Dob Example"),
 *     @OA\Property(property="avatar", type="string", example="Avatar Example"),
 *     @OA\Property(property="is_2fa_enabled", type="string", example="Is_2fa_enabled Example")
 * )
 */

class UsersResource extends JsonResource
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
			'email' => $this->email,
			'email_verified_at' => $this->email_verified_at,
			'password' => $this->password,
			'remember_token' => $this->remember_token,
			'created_at' => $this->created_at,
			'updated_at' => $this->updated_at,
			'phone' => $this->phone,
			'gender' => $this->gender,
			'dob' => $this->dob,
			'avatar' => $this->avatar,
			'is_2fa_enabled' => $this->is_2fa_enabled,
            'roles' => $this->roles,
            'permissions' => $this->permissions,
        ];
    }
}
