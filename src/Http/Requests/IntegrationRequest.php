<?php

namespace Sawmainek\Apitoolz\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IntegrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'       => 'sometimes|string|max:255',
            'type'       => 'sometimes|string',
            'description'=> 'sometimes|string|max:500',
            'definition' => 'sometimes',
        ];
    }
}
