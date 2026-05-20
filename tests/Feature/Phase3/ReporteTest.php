<?php

use App\Models\User;

test('la página de reportes carga correctamente', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('reportes'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('reportes')
            ->has('ingresosPorMes')
            ->has('alquileresPorEstado')
            ->has('topProductos')
            ->has('mantenimientoPorMes')
            ->has('resumen')
            ->has('resumen.totalIngresos')
            ->has('resumen.totalMantenimiento')
            ->has('resumen.totalAlquileres')
        );
});

test('los reportes aceptan el parámetro de año', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('reportes', ['anio' => 2025]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('anio', 2025)
            ->has('ingresosPorMes', 12)
        );
});

test('invitados no pueden ver reportes', function () {
    $this->get(route('reportes'))->assertRedirect(route('login'));
});
