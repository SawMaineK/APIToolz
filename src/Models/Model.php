<?php

namespace Sawmainek\Apitoolz\Models;

use Illuminate\Database\Eloquent\Model as BaseModel;
use Illuminate\Database\Eloquent\SoftDeletes;

class Model extends BaseModel
{
    use SoftDeletes;

    protected $table = "models";

    protected $fillable = [
        'name','slug','title','desc','key','type', 'config', 'auth', 'table', 'two_factor', 'lock'
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
