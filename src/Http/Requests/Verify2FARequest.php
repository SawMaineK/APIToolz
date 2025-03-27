<?php

namespace Sawmainek\Apitoolz\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\ValidationException;

class Verify2FARequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|min:4|max:6',
        ];
    }

    public function messages()
    {
        return [
            'email.required' => 'Email is required.',
            'email.email' => 'A valid email is required.',
            'email.exists' => 'No account found with this email.',
            'otp.required' => 'OTP is required.',
            'otp.string' => 'OTP must be a string.',
            'otp.min' => 'OTP must be at least 4 characters.',
            'otp.max' => 'OTP must not exceed 6 characters.',
        ];    }

    protected function failedValidation(Validator $validator)
    {
        $errors = (new ValidationException($validator))->errors();
        $response['code'] = 400;
        $response['message'] = "There is something wrong in your request.";
        foreach ($errors as $key => $error) {
            $response['error'][$key] = $error[0];
        }
        throw new HttpResponseException(
            response()->json($response, 400)
        );
    }
}
