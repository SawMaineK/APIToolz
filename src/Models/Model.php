<?php

namespace Sawmainek\Apitoolz\Models;

use Illuminate\Database\Eloquent\Model as BaseModel;
use Illuminate\Database\Eloquent\SoftDeletes;

class Model extends BaseModel
{
    use SoftDeletes;
    
    protected $table = "models";

    protected $fillable = [
        'title', 'desc', 'lock', 'type', 'config', 'auth', 'table', 'two_factor'
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'lock' => 'json', 'auth' => 'boolean', 'two_factor' => 'boolean'
        ];
    }
}
