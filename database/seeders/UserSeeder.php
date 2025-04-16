<?php

namespace Database\Seeders;

use Sawmainek\Apitoolz\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        if (!User::where('email', 'admin@example.com')->exists()) {
            User::create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => Hash::make('adminuser'), // You can use env or secure passwords
                'phone' => '0912345678'
            ]);
        }
    }
}
