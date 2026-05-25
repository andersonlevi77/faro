<?php

use App\Enums\EstadoAlquiler;
use App\Enums\MetodoPago;
use App\Enums\TipoPago;
use App\Models\Alquiler;
use App\Models\Cliente;
use App\Models\Producto;
use App\Models\User;

function crearAlquilerImprimible(User $user): array
{
    $cliente = Cliente::factory()->create([
        'codigo' => 'CLI-PRINT',
        'nombre' => 'Cliente de Impresión',
        'documento' => '1234567-8',
    ]);

    $producto = Producto::factory()->create([
        'nombre' => 'Andamio profesional',
        'codigo' => 'AND-001',
        'es_alquilable' => true,
        'stock_alquiler' => '10',
        'precio_alquiler_diario' => '75.00',
        'activo' => true,
    ]);

    $alquiler = Alquiler::factory()->create([
        'cliente_id' => $cliente->id,
        'user_id' => $user->id,
        'estado' => EstadoAlquiler::Entregado->value,
        'deposito_monto' => '100.00',
        'total' => '300.00',
    ]);

    $alquiler->lineas()->create([
        'producto_id' => $producto->id,
        'cantidad' => '2',
        'dias' => 2,
        'precio_diario' => '75.00',
        'subtotal' => '300.00',
    ]);

    $pago = $alquiler->pagos()->create([
        'tipo' => TipoPago::Deposito->value,
        'monto' => '100.00',
        'metodo_pago' => MetodoPago::Efectivo->value,
        'notas' => 'Pago inicial de garantía',
        'registrado_por' => $user->id,
    ]);

    return [$alquiler, $pago];
}

test('usuario autenticado puede imprimir el comprobante del alquiler', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    [$alquiler] = crearAlquilerImprimible($user);

    $this->get(route('alquileres.print', $alquiler))
        ->assertSuccessful()
        ->assertSee('Comprobante de alquiler')
        ->assertSee('Cliente de Impresión')
        ->assertSee($alquiler->codigo);
});

test('usuario autenticado puede imprimir el recibo de un pago', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    [$alquiler, $pago] = crearAlquilerImprimible($user);

    $this->get(route('alquileres.pagos.print', [$alquiler, $pago]))
        ->assertSuccessful()
        ->assertSee('Recibo de pago')
        ->assertSee('Pago inicial de garantía')
        ->assertSee($alquiler->codigo.'-'.$pago->id);
});
