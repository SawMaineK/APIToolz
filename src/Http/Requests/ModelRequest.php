<?php
namespace Sawmainek\Apitoolz\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ModelRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name' => 'required|alpha|string|unique:models,name',
            'build_with' => ['required', Rule::in(['ai', 'table', 'sql'])],
            'instruction' => 'nullable|string',
            'table' => $this->input('build_with') === 'table' ? 'required|string' : 'nullable|string',
            'custom_sql' => $this->input('build_with') === 'sql' ? ['required', 'string', function ($attribute, $value, $fail) {
                if (!$this->isValidCreateTableSQL($value)) {
                    $fail('The custom SQL must be a valid CREATE TABLE statement.');
                }
            }] : 'nullable|string',
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'The name field is required.',
            'name.alpha' => 'The name field must contain only alphabetic characters.',
            'name.string' => 'The name field must be a string.',
            'name.unique' => 'The name has already been taken.',
            'build_with.required' => 'The build_with field is required.',
            'build_with.in' => 'The build_with field must be either "ai", "table", or "sql".',
            'instruction.string' => 'The instruction field must be a string.',
            'table.required' => 'The table field is required when build_with is set to "table".',
            'table.string' => 'The table field must be a string.',
            'table.exists' => 'The selected table does not exist in the database.',
            'custom_sql.required' => 'The custom SQL field is required when build_with is set to "sql".',
            'custom_sql.string' => 'The custom SQL field must be a valid SQL statement.',
        ];
    }

    /**
     * Validate if the given SQL statement is a valid CREATE TABLE statement.
     */
    protected function isValidCreateTableSQL($sql)
    {
        // Simple regex to check if it starts with "CREATE TABLE" (case-insensitive)
        return preg_match('/^\s*CREATE\s+TABLE\s+/i', trim($sql));
    }
}
