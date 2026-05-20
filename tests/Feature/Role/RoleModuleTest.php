<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Spatie\Permission\Models\Role;

test('invitados no pueden listar roles', function () {
    $this->get(route('roles.index'))->assertRedirect(route('login'));
});

test('usuario sin permisos no puede listar roles', function () {
    $user = User::factory()->create();
    $user->syncRoles([]);

    $this->actingAs($user)->get(route('roles.index'))->assertForbidden();
});

test('administrador puede crear un rol con permisos', function () {
    $this->actingAs(User::factory()->create());

    $this->post(route('roles.store'), [
        'name' => 'supervisor_prueba',
        'permissions' => ['dashboard.view', 'clientes.viewAny'],
    ])->assertRedirect(route('roles.index'));

    $this->assertDatabaseHas('roles', ['name' => 'supervisor_prueba', 'guard_name' => 'web']);

    $rol = Role::findByName('supervisor_prueba', 'web');
    expect($rol->hasPermissionTo('dashboard.view'))->toBeTrue()
        ->and($rol->hasPermissionTo('clientes.viewAny'))->toBeTrue();
});

test('no se puede eliminar el rol administrador', function () {
    $this->actingAs(User::factory()->create());

    $rol = Role::findByName('administrador', 'web');

    $this->delete(route('roles.destroy', $rol))->assertSessionHas('error');
});

test('no se puede eliminar un rol con usuarios asignados', function () {
    $this->actingAs(User::factory()->create());

    $rol = Role::findByName('ventas', 'web');
    $usuario = User::factory()->create();
    $usuario->syncRoles(['ventas']);

    $this->delete(route('roles.destroy', $rol))->assertSessionHas('error');
});

test('la matriz de permisos incluye columnas crud y filas por módulo', function () {
    $m = RolePermissionSeeder::matrizPermisos();

    expect($m['columnas'])->toHaveCount(5)
        ->and(collect($m['filas'])->pluck('modulo')->all())
        ->toContain('clientes', 'productos', 'alquileres', 'usuarios', 'roles', 'dashboard');

    $alquileres = collect($m['filas'])->firstWhere('modulo', 'alquileres');
    expect($alquileres['extras'])->not->toBeEmpty();

    $primerPermiso = collect($m['filas'])
        ->pluck('casillas')
        ->flatten(1)
        ->pluck('permiso')
        ->filter()
        ->first();
    expect($primerPermiso)->toHaveKeys(['name', 'label', 'descripcion']);
});

test('administrador puede eliminar un rol vacío y personalizado', function () {
    $this->actingAs(User::factory()->create());

    $rol = Role::create(['name' => 'rol_vacio', 'guard_name' => 'web']);

    $this->delete(route('roles.destroy', $rol))->assertRedirect(route('roles.index'));

    $this->assertDatabaseMissing('roles', ['name' => 'rol_vacio']);
});
