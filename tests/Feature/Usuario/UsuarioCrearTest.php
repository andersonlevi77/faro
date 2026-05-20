<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('un administrador puede ver el formulario de crear usuario', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin)
        ->get(route('usuarios.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('usuarios/crear')
            ->has('roles'));
});

test('un administrador puede crear un usuario con contraseña y roles', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin)
        ->post(route('usuarios.store'), [
            'name' => 'Colaborador Nuevo',
            'email' => 'colaborador@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'roles' => ['ventas'],
        ])
        ->assertRedirect(route('usuarios.index'));

    $creado = User::query()->where('email', 'colaborador@example.com')->first();
    expect($creado)->not->toBeNull()
        ->and($creado->name)->toBe('Colaborador Nuevo')
        ->and($creado->email_verified_at)->not->toBeNull()
        ->and(Hash::check('Password123!', $creado->password))->toBeTrue()
        ->and($creado->hasRole('ventas'))->toBeTrue();
});

test('un usuario sin permiso crear no puede crear usuarios', function () {
    $user = User::factory()->create();
    $user->syncRoles(['ventas']);

    $this->actingAs($user)
        ->get(route('usuarios.create'))
        ->assertForbidden();

    $this->actingAs($user)
        ->post(route('usuarios.store'), [
            'name' => 'Intento',
            'email' => 'intento@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])
        ->assertForbidden();
});

test('valida email duplicado al crear usuario', function () {
    $admin = User::factory()->create();
    User::factory()->create(['email' => 'existente@example.com']);

    $this->actingAs($admin)
        ->post(route('usuarios.store'), [
            'name' => 'Otro',
            'email' => 'existente@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])
        ->assertSessionHasErrors('email');
});
