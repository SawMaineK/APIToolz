<?php

namespace Sawmainek\Apitoolz\Http\Resources\Auth;

use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="Verify2FARequest",
 *     required={"email", "otp"},
 *     @OA\Property(property="email", type="string", format="email", description="User email address", example="user@example.com"),
 *     @OA\Property(property="otp", type="string", minLength=4, maxLength=6, description="One-time password (OTP) for 2FA verification", example="123456")
 * )
 */
class Verify2FARequestSchema
{
}
