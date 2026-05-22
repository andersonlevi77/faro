<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RenderSeeder extends Seeder
{
    /**
     * Bootstrap mínimo para producción: roles/permisos y usuario administrador.
     */
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        $admin = User::firstOrCreate(
            ['email' => 'admin@demo.com'],
            [
                'name' => 'Admin Demo',
                'password' => Hash::make('password'),
                'activo' => true,
            ],
        );

        if (! $admin->hasRole('administrador')) {
            $admin->assignRole('administrador');
        }
    }
}
