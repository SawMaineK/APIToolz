<?php

namespace Sawmainek\Apitoolz\Http\Resources\Auth;

use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="UserResponse",
 *     type="object",
 *     title="User Response",
 *     description="User object returned after authentication or profile update",
 *     required={"id", "name", "email", "created_at", "updated_at"},
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="John Doe"),
 *     @OA\Property(property="email", type="string", format="email", example="john@example.com"),
 *     @OA\Property(property="email_verified_at", type="string", format="date-time", nullable=true, example=null),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-02-06T13:14:43.000000Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2025-02-06T13:14:43.000000Z"),
 *     @OA\Property(property="phone", type="string", example="0912345678"),
 *     @OA\Property(property="gender", type="string", nullable=true, example=null),
 *     @OA\Property(property="dob", type="string", format="date", nullable=true, example=null),
 *     @OA\Property(property="avatar", type="string", example="profile.jpg"),
 *     @OA\Property(property="personal_access_token", type="string", example="1|FFHC6zVeRubW9lw3gkVK8tTO6DgZCc9cQCc4tOLp9270111c")
 * )
 */
class UserResponseSchema {}
