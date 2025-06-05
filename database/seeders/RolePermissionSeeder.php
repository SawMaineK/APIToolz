<?php

namespace Database\Seeders;

use Sawmainek\Apitoolz\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run()
    {
        // Create or get roles
        $superRole = Role::firstOrCreate(['name' => 'super','guard_name' => 'sanctum']);
        $adminRole = Role::firstOrCreate(['name' => 'admin','guard_name' => 'sanctum']);
        $userRole = Role::firstOrCreate(['name' => 'user','guard_name' => 'sanctum']);

        $permissions = [
            'view',
            'create',
            'edit',
            'delete'
        ];

        foreach ($permissions as $permName) {
            Permission::firstOrCreate(['name' => $permName, 'guard_name' => 'sanctum']);
        }
        $superRole->givePermissionTo($permissions);
        $adminRole->givePermissionTo($permissions);
        $userRole->givePermissionTo($permissions);

        // Attach roles
        $user = User::where('email', 'admin@example.com')->first();
        if (!$user->roles->contains('name', 'super')) {
            $user->roles()->attach($superRole, ['model_type' => User::class]);
        }
        if (!$user->roles->contains('name', 'admin')) {
            $user->roles()->attach($adminRole, ['model_type' => User::class]);
        }
        if (!$user->roles->contains('name', 'user')) {
            $user->roles()->attach($userRole, ['model_type' => User::class]);
        }

    }
}
