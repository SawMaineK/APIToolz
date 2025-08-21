<?php

namespace Sawmainek\Apitoolz\Models;

use Sawmainek\Apitoolz\Traits\QueryFilterTrait;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

class AppSetting extends Model
{
    use SoftDeletes;
    use QueryFilterTrait;
    use Notifiable;

    protected $table = "app_settings";

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'id', 'key', 'branding', 'menu_config', 'dashboard_config', 'email_config', 'sms_config', 'other', 'created_at', 'updated_at'
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $searchable = [
        'id', 'key', 'menu_config', 'branding', 'email_config', 'sms_config', 'other', 'created_at', 'updated_at'
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
            'id' => 'integer', 'key' => 'string', 'branding' => 'json', 'menu_config' => 'json', 'dashboard_config' => 'json', 'email_config' => 'json', 'sms_config' => 'json', 'other' => 'json', 'created_at' => 'datetime', 'updated_at' => 'datetime', 'deleted_at' => 'datetime'
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
            'key' => $this->key,
			'menu_config' => $this->menu_config,
			'dashboard_config' => $this->dashboard_config,
			'branding' => $this->branding,
			'email_config' => $this->email_config,
			'sms_config' => $this->sms_config,
			'other' => $this->other,
			'created_at' => $this->created_at,
			'updated_at' => $this->updated_at
        ];
    }



}
