<?php

namespace Sawmainek\Apitoolz\Models;

use Sawmainek\Apitoolz\Traits\QueryFilterTrait;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{

    use QueryFilterTrait;
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'id', 'name', 'guard_name', 'created_at', 'updated_at'
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $searchable = [
        'id', 'name', 'guard_name', 'created_at', 'updated_at'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [

    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer', 'name' => 'string', 'guard_name' => 'string', 'created_at' => 'datetime', 'updated_at' => 'datetime'
        ];
    }

    /**
     * Route notifications for the mail channel.
     *
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return array|string
     */
    public function routeNotificationForMail($notification)
    {
        return [

        ];
    }

    /**
    * Get the indexable data array for the model.
    *
    * @return array<string, mixed>
    */
    public function toSearchableArray(): array
    {
        return [
            'name' => $this->name,
			'guard_name' => $this->guard_name,
			'created_at' => $this->created_at,
			'updated_at' => $this->updated_at
        ];
    }

}
