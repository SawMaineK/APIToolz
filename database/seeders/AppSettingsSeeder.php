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
        $settings = AppSetting::where('key', 'default_settings')->first();
        if(!$settings) {
            DB::table('app_settings')->insert([
                'key' => 'default_settings',
                'menu_config' => json_encode([
                    [
                      'title'=> 'Dashboards',
                      'icon'=> 'home-2',
                      'path'=> '/admin'
                    ],
                    [
                      'heading'=> 'Manage User'
                    ],
                    [
                      'title'=> 'Users',
                      'icon'=> 'users',
                      'path'=> '/admin/users'
                    ],
                    [
                      'title'=> 'Roles & Permssions',
                      'icon'=> 'security-user',
                      'path'=> '/admin/roles'
                    ]
                ]),
                'branding' => json_encode([
                    'app_name' => 'APIToolz',
                    'logo_url' => '/media/app/default-logo.svg',
                    'logo_small_url' => '/media/app/mini-logo.svg',
                    'theme_color' => '#4f46e5'
                ]),
                'email_config' => json_encode([
                    'mail_driver' => 'smtp',
                    'mail_host' => 'smtp.mailtrap.io',
                    'mail_port' => 587,
                    'mail_username' => 'your_username',
                    'mail_password' => 'your_password',
                    'mail_from_address' => 'noreply@yourapp.com',
                    'mail_from_name' => 'Your App'
                ]),
                'sms_config' => json_encode([
                    'provider' => 'twilio',
                    'account_sid' => 'ACXXXXXXXXXXXXXXXX',
                    'auth_token' => 'your_auth_token',
                    'from' => '+1234567890'
                ]),
                'other' => json_encode([
                    'timezone' => 'UTC',
                    'currency' => 'USD'
                ]),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }
}
