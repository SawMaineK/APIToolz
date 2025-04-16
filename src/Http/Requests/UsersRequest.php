<?php

namespace Sawmainek\Apitoolz\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

/**
 * @OA\Schema(
 *     schema="UsersRequest",
 *     required={ "" },
 *     @OA\Property(property="name", type="string", example="Name Example"),
 *     @OA\Property(property="email", type="string", format="email", example="Email Example"),
 *     @OA\Property(property="email_verified_at", type="string", format="date-time", example="2025-04-12 16:00:33"),
 *     @OA\Property(property="password", type="string", example="Password Example"),
 *     @OA\Property(property="remember_token", type="string", example="Remember_token Example"),
 *     @OA\Property(property="phone", type="string", example="Phone Example"),
 *     @OA\Property(property="gender", type="string", example="Gender Example"),
 *     @OA\Property(property="dob", type="string", example="Dob Example"),
 *     @OA\Property(property="avatar", type="string", example="Avatar Example"),
 *     @OA\Property(property="is_2fa_enabled", type="string", example="Is_2fa_enabled Example")
 * )
 */

class UsersRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
			'name'=>'required',
            'email'=> ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($this->id)],
			'password'=>'',
            'phone'=> ['nullable', 'string', 'max:255', Rule::unique('users')->ignore($this->id)],
			'gender'=>'',
			'dob'=>'',
			'avatar'=>'',
			'is_2fa_enabled'=>'',
            'roles' => '',
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
