<?php

namespace Sawmainek\Apitoolz\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WorkflowRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => 'sometimes|integer',
            'name' => [
                'required',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('workflows', 'name')->ignore($this->id),
            ],
            'description' => 'nullable|string',
            'definition' => 'nullable|string',
            'use_ai' => 'sometimes|boolean'
        ];
    }
}
