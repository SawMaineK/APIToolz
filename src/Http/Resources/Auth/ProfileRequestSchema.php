<?php

namespace Sawmainek\Apitoolz\Http\Resources\Auth;

use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="ProfileRequest",
 *     type="object",
 *     title="Profile Update Request",
 *     description="Request payload for updating user profile",
 *     required={"name", "email"},
 *     @OA\Property(property="name", type="string", example="John Doe"),
 *     @OA\Property(property="email", type="string", format="email", example="john@example.com"),
 *     @OA\Property(property="phone", type="string", nullable=true, example="0912345678"),
 *     @OA\Property(property="gender", type="string", nullable=true, example="Male"),
 *     @OA\Property(property="dob", type="string", format="date", nullable=true, example="1990-05-15"),
 *     @OA\Property(property="avatar", type="string", nullable=true, example="profile.jpg")
 * )
 */
class ProfileRequestSchema {}
