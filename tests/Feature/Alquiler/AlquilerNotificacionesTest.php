<?php

use App\Enums\EstadoAlquiler;
use App\Models\Alquiler;
use App\Models\User;
use App\Services\ConsultaAlquileresNotificaciones;

test('comparte alquileres proximos y atrasados en inertia para usuarios con permiso', function () {
    $user = User::factory()->create();

    Alquiler::factory()->create([
        'estado' => EstadoAlquiler::Entregado,
        'fecha_fin_prevista' => now()->addDays(3)->toDateString(),
    ]);

    Alquiler::factory()->create([
        'estado' => EstadoAlquiler::Entregado,
        'fecha_fin_prevista' => now()->subDays(2)->toDateString(),
    ]);

    $this->actingAs($user)
        ->get(route('calendario'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('alquilerNotificaciones')
            ->where('alquilerNotificaciones.total', 2)
            ->has('alquilerNotificaciones.proximos', 1)
            ->has('alquilerNotificaciones.atrasados', 1)
        );
});

test('no comparte notificaciones de alquileres sin permiso', function () {
    $user = User::factory()->create();
    $user->syncRoles([]);
    $user->syncPermissions([]);

    $this->actingAs($user)
        ->get(route('calendario'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('alquilerNotificaciones', null));
});

test('el servicio agrupa proximos en ventana de dias y atrasados', function () {
    Alquiler::factory()->create([
        'estado' => EstadoAlquiler::Creado,
        'fecha_fin_prevista' => now()->addDays(5)->toDateString(),
    ]);

    Alquiler::factory()->create([
        'estado' => EstadoAlquiler::Entregado,
        'fecha_fin_prevista' => now()->addDays(20)->toDateString(),
    ]);

    Alquiler::factory()->create([
        'estado' => EstadoAlquiler::Entregado,
        'fecha_fin_prevista' => now()->subDay()->toDateString(),
    ]);

    $datos = (new ConsultaAlquileresNotificaciones(diasVentana: 7, limite: 10))->paraCompartir();

    expect($datos['proximos'])->toHaveCount(1)
        ->and($datos['atrasados'])->toHaveCount(1)
        ->and($datos['total'])->toBe(2);
});
