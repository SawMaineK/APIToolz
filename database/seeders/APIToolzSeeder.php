<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class APIToolzSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call(UserSeeder::class);
        $this->call(RolePermissionSeeder::class);
        $this->call(AppSettingsSeeder::class);
        $this->command->info('APIToolz database seeded successfully!');
        $this->command->info('You can now log in with the default admin username: admin@example.com and password: adminuser');
    }
}
