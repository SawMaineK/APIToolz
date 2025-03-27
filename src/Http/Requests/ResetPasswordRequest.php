<?php
namespace Sawmainek\Apitoolz\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ResetPasswordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        // You can add any authorization logic here.
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'required|string|confirmed|min:6',
        ];
    }

    /**
     * Get custom validation messages.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'email.required' => 'The email address is required.',
            'email.email' => 'The email must be a valid email address.',
            'email.exists' => 'The email address does not exist in our records.',
            'token.required' => 'The reset token is required.',
            'password.required' => 'The password is required.',
            'password.confirmed' => 'The password confirmation does not match.',
            'password.min' => 'The password must be at least 6 characters.',
        ];
    }
}
