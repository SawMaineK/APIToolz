<?php

namespace Sawmainek\Apitoolz\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;
use App\Models\User as AppUser;
use Sawmainek\Apitoolz\Traits\QueryFilterTrait;
use Spatie\Permission\Traits\HasRoles;

class User extends AppUser
{
    use HasApiTokens;

    use HasRoles;

    use QueryFilterTrait;

    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'dob',
        'gender',
        'avatar',
        'is_2fa_enabled',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'dob' => 'date',
            'avatar' => 'string',
            'is_2fa_enabled' => 'boolean',
        ];
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $searchable = [
        'name', 'email', 'phone'
    ];
}
