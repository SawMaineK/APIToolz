<?php

namespace Sawmainek\Apitoolz\Http\Resources\Auth;

use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="LoginRequest",
 *     type="object",
 *     title="Login Request",
 *     description="Login request payload",
 *     required={"email", "password"},
 *     @OA\Property(property="email", type="string", format="email", example="john@example.com"),
 *     @OA\Property(property="phone", type="string", nullable=true, example="0912345678"),
 *     @OA\Property(property="password", type="string", format="password", example="password123")
 * )
 */
class LoginRequestSchema {}
