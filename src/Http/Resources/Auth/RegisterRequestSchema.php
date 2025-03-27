<?php

namespace Sawmainek\Apitoolz\Http\Resources\Auth;

use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="RegisterRequest",
 *     type="object",
 *     title="Register Request",
 *     description="User registration request payload",
 *     required={"name", "email", "password", "password_confirmation"},
 *     @OA\Property(property="name", type="string", example="John Doe"),
 *     @OA\Property(property="email", type="string", format="email", example="john@example.com"),
 *     @OA\Property(property="phone", type="string", nullable=true, example="0912345678"),
 *     @OA\Property(property="password", type="string", format="password", example="password123"),
 *     @OA\Property(property="password_confirmation", type="string", format="password", example="password123")
 * )
 */
class RegisterRequestSchema {}
