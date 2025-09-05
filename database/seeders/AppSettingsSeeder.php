<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Sawmainek\Apitoolz\Models\AppSetting;

class AppSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        AppSetting::updateOrCreate(['key'=> 'default_settings'],[
                'key' => 'default_settings',
                'menu_config' => [
                    [
                      'title'=> 'Dashboard',
                      'icon'=> 'home-2',
                      'path'=> '/admin',
                      'roles'=> ['super', 'admin']
                    ],
                    [
                      'heading'=> 'Manage User',
                      'roles'=> ['super', 'admin']
                    ],
                    [
                      'title'=> 'Users',
                      'icon'=> 'users',
                      'path'=> '/admin/users',
                      'roles'=> ['super', 'admin']
                    ],
                    [
                      'title'=> 'Roles & Permssions',
                      'icon'=> 'security-user',
                      'path'=> '/admin/roles',
                      'roles'=> ['super']
                    ]
                ],
                'branding' => [
                    'app_name' => 'APIToolz',
                    'logo_url' => '/media/app/default-logo.svg',
                    'logo_small_url' => '/media/app/mini-logo.svg',
                    'theme_color' => '#00A193'
                ],
                'email_config' => [
                    'mail_driver' => 'smtp',
                    'mail_host' => 'smtp.mailtrap.io',
                    'mail_port' => 587,
                    'mail_username' => 'your_username',
                    'mail_password' => 'your_password',
                    'mail_from_address' => 'noreply@yourapp.com',
                    'mail_from_name' => 'Your App'
                ],
                'sms_config' => [
                    'provider' => 'twilio',
                    'account_sid' => 'ACXXXXXXXXXXXXXXXX',
                    'auth_token' => 'your_auth_token',
                    'from' => '+1234567890'
                ],
                'other' => [
                    'timezone' => 'UTC',
                    'currency' => 'USD'
                ],
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
    }
}
