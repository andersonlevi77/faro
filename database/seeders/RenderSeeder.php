<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RenderSeeder extends Seeder
{
    /**
     * Contraseña de demo que cumple las reglas de producción (12+, mayúsculas, minúsculas, @).
     */
    public const ADMIN_EMAIL = 'admin@demo.com';

    public const ADMIN_PASSWORD = 'Password@123456';

    /**
     * Deja la base lista para pruebas reales: sin datos de demo, solo roles/permisos y el administrador.
     */
    public function run(): void
    {
        $this->wipeApplicationData();

        $this->call(RolePermissionSeeder::class);

        $admin = User::query()->create([
            'name' => 'Administrador',
            'email' => self::ADMIN_EMAIL,
            'password' => self::ADMIN_PASSWORD,
            'activo' => true,
            'email_verified_at' => now(),
        ]);

        $admin->assignRole('administrador');
    }

    /**
     * Elimina datos operativos y usuarios; conserva roles y permisos del sistema.
     */
    private function wipeApplicationData(): void
    {
        Schema::disableForeignKeyConstraints();

        $tables = [
            'alquiler_linea_unidades',
            'alquiler_estado_historials',
            'pagos',
            'alquiler_lineas',
            'alquileres',
            'mantenimientos',
            'producto_unidades',
            'lotes',
            'productos',
            'clientes',
            'categorias',
            'marcas',
            'presentaciones',
            'model_has_roles',
            'model_has_permissions',
            'sessions',
            'password_reset_tokens',
            'users',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                DB::table($table)->truncate();
            }
        }

        Schema::enableForeignKeyConstraints();
    }
}
