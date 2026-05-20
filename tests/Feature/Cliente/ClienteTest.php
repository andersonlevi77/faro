<?php

use App\Models\Alquiler;
use App\Models\Cliente;
use App\Models\User;

test('invitados no pueden listar clientes', function () {
    $this->get(route('clientes.index'))->assertRedirect(route('login'));
});

test('usuario autenticado puede crear y listar clientes', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->post(route('clientes.store'), [
        'nombre' => 'Cliente Demo',
        'documento' => '12345678',
        'email' => 'demo@example.com',
    ])->assertRedirect(route('clientes.index'));

    $this->assertDatabaseHas('clientes', ['nombre' => 'Cliente Demo']);

    $this->get(route('clientes.index'))->assertOk();
});

test('no se puede eliminar un cliente con alquileres', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $cliente = Cliente::factory()->create();
    Alquiler::factory()->create(['cliente_id' => $cliente->id]);

    $this->delete(route('clientes.destroy', $cliente))->assertSessionHas('error');
});
