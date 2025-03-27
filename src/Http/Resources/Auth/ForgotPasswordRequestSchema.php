<?php

namespace Sawmainek\Apitoolz\Http\Resources\Auth;

use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="ForgotPasswordRequest",
 *     required={"email"},
 *     @OA\Property(property="email", type="string", format="email", example="john@example.com")
 * )
 */
class ForgotPasswordRequestSchema {}
