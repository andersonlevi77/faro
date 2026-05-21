<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

test('un administrador puede deshabilitar a otro usuario', function () {
    $admin = User::factory()->create();
    $colaborador = User::factory()->create(['activo' => true]);

    $this->actingAs($admin)
        ->patch(route('usuarios.activo.update', $colaborador), ['activo' => false])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($colaborador->fresh()->activo)->toBeFalse();
});

test('deshabilitar un usuario cierra sus sesiones activas', function () {
    $admin = User::factory()->create();
    $colaborador = User::factory()->create();

    DB::table('sessions')->insert([
        'id' => 'test-session-id',
        'user_id' => $colaborador->id,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'test',
        'payload' => '',
        'last_activity' => time(),
    ]);

    $this->actingAs($admin)
        ->patch(route('usuarios.activo.update', $colaborador), ['activo' => false])
        ->assertRedirect();

    expect(DB::table('sessions')->where('user_id', $colaborador->id)->count())->toBe(0);
});

test('un usuario no puede deshabilitar su propia cuenta', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin)
        ->patch(route('usuarios.activo.update', $admin), ['activo' => false])
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($admin->fresh()->activo)->toBeTrue();
});

test('un usuario deshabilitado no puede iniciar sesión', function () {
    $user = User::factory()->create([
        'email' => 'inactivo@example.com',
        'password' => Hash::make('Password123!'),
        'activo' => false,
    ]);

    $this->post(route('login'), [
        'email' => 'inactivo@example.com',
        'password' => 'Password123!',
    ])->assertSessionHasErrors('email');

    $this->assertGuest();
});

test('un administrador puede eliminar a otro usuario', function () {
    $admin = User::factory()->create();
    $colaborador = User::factory()->create();

    $this->actingAs($admin)
        ->delete(route('usuarios.destroy', $colaborador))
        ->assertRedirect(route('usuarios.index'))
        ->assertSessionHas('success');

    expect(User::query()->find($colaborador->id))->toBeNull();
});

test('un usuario no puede eliminar su propia cuenta', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin)
        ->delete(route('usuarios.destroy', $admin))
        ->assertForbidden();

    expect(User::query()->find($admin->id))->not->toBeNull();
});

test('un usuario sin permiso eliminar no puede borrar usuarios', function () {
    $user = User::factory()->create();
    $user->syncRoles(['ventas']);

    $objetivo = User::factory()->create();

    $this->actingAs($user)
        ->delete(route('usuarios.destroy', $objetivo))
        ->assertForbidden();
});
