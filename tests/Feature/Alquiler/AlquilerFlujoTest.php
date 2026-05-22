<?php

use App\Enums\EstadoAlquiler;
use App\Models\Alquiler;
use App\Models\Categoria;
use App\Models\Cliente;
use App\Models\Marca;
use App\Models\Paquete;
use App\Models\Presentacion;
use App\Models\Producto;
use App\Models\User;
use App\Services\VerificadorDisponibilidadAlquiler;

test('invitados no pueden acceder a alquileres', function () {
    $this->get(route('alquileres.index'))->assertRedirect(route('login'));
});

test('formulario de nuevo alquiler incluye datos buscables de clientes y productos', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $marca = Marca::factory()->create(['nombre' => 'Bosch']);
    $cliente = Cliente::factory()->create([
        'nombre' => 'Agropecuaria El Ceibo',
        'documento' => '30456789012',
    ]);

    Producto::factory()->create([
        'nombre' => 'Taladro percutor',
        'codigo' => 'TAL-001',
        'marca_id' => $marca->id,
        'es_alquilable' => true,
        'precio_alquiler_diario' => '25.00',
        'activo' => true,
    ]);

    $this->get(route('alquileres.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('alquileres/alquileres/crear')
            ->has('clientes', 1)
            ->has('productosAlquiler', 1)
            ->where('clientes.0.documento', '30456789012')
            ->where('productosAlquiler.0.marca_nombre', 'Bosch'));
});

test('asigna codigos secuenciales numericos al crear alquileres', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    Alquiler::factory()->create(['codigo' => 'ALQ-LEGACY01']);

    $primero = Alquiler::factory()->create();
    $segundo = Alquiler::factory()->create();

    expect($primero->codigo)->toBe('1');
    expect($segundo->codigo)->toBe('2');
});

test('se puede guardar precio diario personalizado en lineas del alquiler creado', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $cliente = Cliente::factory()->create();
    $producto = Producto::factory()->create([
        'es_alquilable' => true,
        'stock_alquiler' => '10',
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
            [
                'producto_id' => $producto->id,
                'cantidad' => 1,
                'precio_diario' => 12.5,
            ],
        ],
    ])->assertRedirect();

    $linea = Alquiler::query()->firstOrFail()->lineas()->firstOrFail();
    expect((float) $linea->precio_diario)->toBe(12.5);
});

test('al crear alquiler queda en estado creado y reserva stock', function () {
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
    expect($alquiler->estadoEnum())->toBe(EstadoAlquiler::Creado);

    $this->post(route('alquileres.estado.update', $alquiler), [
        'estado' => EstadoAlquiler::Entregado->value,
    ])->assertRedirect();

    expect($alquiler->fresh()->estadoEnum())->toBe(EstadoAlquiler::Entregado);

    $historial = $alquiler->fresh()->historialEstados()->orderByDesc('id')->get();
    expect($historial)->toHaveCount(2);
    expect($historial[0]->estado_nuevo)->toBe(EstadoAlquiler::Entregado->value);
    expect($historial[1]->estado_nuevo)->toBe(EstadoAlquiler::Creado->value);
    expect($historial[0]->user_id)->toBe($user->id);

    $this->get(route('alquileres.show', $alquiler))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('historialEstados', 2)
            ->where('estadoActual.value', 'entregado')
            ->where('historialEstados.0.estado_nuevo_label', 'Entregado')
            ->where('historialEstados.1.estado_nuevo_label', 'Creado'));
});

test('no se puede crear alquiler si no hay stock suficiente', function () {
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
    ])->assertSessionHasErrors('lineas');

    expect(Alquiler::query()->count())->toBe(0);
});

test('se puede crear alquiler con linea de paquete validando disponibilidad', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $producto = Producto::factory()->create([
        'es_alquilable' => true,
        'stock_alquiler' => '10',
        'precio_alquiler_diario' => '50.00',
        'activo' => true,
    ]);

    $paquete = Paquete::factory()->create([
        'precio_alquiler' => '200.00',
        'activo' => true,
    ]);
    $paquete->productos()->attach($producto->id, ['cantidad' => 2]);

    $cliente = Cliente::factory()->create();
    $inicio = now()->addDay()->toDateString();
    $fin = now()->addDays(2)->toDateString();

    $this->post(route('alquileres.store'), [
        'cliente_id' => $cliente->id,
        'fecha_inicio_prevista' => $inicio,
        'fecha_fin_prevista' => $fin,
        'lineas' => [
            ['paquete_id' => $paquete->id, 'cantidad' => 3],
        ],
    ])->assertRedirect();

    $alquiler = Alquiler::query()->firstOrFail();
    $linea = $alquiler->lineas()->firstOrFail();

    expect($linea->paquete_id)->toBe($paquete->id);
    expect($linea->producto_id)->toBeNull();
    expect((float) $linea->cantidad)->toBe(3.0);
    expect((float) $linea->precio_diario)->toBe(200.0);
});

test('rechaza alquiler de paquete si supera disponibilidad de productos del kit', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $producto = Producto::factory()->create([
        'es_alquilable' => true,
        'stock_alquiler' => '10',
        'precio_alquiler_diario' => '50.00',
        'activo' => true,
    ]);

    $paquete = Paquete::factory()->create(['activo' => true]);
    $paquete->productos()->attach($producto->id, ['cantidad' => 2]);

    $cliente = Cliente::factory()->create();
    $inicio = now()->addDay()->toDateString();
    $fin = now()->addDays(2)->toDateString();

    $this->post(route('alquileres.store'), [
        'cliente_id' => $cliente->id,
        'fecha_inicio_prevista' => $inicio,
        'fecha_fin_prevista' => $fin,
        'lineas' => [
            ['paquete_id' => $paquete->id, 'cantidad' => 6],
        ],
    ])->assertSessionHasErrors('lineas');

    expect(Alquiler::query()->count())->toBe(0);
});

test('rechaza alquiler si paquete y producto sueltos superan el mismo stock', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $producto = Producto::factory()->create([
        'es_alquilable' => true,
        'stock_alquiler' => '10',
        'precio_alquiler_diario' => '50.00',
        'activo' => true,
    ]);

    $paquete = Paquete::factory()->create(['activo' => true]);
    $paquete->productos()->attach($producto->id, ['cantidad' => 2]);

    $cliente = Cliente::factory()->create();
    $inicio = now()->addDay()->toDateString();
    $fin = now()->addDays(2)->toDateString();

    $this->post(route('alquileres.store'), [
        'cliente_id' => $cliente->id,
        'fecha_inicio_prevista' => $inicio,
        'fecha_fin_prevista' => $fin,
        'lineas' => [
            ['paquete_id' => $paquete->id, 'cantidad' => 4],
            ['producto_id' => $producto->id, 'cantidad' => 3],
        ],
    ])->assertSessionHasErrors('lineas');

    expect(Alquiler::query()->count())->toBe(0);
});

test('la alerta de stock minimo no restringe alquileres solo notifica', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $producto = Producto::factory()->create([
        'es_alquilable' => true,
        'stock_alquiler' => '10',
        'stock_minimo' => 2,
        'precio_alquiler_diario' => '100.00',
        'activo' => true,
    ]);

    $cliente = Cliente::factory()->create();
    $inicio = now()->addDay()->toDateString();
    $fin = now()->addDays(3)->toDateString();

    $this->post(route('alquileres.store'), [
        'cliente_id' => $cliente->id,
        'fecha_inicio_prevista' => $inicio,
        'fecha_fin_prevista' => $fin,
        'lineas' => [
            ['producto_id' => $producto->id, 'cantidad' => 9],
        ],
    ])->assertRedirect();

    expect(app(VerificadorDisponibilidadAlquiler::class)->cantidadDisponibleActiva($producto->fresh()))->toBe('1');
});

test('disponibilidad actual resta unidades en alquileres creado y entregado', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $cliente = Cliente::factory()->create();
    $producto = Producto::factory()->create([
        'es_alquilable' => true,
        'stock_alquiler' => '30',
        'precio_alquiler_diario' => '250.00',
        'activo' => true,
    ]);

    $inicio = now()->addDay()->toDateString();
    $fin = now()->addDays(3)->toDateString();

    $this->post(route('alquileres.store'), [
        'cliente_id' => $cliente->id,
        'fecha_inicio_prevista' => $inicio,
        'fecha_fin_prevista' => $fin,
        'lineas' => [
            ['producto_id' => $producto->id, 'cantidad' => 10],
        ],
    ])->assertRedirect();

    $alquiler = Alquiler::query()->firstOrFail();
    $this->post(route('alquileres.estado.update', $alquiler), [
        'estado' => EstadoAlquiler::Entregado->value,
    ])->assertRedirect();

    $verificador = app(VerificadorDisponibilidadAlquiler::class);
    expect($verificador->cantidadDisponibleActiva($producto->fresh()))->toBe('20');

    $this->post(route('alquileres.store'), [
        'cliente_id' => $cliente->id,
        'fecha_inicio_prevista' => $inicio,
        'fecha_fin_prevista' => $fin,
        'lineas' => [
            ['producto_id' => $producto->id, 'cantidad' => 25],
        ],
    ])->assertSessionHasErrors('lineas');

    expect(Alquiler::query()->count())->toBe(1);
});

test('al devolver un alquiler el stock queda disponible de nuevo', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $cliente = Cliente::factory()->create();
    $producto = Producto::factory()->create([
        'es_alquilable' => true,
        'stock_alquiler' => '5',
        'precio_alquiler_diario' => '10.00',
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
        'estado' => EstadoAlquiler::Entregado->value,
    ]);

    $this->post(route('alquileres.estado.update', $alquiler->fresh()), [
        'estado' => EstadoAlquiler::Devuelto->value,
        'danio_monto' => '0',
    ]);

    expect($alquiler->fresh()->estadoEnum())->toBe(EstadoAlquiler::Devuelto);

    $this->post(route('alquileres.store'), [
        'cliente_id' => $cliente->id,
        'fecha_inicio_prevista' => $inicio,
        'fecha_fin_prevista' => $fin,
        'lineas' => [
            ['producto_id' => $producto->id, 'cantidad' => 5],
        ],
    ])->assertRedirect();
});
