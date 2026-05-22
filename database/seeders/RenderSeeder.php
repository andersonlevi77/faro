<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class RenderSeeder extends Seeder
{
    /**
     * Contraseña de demo que cumple las reglas de producción (12+, mayúsculas, minúsculas, @).
     */
    public const ADMIN_PASSWORD = 'Password@123456';

    /**
     * Bootstrap mínimo para producción: roles/permisos y usuario administrador.
     */
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        $admin = User::updateOrCreate(
            ['email' => 'admin@demo.com'],
            [
                'name' => 'Admin Demo',
                'password' => self::ADMIN_PASSWORD,
                'activo' => true,
                'email_verified_at' => now(),
            ],
        );

        if (! $admin->hasRole('administrador')) {
            $admin->assignRole('administrador');
        }
    }
}
