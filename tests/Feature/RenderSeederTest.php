<?php

use App\Models\Alquiler;
use App\Models\Cliente;
use App\Models\Producto;
use App\Models\User;
use Database\Seeders\RenderSeeder;
use Illuminate\Support\Facades\Hash;

test('render seeder leaves only the administrator and empty operational data', function () {
    User::factory()->create(['email' => 'otro@demo.com']);
    Cliente::factory()->create();
    Producto::factory()->create();
    Alquiler::factory()->create();

    $this->seed(RenderSeeder::class);

    expect(User::query()->count())->toBe(1);
    expect(User::query()->where('email', RenderSeeder::ADMIN_EMAIL)->exists())->toBeTrue();
    expect(Hash::check(RenderSeeder::ADMIN_PASSWORD, User::first()->password))->toBeTrue();

    expect(Cliente::query()->count())->toBe(0);
    expect(Producto::query()->count())->toBe(0);
    expect(Alquiler::query()->count())->toBe(0);

    $admin = User::query()->first();
    expect($admin->hasRole('administrador'))->toBeTrue();
});
