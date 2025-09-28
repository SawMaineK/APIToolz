<?php

namespace Sawmainek\Apitoolz\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Integration extends Model
{
    use HasFactory;

    protected $table = 'integrations';

    protected $fillable = [
        'name',
        'slug',
        'type',
        'logo_url',
        'description',
        'definition',
        'credentials',
        'active',
    ];

    protected $casts = [
        'definition'  => 'array',
        'credentials' => 'array',
        'active'      => 'boolean',
    ];
}
