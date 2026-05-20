<?php

use App\Enums\EstadoAlquiler;
use App\Enums\EstadoUnidad;
use App\Models\Alquiler;
use App\Models\Cliente;
use App\Models\Producto;
use App\Models\ProductoUnidad;
use App\Models\User;

test('se pueden generar unidades automáticamente para un producto individual', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $producto = Producto::factory()->alquilableIndividual()->create();

    $this->post(route('productos.unidades.store', $producto), [
        'cantidad_generar' => 5,
    ])->assertRedirect();

    expect($producto->unidades()->count())->toBe(5);
    expect($producto->unidades()->where('estado', EstadoUnidad::Disponible->value)->count())->toBe(5);
});

test('se puede registrar una unidad con código manual', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $producto = Producto::factory()->alquilableIndividual()->create();

    $this->post(route('productos.unidades.store', $producto), [
        'codigo' => 'TOLDO-001',
    ])->assertRedirect();

    expect(ProductoUnidad::query()->where('codigo', 'TOLDO-001')->exists())->toBeTrue();
});

test('no se puede crear unidad sin código ni cantidad', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $producto = Producto::factory()->alquilableIndividual()->create();

    $this->post(route('productos.unidades.store', $producto), [])
        ->assertSessionHasErrors('codigo');
});

test('se puede cambiar el estado de una unidad', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $unidad = ProductoUnidad::factory()->disponible()->create();

    $this->put(route('unidades.update', $unidad), [
        'codigo' => $unidad->codigo,
        'estado' => EstadoUnidad::Mantenimiento->value,
        'notas' => 'Soldadura rota',
    ])->assertRedirect();

    expect($unidad->fresh()->estado)->toBe(EstadoUnidad::Mantenimiento);
    expect($unidad->fresh()->notas)->toBe('Soldadura rota');
});

test('no se puede eliminar una unidad alquilada', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $unidad = ProductoUnidad::factory()->alquilado()->create();

    $this->delete(route('unidades.destroy', $unidad))->assertSessionHas('error');

    expect(ProductoUnidad::query()->find($unidad->id))->not->toBeNull();
});

test('reservar alquiler individual asigna unidades disponibles', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $producto = Producto::factory()->alquilableIndividual()->create();
    ProductoUnidad::factory()->disponible()->count(5)->create(['producto_id' => $producto->id]);

    $cliente = Cliente::factory()->create();
    $inicio = now()->addDay()->toDateString();
    $fin = now()->addDays(5)->toDateString();

    $this->post(route('alquileres.store'), [
        'cliente_id' => $cliente->id,
        'fecha_inicio_prevista' => $inicio,
        'fecha_fin_prevista' => $fin,
        'lineas' => [['producto_id' => $producto->id, 'cantidad' => 3]],
    ])->assertRedirect();

    $alquiler = Alquiler::query()->firstOrFail();

    $this->post(route('alquileres.estado.update', $alquiler), [
        'estado' => EstadoAlquiler::Reservado->value,
    ])->assertRedirect();

    expect($alquiler->fresh()->estadoEnum())->toBe(EstadoAlquiler::Reservado);
    expect($producto->unidades()->where('estado', EstadoUnidad::Reservado->value)->count())->toBe(3);
    expect($producto->unidades()->where('estado', EstadoUnidad::Disponible->value)->count())->toBe(2);
});

test('no se puede reservar alquiler individual sin unidades suficientes', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $producto = Producto::factory()->alquilableIndividual()->create();
    ProductoUnidad::factory()->disponible()->count(2)->create(['producto_id' => $producto->id]);

    $cliente = Cliente::factory()->create();
    $inicio = now()->addDay()->toDateString();
    $fin = now()->addDays(3)->toDateString();

    $this->post(route('alquileres.store'), [
        'cliente_id' => $cliente->id,
        'fecha_inicio_prevista' => $inicio,
        'fecha_fin_prevista' => $fin,
        'lineas' => [['producto_id' => $producto->id, 'cantidad' => 5]],
    ]);

    $alquiler = Alquiler::query()->firstOrFail();

    $this->post(route('alquileres.estado.update', $alquiler), [
        'estado' => EstadoAlquiler::Reservado->value,
    ])->assertSessionHas('error');

    expect($producto->unidades()->where('estado', EstadoUnidad::Disponible->value)->count())->toBe(2);
});

test('devolver un alquiler individual libera las unidades', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $producto = Producto::factory()->alquilableIndividual()->create();
    ProductoUnidad::factory()->disponible()->count(3)->create(['producto_id' => $producto->id]);

    $cliente = Cliente::factory()->create();
    $inicio = now()->addDay()->toDateString();
    $fin = now()->addDays(5)->toDateString();

    $this->post(route('alquileres.store'), [
        'cliente_id' => $cliente->id,
        'fecha_inicio_prevista' => $inicio,
        'fecha_fin_prevista' => $fin,
        'lineas' => [['producto_id' => $producto->id, 'cantidad' => 3]],
    ]);

    $alquiler = Alquiler::query()->firstOrFail();

    foreach ([EstadoAlquiler::Reservado, EstadoAlquiler::Entregado, EstadoAlquiler::EnUso, EstadoAlquiler::Devuelto] as $estado) {
        $this->post(route('alquileres.estado.update', $alquiler), ['estado' => $estado->value]);
    }

    expect($alquiler->fresh()->estadoEnum())->toBe(EstadoAlquiler::Devuelto);
    expect($producto->unidades()->where('estado', EstadoUnidad::Disponible->value)->count())->toBe(3);
});
