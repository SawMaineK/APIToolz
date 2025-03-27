<?php

namespace Sawmainek\Apitoolz\Http\Resources\Auth;

use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="ChangePasswordRequest",
 *     type="object",
 *     title="Change Password Request",
 *     description="Request payload for changing password",
 *     required={"current_password", "new_password", "new_password_confirmation"},
 *     @OA\Property(property="current_password", type="string", format="password", example="oldpassword123"),
 *     @OA\Property(property="new_password", type="string", format="password", example="newpassword123"),
 *     @OA\Property(property="new_password_confirmation", type="string", format="password", example="newpassword123")
 * )
 */
class ChangePasswordRequestSchema {}
