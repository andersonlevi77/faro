<?php

use App\Enums\EstadoAlquiler;
use App\Models\Alquiler;
use App\Models\Categoria;
use App\Models\Cliente;
use App\Models\Marca;
use App\Models\Presentacion;
use App\Models\Producto;
use App\Models\User;

test('invitados no pueden acceder a alquileres', function () {
    $this->get(route('alquileres.index'))->assertRedirect(route('login'));
});

test('se puede crear un borrador y pasar a reservado con stock suficiente', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $cliente = Cliente::factory()->create();
    $categoria = Categoria::factory()->create();
    $marca = Marca::factory()->create();
    $presentacion = Presentacion::factory()->create();

    $producto = Producto::factory()->create([
        'categoria_id' => $categoria->id,
        'marca_id' => $marca->id,
        'presentacion_id' => $presentacion->id,
        'es_alquilable' => true,
        'stock_alquiler' => '10',
        'precio_alquiler_diario' => '5.00',
        'activo' => true,
    ]);

    $inicio = now()->addDay()->toDateString();
    $fin = now()->addDays(5)->toDateString();

    $this->post(route('alquileres.store'), [
        'cliente_id' => $cliente->id,
        'fecha_inicio_prevista' => $inicio,
        'fecha_fin_prevista' => $fin,
        'lineas' => [
            ['producto_id' => $producto->id, 'cantidad' => 2],
        ],
    ])->assertRedirect();

    $alquiler = Alquiler::query()->firstOrFail();
    expect($alquiler->estadoEnum())->toBe(EstadoAlquiler::Borrador);

    $this->post(route('alquileres.estado.update', $alquiler), [
        'estado' => EstadoAlquiler::Reservado->value,
    ])->assertRedirect();

    expect($alquiler->fresh()->estadoEnum())->toBe(EstadoAlquiler::Reservado);
});

test('no se puede reservar si no hay stock suficiente', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $cliente = Cliente::factory()->create();
    $categoria = Categoria::factory()->create();
    $marca = Marca::factory()->create();
    $presentacion = Presentacion::factory()->create();

    $producto = Producto::factory()->create([
        'categoria_id' => $categoria->id,
        'marca_id' => $marca->id,
        'presentacion_id' => $presentacion->id,
        'es_alquilable' => true,
        'stock_alquiler' => '1',
        'precio_alquiler_diario' => '5.00',
        'activo' => true,
    ]);

    $inicio = now()->addDay()->toDateString();
    $fin = now()->addDays(3)->toDateString();

    $this->post(route('alquileres.store'), [
        'cliente_id' => $cliente->id,
        'fecha_inicio_prevista' => $inicio,
        'fecha_fin_prevista' => $fin,
        'lineas' => [
            ['producto_id' => $producto->id, 'cantidad' => 5],
        ],
    ]);

    $alquiler = Alquiler::query()->firstOrFail();

    $this->post(route('alquileres.estado.update', $alquiler), [
        'estado' => EstadoAlquiler::Reservado->value,
    ])->assertSessionHas('error');
});
