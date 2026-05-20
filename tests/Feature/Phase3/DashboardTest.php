<?php

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
