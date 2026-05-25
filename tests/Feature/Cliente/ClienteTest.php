<?php

use App\Enums\MetodoPago;
use App\Enums\TipoPago;
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
        'codigo' => 'CLI-001',
        'nombre' => 'Cliente Demo',
        'documento' => '12345678',
        'email' => 'demo@example.com',
    ])->assertRedirect(route('clientes.index'));

    $this->assertDatabaseHas('clientes', [
        'codigo' => 'CLI-001',
        'nombre' => 'Cliente Demo',
    ]);

    $this->get(route('clientes.index'))->assertOk();
});

test('se puede ver el detalle de un cliente con pagos de alquiler', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $cliente = Cliente::factory()->create();
    $alquiler = Alquiler::factory()->create(['cliente_id' => $cliente->id]);

    $alquiler->pagos()->create([
        'tipo' => TipoPago::PagoAlquiler->value,
        'monto' => '150.00',
        'metodo_pago' => MetodoPago::Efectivo->value,
        'registrado_por' => $user->id,
    ]);

    $this->get(route('clientes.show', $cliente))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('alquileres/clientes/ver')
            ->where('totalPagado', '150.00')
        );
});

test('los errores de validación de cliente se muestran en español', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    Cliente::factory()->create(['documento' => '12345678']);

    $response = $this->from(route('clientes.create'))
        ->post(route('clientes.store'), [
            'nombre' => 'Otro Cliente',
            'documento' => '12345678',
        ]);

    $response
        ->assertRedirect(route('clientes.create'))
        ->assertSessionHasErrors([
            'documento' => 'El documento ya está en uso.',
        ]);
});

test('el teléfono debe tener exactamente 8 dígitos', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->post(route('clientes.store'), [
        'nombre' => 'Cliente Teléfono',
        'telefono' => '50202305656',
    ])->assertSessionHasErrors('telefono');

    $this->post(route('clientes.store'), [
        'nombre' => 'Cliente Teléfono',
        'telefono' => '12345678',
    ])->assertRedirect(route('clientes.index'));

    $this->assertDatabaseHas('clientes', [
        'nombre' => 'Cliente Teléfono',
        'telefono' => '12345678',
    ]);
});

test('no se puede eliminar un cliente con alquileres', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $cliente = Cliente::factory()->create();
    Alquiler::factory()->create(['cliente_id' => $cliente->id]);

    $this->delete(route('clientes.destroy', $cliente))->assertSessionHas('error');
});
