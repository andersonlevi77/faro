<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Texto corto para listas y cabeceras.
     *
     * @return array<string, string>
     */
    public static function mapaPermisos(): array
    {
        return [
            'dashboard.view' => 'Panel: ver resumen',
            'productos.viewAny' => 'Productos: listar',
            'productos.view' => 'Productos: ver detalle',
            'productos.create' => 'Productos: crear',
            'productos.update' => 'Productos: editar',
            'productos.delete' => 'Productos: eliminar',
            'clientes.viewAny' => 'Clientes: listar',
            'clientes.view' => 'Clientes: ver detalle',
            'clientes.create' => 'Clientes: crear',
            'clientes.update' => 'Clientes: editar',
            'clientes.delete' => 'Clientes: eliminar',
            'alquileres.viewAny' => 'Alquileres: listar',
            'alquileres.view' => 'Alquileres: ver detalle',
            'alquileres.create' => 'Alquileres: crear',
            'alquileres.update' => 'Alquileres: editar',
            'alquileres.delete' => 'Alquileres: eliminar',
            'alquileres.cambiarEstado' => 'Alquileres: cambiar estado',
            'usuarios.viewAny' => 'Usuarios: listar',
            'usuarios.view' => 'Usuarios: ver detalle',
            'usuarios.create' => 'Usuarios: crear',
            'usuarios.update' => 'Usuarios: editar roles',
            'usuarios.delete' => 'Usuarios: eliminar',
            'roles.viewAny' => 'Roles: listar',
            'roles.view' => 'Roles: ver detalle',
            'roles.create' => 'Roles: crear',
            'roles.update' => 'Roles: editar',
            'roles.delete' => 'Roles: eliminar',
        ];
    }

    /**
     * Explicación clara para administradores al asignar permisos (misma clave que mapaPermisos).
     *
     * @return array<string, string>
     */
    public static function descripcionesPermisos(): array
    {
        return [
            'dashboard.view' => 'Permite entrar al panel de inicio y ver el resumen (estadísticas, alquileres próximos a devolver, atrasados y alertas de stock). Sin esto el usuario no puede usar el tablero principal.',
            'productos.viewAny' => 'Permite abrir la lista de productos y usar búsquedas o filtros. No incluye abrir la ficha de un producto concreto.',
            'productos.view' => 'Permite abrir la página de detalle de un producto (datos, stock, lotes vinculados). Suele ir junto con listar.',
            'productos.create' => 'Permite registrar productos nuevos en el catálogo.',
            'productos.update' => 'Permite modificar datos de productos existentes (nombre, precios, stock mínimo, si es alquilable, etc.).',
            'productos.delete' => 'Permite eliminar productos del catálogo. Solo debe otorgarse a perfiles de confianza.',
            'clientes.viewAny' => 'Permite ver el listado de clientes y buscar por nombre, documento o contacto.',
            'clientes.view' => 'Permite abrir la ficha de un cliente y ver su historial de alquileres recientes.',
            'clientes.create' => 'Permite dar de alta nuevos clientes.',
            'clientes.update' => 'Permite editar los datos de un cliente ya existente.',
            'clientes.delete' => 'Permite borrar un cliente solo si no tiene alquileres asociados.',
            'alquileres.viewAny' => 'Permite ver la lista de alquileres y localizar contratos por código o cliente.',
            'alquileres.view' => 'Permite abrir el detalle de un alquiler (líneas, fechas, totales y estado).',
            'alquileres.create' => 'Permite crear alquileres nuevos (borrador o según flujo) y gestionar líneas.',
            'alquileres.update' => 'Permite modificar datos del alquiler mientras las reglas de negocio lo permitan.',
            'alquileres.delete' => 'Permite eliminar alquileres cuando las políticas del sistema lo autorizan.',
            'alquileres.cambiarEstado' => 'Permite avanzar o retroceder el estado del alquiler (por ejemplo de borrador a reservado, entregado o devuelto), respetando transiciones y stock.',
            'usuarios.viewAny' => 'Permite ver la lista de usuarios del sistema.',
            'usuarios.view' => 'Permite ver la ficha o detalle de un usuario concreto (si existe esa pantalla en el flujo).',
            'usuarios.create' => 'Permite dar de alta usuarios nuevos (nombre, email, contraseña y roles) desde Usuarios, por ejemplo para empleados o colaboradores.',
            'usuarios.update' => 'Permite asignar o quitar roles a un usuario. No edita la matriz de permisos de cada rol; eso se hace en Roles.',
            'usuarios.delete' => 'Permite eliminar cuentas de usuario. Concederlo solo a administradores.',
            'roles.viewAny' => 'Permite entrar al listado de roles y gestionar el catálogo de roles.',
            'roles.view' => 'Permite ver el detalle de un rol (resumen de permisos).',
            'roles.create' => 'Permite crear roles nuevos y definir su conjunto de permisos.',
            'roles.update' => 'Permite editar un rol existente (nombre y permisos).',
            'roles.delete' => 'Permite eliminar roles que no estén asignados a ningún usuario y que no sean el rol administrador.',
        ];
    }

    /**
     * @return list<string>
     */
    public static function permisos(): array
    {
        return array_keys(self::mapaPermisos());
    }

    /**
     * @return array{
     *     columnas: list<array{key: string, label: string}>,
     *     filas: list<array{
     *         modulo: string,
     *         moduloLabel: string,
     *         casillas: list<array{accion: string, permiso: array{name: string, label: string, descripcion: string}|null}>,
     *         extras: list<array{name: string, label: string, descripcion: string}>
     *     }>
     * }
     */
    public static function matrizPermisos(): array
    {
        $mapa = self::mapaPermisos();
        $descripciones = self::descripcionesPermisos();
        $etiquetasModulo = [
            'dashboard' => 'Panel de inicio',
            'productos' => 'Productos',
            'clientes' => 'Clientes',
            'alquileres' => 'Alquileres',
            'usuarios' => 'Usuarios',
            'roles' => 'Roles',
        ];
        $ordenModulos = array_keys($etiquetasModulo);
        $accionesEstandar = ['viewAny', 'view', 'create', 'update', 'delete'];

        $columnas = [
            ['key' => 'viewAny', 'label' => 'Listar'],
            ['key' => 'view', 'label' => 'Ver'],
            ['key' => 'create', 'label' => 'Crear'],
            ['key' => 'update', 'label' => 'Editar'],
            ['key' => 'delete', 'label' => 'Eliminar'],
        ];

        $filas = [];

        foreach ($ordenModulos as $modulo) {
            $casillas = [];
            foreach ($accionesEstandar as $accion) {
                $nombre = $modulo.'.'.$accion;
                $casillas[] = [
                    'accion' => $accion,
                    'permiso' => isset($mapa[$nombre])
                        ? [
                            'name' => $nombre,
                            'label' => $mapa[$nombre],
                            'descripcion' => $descripciones[$nombre] ?? '',
                        ]
                        : null,
                ];
            }

            $extras = [];
            foreach ($mapa as $nombre => $etiqueta) {
                if (! str_starts_with($nombre, $modulo.'.')) {
                    continue;
                }
                $sufijo = substr($nombre, strlen($modulo) + 1);
                if (in_array($sufijo, $accionesEstandar, true)) {
                    continue;
                }
                $extras[] = [
                    'name' => $nombre,
                    'label' => $etiqueta,
                    'descripcion' => $descripciones[$nombre] ?? '',
                ];
            }
            usort($extras, fn (array $a, array $b): int => strcmp($a['name'], $b['name']));

            $filas[] = [
                'modulo' => $modulo,
                'moduloLabel' => $etiquetasModulo[$modulo] ?? $modulo,
                'casillas' => $casillas,
                'extras' => $extras,
            ];
        }

        return [
            'columnas' => $columnas,
            'filas' => $filas,
        ];
    }

    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $guard = 'web';

        foreach (self::permisos() as $nombre) {
            Permission::query()->firstOrCreate(['name' => $nombre, 'guard_name' => $guard]);
        }

        $admin = Role::query()->firstOrCreate(['name' => 'administrador', 'guard_name' => $guard]);
        $admin->syncPermissions(Permission::query()->where('guard_name', $guard)->get());

        $ventas = Role::query()->firstOrCreate(['name' => 'ventas', 'guard_name' => $guard]);
        $ventas->syncPermissions([
            'dashboard.view',
            'productos.viewAny',
            'productos.view',
            'clientes.viewAny',
            'clientes.view',
            'clientes.create',
            'clientes.update',
            'alquileres.viewAny',
            'alquileres.view',
            'alquileres.create',
            'alquileres.update',
            'alquileres.cambiarEstado',
        ]);

        $logistica = Role::query()->firstOrCreate(['name' => 'logistica', 'guard_name' => $guard]);
        $logistica->syncPermissions([
            'dashboard.view',
            'productos.viewAny',
            'productos.view',
            'alquileres.viewAny',
            'alquileres.view',
            'alquileres.update',
            'alquileres.cambiarEstado',
        ]);
    }
}
