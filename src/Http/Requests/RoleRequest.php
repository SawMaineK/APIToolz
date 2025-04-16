<?php

namespace Sawmainek\Apitoolz\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Exceptions\HttpResponseException;

/**
 * @OA\Schema(
 *     schema="RoleRequest",
 *     required={ "" },
 *     @OA\Property(property="name", type="string", example="Name Example"),
 *     @OA\Property(property="guard_name", type="string", example="Guard_name Example")
 * )
 */

class RoleRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
			'name'=>'required',
			'guard_name'=>'required',
			'created_at'=>'',
			'updated_at'=>'',

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
