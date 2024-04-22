<?php

namespace Sawmainek\Apitoolz\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

/**
 * @OA\Schema(
 *     description="Profile Request",
 *     type="object",
 *     title="Profile Request"
 * )
 */
class ProfileRequest extends FormRequest
{
    /**
     * @OA\Property(type="string")
     */
    public $name;


    /**
     * @OA\Property(type="string")
     */
    public $email;

    /**
     * @OA\Property(type="string")
     */
    public $phone;

    /**
     * @OA\Property(type="string")
     */
    public $password;

    /**
     * @OA\Property(type="string")
     */
    public $password_confirmation;

    /**
     * @OA\Property(type="date")
     */
    public $dob;

    /**
     * @OA\Property(type="string", enum={"male", "female"})
     */
    public $gender;

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
        $user = $this->user();
        $roles = [
            'name' => ['required', 'string', 'max:255'],
        ];

        if ($this->input('email')) {
            $roles['email'] = ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)];
        }

        if ($this->input('phone')) {
            $roles['phone'] = ['required', 'string', 'max:255', Rule::unique('users')->ignore($user->id)];
        }

        if ($this->input('password')) {
            $roles['password'] = ['required', 'string', 'min:6', 'confirmed'];
        }

        if($this->hasFile('avatar')) {
            $roles['avatar'] = ['required','mimes:jpeg,jpg,png','max:1024'];
        }
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
