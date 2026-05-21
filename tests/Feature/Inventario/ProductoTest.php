<?php

use App\Models\Categoria;
use App\Models\Marca;
use App\Models\Presentacion;
use App\Models\Producto;
use App\Models\User;

test('guests cannot access product index', function () {
    $response = $this->get(route('productos.index'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can view product index', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('productos.index'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('inventario/productos/index')->has('productos'));
});

test('authenticated users can access create product form', function () {
    $user = User::factory()->create();
    Categoria::factory()->create();
    Marca::factory()->create();
    Presentacion::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('productos.create'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('inventario/productos/crear')
        ->has('categorias')
        ->has('marcas')
        ->has('presentaciones'));
});

test('authenticated users can store a valid rental product', function () {
    $user = User::factory()->create();
    $categoria = Categoria::factory()->create();
    $marca = Marca::factory()->create();
    $presentacion = Presentacion::factory()->create();
    $this->actingAs($user);

    $response = $this->post(route('productos.store'), [
        'nombre' => 'Andamio 2m',
        'codigo' => 'PRD-001',
        'descripcion' => 'Andamio metálico',
        'marca_id' => $marca->id,
        'categoria_id' => $categoria->id,
        'presentacion_id' => $presentacion->id,
        'activo' => true,
        'es_alquilable' => true,
        'tracking_mode' => 'bulk',
        'precio_alquiler_diario' => 75.00,
        'deposito_unitario' => 500.00,
        'stock_alquiler' => 12,
        'stock_minimo' => 2,
    ]);

    $response->assertRedirect(route('productos.index'));
    $this->assertDatabaseHas('productos', [
        'codigo' => 'PRD-001',
        'nombre' => 'Andamio 2m',
        'es_alquilable' => true,
        'precio_alquiler_diario' => '75.00',
    ]);
});

test('product store validation fails with invalid data', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->post(route('productos.store'), [
        'nombre' => '',
        'codigo' => '',
        'es_alquilable' => true,
        'precio_alquiler_diario' => -1,
    ]);

    $response->assertSessionHasErrors(['nombre', 'codigo', 'precio_alquiler_diario']);
});

test('authenticated users can view and update a product', function () {
    $user = User::factory()->create();
    $producto = Producto::factory()->alquilableBulk()->create();
    $this->actingAs($user);

    $response = $this->get(route('productos.edit', $producto));
    $response->assertOk();

    $response = $this->put(route('productos.update', $producto), [
        'nombre' => 'Producto actualizado',
        'codigo' => $producto->codigo,
        'activo' => true,
        'es_alquilable' => true,
        'tracking_mode' => 'bulk',
        'precio_alquiler_diario' => 90.00,
        'stock_alquiler' => 8,
    ]);

    $response->assertRedirect(route('productos.index'));
    $producto->refresh();
    expect($producto->nombre)->toBe('Producto actualizado');
    expect($producto->precio_alquiler_diario)->toBe('90.00');
});
