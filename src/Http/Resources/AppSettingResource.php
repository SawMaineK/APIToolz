<?php

namespace Sawmainek\Apitoolz\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Schema(
 *     schema="AppSettingResource",
 *     @OA\Property(property="id", type="integer", example="37"),
 *     @OA\Property(property="key", type="string", example="Key Example"),
 *     @OA\Property(property="menu_config", type="string", example="Menu_config Example"),
 *     @OA\Property(property="branding", type="string", example="Branding Example"),
 *     @OA\Property(property="email_config", type="string", example="Email_config Example"),
 *     @OA\Property(property="sms_config", type="string", example="Sms_config Example"),
 *     @OA\Property(property="other", type="string", example="Other Example"),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-05-14 09:06:10"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2025-05-14 09:06:10")
 * )
 */

class AppSettingResource extends JsonResource
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
			'key' => $this->key,
			'menu_config' => $this->menu_config,
			'branding' => $this->branding,
			'email_config' => $this->email_config,
			'sms_config' => $this->sms_config,
			'other' => $this->other,
			'created_at' => $this->created_at,
			'updated_at' => $this->updated_at
        ];
    }
}
