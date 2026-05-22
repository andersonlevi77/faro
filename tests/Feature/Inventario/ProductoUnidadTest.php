<?php

use App\Enums\EstadoUnidad;
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
