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

test('authenticated users can store a valid product', function () {
    $user = User::factory()->create();
    $categoria = Categoria::factory()->create();
    $marca = Marca::factory()->create();
    $presentacion = Presentacion::factory()->create();
    $this->actingAs($user);

    $response = $this->post(route('productos.store'), [
        'nombre' => 'Paracetamol 500mg',
        'codigo' => 'PRD-001',
        'descripcion' => 'Analgésico',
        'marca_id' => $marca->id,
        'categoria_id' => $categoria->id,
        'presentacion_id' => $presentacion->id,
        'precio_compra' => 2.50,
        'precio_venta' => 5.00,
        'activo' => true,
    ]);

    $response->assertRedirect(route('productos.index'));
    $this->assertDatabaseHas('productos', [
        'codigo' => 'PRD-001',
        'nombre' => 'Paracetamol 500mg',
    ]);
});

test('product store validation fails with invalid data', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->post(route('productos.store'), [
        'nombre' => '',
        'codigo' => '',
        'precio_compra' => -1,
        'precio_venta' => '',
    ]);

    $response->assertSessionHasErrors(['nombre', 'codigo', 'precio_compra', 'precio_venta']);
});

test('authenticated users can view and update a product', function () {
    $user = User::factory()->create();
    $producto = Producto::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('productos.edit', $producto));
    $response->assertOk();

    $response = $this->put(route('productos.update', $producto), [
        'nombre' => 'Producto actualizado',
        'codigo' => $producto->codigo,
        'precio_compra' => 3.00,
        'precio_venta' => 6.00,
        'activo' => true,
    ]);

    $response->assertRedirect(route('productos.index'));
    $producto->refresh();
    expect($producto->nombre)->toBe('Producto actualizado');
});
