<?php

use App\Models\Alquiler;
use App\Models\Cliente;
use App\Models\Producto;
use App\Models\User;
use Database\Seeders\RenderSeeder;
use Illuminate\Support\Facades\Hash;

test('render seeder no borra datos operativos existentes', function () {
    User::factory()->create(['email' => 'otro@demo.com']);
    $cliente = Cliente::factory()->create();
    $producto = Producto::factory()->create();
    $alquiler = Alquiler::factory()->create();

    $clientesAntes = Cliente::query()->count();
    $productosAntes = Producto::query()->count();
    $alquileresAntes = Alquiler::query()->count();
    $usuariosAntes = User::query()->count();

    $this->seed(RenderSeeder::class);

    expect(User::query()->count())->toBeGreaterThanOrEqual($usuariosAntes);
    expect(Cliente::query()->count())->toBe($clientesAntes);
    expect(Producto::query()->count())->toBe($productosAntes);
    expect(Alquiler::query()->count())->toBe($alquileresAntes);
    expect(Cliente::query()->find($cliente->id))->not->toBeNull();
    expect(Producto::query()->find($producto->id))->not->toBeNull();
    expect(Alquiler::query()->find($alquiler->id))->not->toBeNull();
});

test('render seeder crea administrador y roles si la base esta vacia', function () {
    $this->seed(RenderSeeder::class);

    expect(User::query()->where('email', RenderSeeder::ADMIN_EMAIL)->exists())->toBeTrue();
    expect(Hash::check(RenderSeeder::ADMIN_PASSWORD, User::query()->first()->password))->toBeTrue();

    $admin = User::query()->where('email', RenderSeeder::ADMIN_EMAIL)->first();
    expect($admin->hasRole('administrador'))->toBeTrue();
});

test('render seeder es idempotente y no duplica el administrador', function () {
    $this->seed(RenderSeeder::class);
    $this->seed(RenderSeeder::class);

    expect(User::query()->where('email', RenderSeeder::ADMIN_EMAIL)->count())->toBe(1);
});
