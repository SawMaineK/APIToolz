<?php

namespace Sawmainek\Apitoolz\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\ValidationException;

class RegisterRequest extends FormRequest
{

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $roles = [
            'name' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ];

        if($this->email) {
            $roles['email'] = ['required', 'string', 'email', 'max:255', 'unique:users'];
        }

        if ($this->phone) {
            $roles['phone'] = ['required', 'string', 'max:255', 'unique:users'];
        }

        if(!$this->email && !$this->phone) {
            $roles['email'] = ['required', 'string', 'email', 'max:255', 'unique:users'];
            $roles['phone'] = ['required', 'string', 'max:255', 'unique:users'];
        }

        $roles['avatar'] = ['mimes:jpeg,jpg,png','max:1024'];
        return $roles;
    }

    /**
     * Get the error messages for the defined validation rules.*
     * @return array
     */
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
