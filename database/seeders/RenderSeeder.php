<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class RenderSeeder extends Seeder
{
    /**
     * Contraseña de demo que cumple las reglas de producción (12+, mayúsculas, minúsculas, @).
     */
    public const ADMIN_EMAIL = 'admin@demo.com';

    public const ADMIN_PASSWORD = 'Password@123456';

    /**
     * Bootstrap de producción sin borrar datos: roles/permisos y admin inicial si no existe.
     * Seguro de ejecutar en cada deploy (migrate + seed en el contenedor).
     */
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        $admin = User::query()->firstOrCreate(
            ['email' => self::ADMIN_EMAIL],
            [
                'name' => 'Administrador',
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
