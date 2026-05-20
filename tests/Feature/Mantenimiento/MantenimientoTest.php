<?php

use App\Enums\EstadoMantenimiento;
use App\Enums\EstadoUnidad;
use App\Models\Mantenimiento;
use App\Models\Producto;
use App\Models\ProductoUnidad;
use App\Models\User;

test('se puede crear un mantenimiento para una unidad individual', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $unidad = ProductoUnidad::factory()->disponible()->create();

    $this->post(route('mantenimientos.store'), [
        'producto_unidad_id' => $unidad->id,
        'titulo' => 'Revisión de estructura',
        'descripcion' => 'Verificar soldaduras',
        'costo' => '150.00',
    ])->assertRedirect();

    expect(Mantenimiento::query()->count())->toBe(1);
    $mant = Mantenimiento::query()->first();
    expect($mant->titulo)->toBe('Revisión de estructura');
    expect($mant->estado)->toBe(EstadoMantenimiento::Pendiente);
});

test('crear mantenimiento pone la unidad en estado mantenimiento', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $unidad = ProductoUnidad::factory()->disponible()->create();
    expect($unidad->estado)->toBe(EstadoUnidad::Disponible);

    $this->post(route('mantenimientos.store'), [
        'producto_unidad_id' => $unidad->id,
        'titulo' => 'Limpieza general',
    ])->assertRedirect();

    expect($unidad->fresh()->estado)->toBe(EstadoUnidad::Mantenimiento);
});

test('completar mantenimiento libera la unidad como disponible', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $unidad = ProductoUnidad::factory()->enMantenimiento()->create();

    $mantenimiento = Mantenimiento::factory()->create([
        'producto_unidad_id' => $unidad->id,
        'estado' => EstadoMantenimiento::EnProceso->value,
    ]);

    $this->put(route('mantenimientos.update', $mantenimiento), [
        'estado' => EstadoMantenimiento::Completado->value,
        'costo' => '200.00',
        'notas' => 'Trabajo finalizado sin inconvenientes',
    ])->assertRedirect();

    $mant = $mantenimiento->fresh();
    expect($mant->estado)->toBe(EstadoMantenimiento::Completado);
    expect($mant->fecha_fin_at)->not->toBeNull();
    expect($mant->resuelto_por)->toBe($user->id);

    expect($unidad->fresh()->estado)->toBe(EstadoUnidad::Disponible);
});

test('al marcar en_proceso se registra la fecha de inicio', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $mantenimiento = Mantenimiento::factory()->create([
        'estado' => EstadoMantenimiento::Pendiente->value,
        'fecha_inicio_at' => null,
    ]);

    $this->put(route('mantenimientos.update', $mantenimiento), [
        'estado' => EstadoMantenimiento::EnProceso->value,
        'costo' => '0',
    ])->assertRedirect();

    expect($mantenimiento->fresh()->fecha_inicio_at)->not->toBeNull();
});

test('se puede crear mantenimiento sin unidad para producto general', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $producto = Producto::factory()->create(['activo' => true]);

    $this->post(route('mantenimientos.store'), [
        'producto_id' => $producto->id,
        'titulo' => 'Mantenimiento preventivo',
        'fecha_programada' => now()->addWeek()->toDateString(),
    ])->assertRedirect();

    expect(Mantenimiento::query()->count())->toBe(1);
});

test('titulo es requerido para crear mantenimiento', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->post(route('mantenimientos.store'), [
        'titulo' => '',
    ])->assertSessionHasErrors('titulo');
});
