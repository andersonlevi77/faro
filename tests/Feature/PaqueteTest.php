<?php

use App\Models\Alquiler;
use App\Models\Paquete;
use App\Models\Producto;
use App\Models\User;

test('usuario autenticado puede listar y crear paquetes', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $producto = Producto::factory()->create([
        'es_alquilable' => true,
        'activo' => true,
        'stock_alquiler' => '20',
    ]);

    $this->get(route('paquetes.index'))->assertOk();

    $this->post(route('paquetes.store'), [
        'nombre' => 'Kit andamio',
        'codigo' => 'KIT-01',
        'descripcion' => 'Dos toldos y dos andamios',
        'precio_alquiler' => '150.00',
        'activo' => true,
        'items' => [
            ['producto_id' => $producto->id, 'cantidad' => 2],
        ],
    ])->assertRedirect(route('paquetes.index'));

    $paquete = Paquete::query()->where('codigo', 'KIT-01')->firstOrFail();
    expect($paquete->productos)->toHaveCount(1);
    expect((float) $paquete->productos->first()->pivot->cantidad)->toBe(2.0);
});

test('usuario autenticado puede ver detalle de paquete', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $producto = Producto::factory()->create([
        'es_alquilable' => true,
        'activo' => true,
        'stock_alquiler' => '10',
    ]);

    $paquete = Paquete::factory()->create([
        'nombre' => 'Kit eventos',
        'codigo' => 'KIT-EV',
        'descripcion' => 'Toldos y mesas',
        'precio_alquiler' => '500.00',
        'activo' => true,
    ]);
    $paquete->productos()->attach($producto->id, ['cantidad' => 2]);

    $this->get(route('paquetes.show', $paquete))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('paquetes/ver')
            ->where('paquete.nombre', 'Kit eventos')
            ->where('paquete.codigo', 'KIT-EV')
            ->has('paquete.productos', 1)
            ->where('paquete.productos.0.cantidad', '2')
        );
});

test('no se puede eliminar paquete usado en alquiler', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $paquete = Paquete::factory()->create();
    $paquete->alquilerLineas()->create([
        'alquiler_id' => Alquiler::factory()->create()->id,
        'cantidad' => '1',
        'dias' => 1,
        'precio_diario' => '100',
        'subtotal' => '100',
    ]);

    $this->delete(route('paquetes.destroy', $paquete))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect(Paquete::find($paquete->id))->not->toBeNull();
});
