<?php

namespace Sawmainek\Apitoolz\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Exceptions\HttpResponseException;

/**
 * @OA\Schema(
 *     schema="AppSettingRequest",
 *     required={ "" },
 *     @OA\Property(property="key", type="string", example="Key Example"),
 *     @OA\Property(property="menu_config", type="string", example="Menu_config Example"),
 *     @OA\Property(property="branding", type="string", example="Branding Example"),
 *     @OA\Property(property="email_config", type="string", example="Email_config Example"),
 *     @OA\Property(property="sms_config", type="string", example="Sms_config Example"),
 *     @OA\Property(property="other", type="string", example="Other Example")
 * )
 */

class AppSettingRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'id' => 'nullable|integer',
            'key' => 'required|string',
            'menu_config' => 'nullable',
            'branding' => 'nullable|array',
            'branding.app_name' => 'nullable|string|max:255',
            'branding.logo_url' => 'nullable|string',
            'branding.logo_small_url' => 'nullable|string',
            'branding.logo_dark_url' => 'nullable|string',
            'branding.logo_dark_small_url' => 'nullable|string',
            'branding.theme_color' => 'nullable|string',
            'branding.layout' => 'nullable|string',
            'branding_logo_url' => 'nullable|image|max:5120',
            'branding_logo_small_url' => 'nullable|image|max:5120',
            'branding_logo_dark_url' => 'nullable|image|max:5120',
            'branding_logo_dark_small_url' => 'nullable|image|max:5120',
            'email_config' => 'nullable',
            'sms_config' => 'nullable',
            'other' => 'nullable',
            'created_at' => 'nullable',
            'updated_at' => 'nullable'
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @param Validator $validator
     * @throws HttpResponseException
     */
    protected function failedValidation(Validator $validator)
    {
        $errors = (new ValidationException($validator))->errors();
        $response = [
            'code' => 400,
            'message' => "There is something wrong in your request.",
            'errors' => $errors,
        ];
        throw new HttpResponseException(response()->json($response, 400));
    }

}
