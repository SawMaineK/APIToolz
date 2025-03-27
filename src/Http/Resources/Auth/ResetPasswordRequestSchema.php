<?php

namespace Sawmainek\Apitoolz\Http\Resources\Auth;

use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="ResetPasswordRequest",
 *     required={"email", "token", "password", "password_confirmation"},
 *     @OA\Property(property="email", type="string", format="email", example="john@example.com"),
 *     @OA\Property(property="token", type="string", example="random-reset-token"),
 *     @OA\Property(property="password", type="string", format="password", example="newpassword123"),
 *     @OA\Property(property="password_confirmation", type="string", format="password", example="newpassword123")
 * )
 */
class ResetPasswordRequestSchema {}
