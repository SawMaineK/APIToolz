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
            'email' => 'nullable|email|exists:users,email|required_without:phone',
            'phone' => 'nullable|string|exists:users,phone|required_without:email',
            'otp' => 'required|string|min:4|max:6',
        ];
    }

    public function messages()
    {
        return [
            'email.required_without' => 'Email or phone number is required.',
            'email.email' => 'A valid email is required.',
            'email.exists' => 'No account found with this email.',

            'phone.required_without' => 'Phone number or email is required.',
            'phone.string' => 'Phone number must be a valid string.',
            'phone.exists' => 'No account found with this phone number.',

            'otp.required' => 'OTP is required.',
            'otp.string' => 'OTP must be a string.',
            'otp.min' => 'OTP must be at least 4 characters.',
            'otp.max' => 'OTP must not exceed 6 characters.',
        ];
    }

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
