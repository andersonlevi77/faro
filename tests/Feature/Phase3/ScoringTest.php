<?php

use App\Enums\EstadoAlquiler;
use App\Models\Alquiler;
use App\Models\Cliente;

test('un cliente sin alquileres comienza con puntuación base de 50', function () {
    $cliente = Cliente::factory()->create();

    expect($cliente->puntuacion())->toBe(50);
    expect($cliente->etiquetaPuntuacion())->toBe('Regular');
});

test('alquileres cerrados suben la puntuación', function () {
    $cliente = Cliente::factory()->create();

    Alquiler::factory()->count(6)->create([
        'cliente_id' => $cliente->id,
        'estado' => EstadoAlquiler::Cerrado->value,
    ]);

    // 50 base + 6 * 5 = 80
    expect($cliente->puntuacion())->toBe(80);
    expect($cliente->etiquetaPuntuacion())->toBe('Excelente');
});

test('alquileres cancelados bajan la puntuación', function () {
    $cliente = Cliente::factory()->create();

    Alquiler::factory()->count(3)->create([
        'cliente_id' => $cliente->id,
        'estado' => EstadoAlquiler::Cancelado->value,
    ]);

    // 50 - 3*10 = 20
    expect($cliente->puntuacion())->toBe(20);
    expect($cliente->etiquetaPuntuacion())->toBe('Bajo');
});

test('la puntuación no supera 100 ni baja de 0', function () {
    $cliente = Cliente::factory()->create();

    // 50 + 11*5 = 105 → clamped to 100
    Alquiler::factory()->count(11)->create([
        'cliente_id' => $cliente->id,
        'estado' => EstadoAlquiler::Cerrado->value,
    ]);

    expect($cliente->puntuacion())->toBeLessThanOrEqual(100);

    $clienteMalo = Cliente::factory()->create();
    Alquiler::factory()->count(10)->create([
        'cliente_id' => $clienteMalo->id,
        'estado' => EstadoAlquiler::Cancelado->value,
    ]);

    expect($clienteMalo->puntuacion())->toBeGreaterThanOrEqual(0);
});

test('devolución a tiempo suma puntos', function () {
    $cliente = Cliente::factory()->create();

    Alquiler::factory()->create([
        'cliente_id' => $cliente->id,
        'estado' => EstadoAlquiler::Devuelto->value,
        'fecha_fin_prevista' => now()->subDays(3)->toDateString(),
        'fecha_devolucion_at' => now()->subDays(5)->toDateString(),
    ]);

    // 50 + 2 devolucion a tiempo = 52
    expect($cliente->puntuacion())->toBe(52);
});
