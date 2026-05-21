<?php

use App\Models\Categoria;
use App\Models\Marca;
use App\Models\User;

test('guests cannot create catalog items', function () {
    $this->postJson(route('marcas.store'), ['nombre' => 'Nueva marca'])
        ->assertUnauthorized();
});

test('authenticated users can create marca via json', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->postJson(route('marcas.store'), ['nombre' => 'Marca rápida']);

    $response->assertCreated()
        ->assertJson([
            'nombre' => 'Marca rápida',
        ]);

    expect($response->json('id'))->toBeInt();

    $this->assertDatabaseHas('marcas', [
        'nombre' => 'Marca rápida',
        'creado_por' => $user->id,
    ]);
});

test('authenticated users can create categoria via json', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->postJson(route('categorias.store'), ['nombre' => 'Herramientas eléctricas']);

    $response->assertCreated()
        ->assertJson([
            'nombre' => 'Herramientas eléctricas',
        ]);

    $categoria = Categoria::query()->where('nombre', 'Herramientas eléctricas')->first();
    expect($categoria)->not->toBeNull()
        ->and($categoria->slug)->toBe('herramientas-electricas');
});

test('authenticated users can create presentacion via json', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->postJson(route('presentaciones.store'), ['nombre' => 'Caja x 12']);

    $response->assertCreated()
        ->assertJson(['nombre' => 'Caja x 12']);

    $this->assertDatabaseHas('presentaciones', ['nombre' => 'Caja x 12']);
});

test('duplicate marca name returns validation error', function () {
    $user = User::factory()->create();
    Marca::factory()->create(['nombre' => 'Duplicada']);
    $this->actingAs($user);

    $this->postJson(route('marcas.store'), ['nombre' => 'Duplicada'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['nombre']);
});

test('categoria slug collision is resolved with suffix', function () {
    $user = User::factory()->create();
    Categoria::factory()->create(['nombre' => 'Test', 'slug' => 'test']);
    $this->actingAs($user);

    $response = $this->postJson(route('categorias.store'), ['nombre' => 'Test']);

    $response->assertCreated();

    expect(Categoria::query()->where('slug', 'test-2')->exists())->toBeTrue();
});
