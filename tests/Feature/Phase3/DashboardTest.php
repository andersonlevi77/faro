<?php

use App\Models\Alquiler;
use App\Models\Cliente;
use App\Models\User;

test('el dashboard carga correctamente para un usuario autenticado', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('stats')
            ->has('stats.ingresosEseMes')
            ->has('stats.saldoPendienteTotal')
            ->has('stats.mantenimientosActivos')
            ->has('proximasDevoluciones')
            ->has('atrasados')
            ->has('productosStockBajo')
            ->has('mantenimientosPendientes')
        );
});

test('invitados son redirigidos desde el dashboard', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('el calendario carga correctamente', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('calendario'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('calendario')
            ->has('alquileres')
            ->has('anio')
            ->has('mes')
        );
});

test('el calendario incluye el cliente en los alquileres', function () {
    $user = User::factory()->create();
    $cliente = Cliente::factory()->create(['nombre' => 'Cliente Visible Calendario']);

    Alquiler::factory()->create([
        'cliente_id' => $cliente->id,
        'user_id' => $user->id,
        'fecha_inicio_prevista' => '2026-05-10',
        'fecha_fin_prevista' => '2026-05-12',
        'codigo' => '501',
    ]);

    $this->actingAs($user)
        ->get(route('calendario', ['anio' => 2026, 'mes' => 5]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('calendario')
            ->has('alquileres', 1)
            ->where('alquileres.0.cliente.nombre', 'Cliente Visible Calendario')
        );
});

test('el calendario acepta parametros de mes y año', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('calendario', ['anio' => 2026, 'mes' => 3]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('anio', 2026)
            ->where('mes', 3)
        );
});
