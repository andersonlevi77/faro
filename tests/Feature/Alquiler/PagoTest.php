<?php

use App\Enums\EstadoAlquiler;
use App\Enums\MetodoPago;
use App\Enums\TipoPago;
use App\Models\Alquiler;
use App\Models\Cliente;
use App\Models\Pago;
use App\Models\Producto;
use App\Models\User;

function crearAlquilerConLinea(): Alquiler
{
    $cliente = Cliente::factory()->create();
    $producto = Producto::factory()->create([
        'es_alquilable' => true,
        'stock_alquiler' => '10',
        'precio_alquiler_diario' => '20.00',
        'activo' => true,
    ]);

    $alquiler = Alquiler::factory()->create([
        'cliente_id' => $cliente->id,
        'estado' => EstadoAlquiler::Entregado->value,
        'deposito_monto' => '100.00',
        'total' => '200.00',
    ]);

    $alquiler->lineas()->create([
        'producto_id' => $producto->id,
        'cantidad' => '2',
        'dias' => 5,
        'precio_diario' => '20.00',
        'subtotal' => '200.00',
    ]);

    return $alquiler;
}

test('se puede registrar un pago en un alquiler', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $alquiler = crearAlquilerConLinea();

    $this->post(route('alquileres.pagos.store', $alquiler), [
        'tipo' => TipoPago::PagoAlquiler->value,
        'monto' => '100.00',
        'metodo_pago' => MetodoPago::Efectivo->value,
    ])->assertRedirect();

    expect($alquiler->pagos()->count())->toBe(1);
    expect($alquiler->pagos()->first()->monto)->toBe('100.00');
});

test('no se puede registrar pago con monto cero', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $alquiler = crearAlquilerConLinea();

    $this->post(route('alquileres.pagos.store', $alquiler), [
        'tipo' => TipoPago::PagoAlquiler->value,
        'monto' => '0',
        'metodo_pago' => MetodoPago::Efectivo->value,
    ])->assertSessionHasErrors('monto');
});

test('se puede eliminar un pago', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $alquiler = crearAlquilerConLinea();

    $pago = $alquiler->pagos()->create([
        'tipo' => TipoPago::Anticipo->value,
        'monto' => '50.00',
        'metodo_pago' => MetodoPago::Transferencia->value,
        'registrado_por' => $user->id,
    ]);

    $this->delete(route('alquileres.pagos.destroy', [$alquiler, $pago]))
        ->assertRedirect();

    expect(Pago::find($pago->id))->toBeNull();
});

test('el saldo pendiente se calcula correctamente', function () {
    $alquiler = crearAlquilerConLinea();

    $alquiler->pagos()->create([
        'tipo' => TipoPago::Deposito->value,
        'monto' => '100.00',
        'metodo_pago' => MetodoPago::Efectivo->value,
        'registrado_por' => null,
    ]);

    $alquiler->pagos()->create([
        'tipo' => TipoPago::PagoAlquiler->value,
        'monto' => '80.00',
        'metodo_pago' => MetodoPago::Efectivo->value,
        'registrado_por' => null,
    ]);

    expect($alquiler->fresh()->totalCobrado())->toBe('180.00');
    expect($alquiler->fresh()->saldoPendiente())->toBe('120.00');
});

test('la vista del alquiler refleja pagos de deposito en el saldo pendiente', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $alquiler = crearAlquilerConLinea();

    $alquiler->pagos()->create([
        'tipo' => TipoPago::Deposito->value,
        'monto' => '100.00',
        'metodo_pago' => MetodoPago::Efectivo->value,
        'registrado_por' => $user->id,
    ]);

    $this->get(route('alquileres.show', $alquiler))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('resumen.total_cobrado', '100.00')
            ->where('resumen.saldo_pendiente', '200.00')
        );
});

test('se puede registrar devolucion con daños', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $alquiler = crearAlquilerConLinea();
    $alquiler->update(['estado' => EstadoAlquiler::Entregado->value]);

    $this->post(route('alquileres.estado.update', $alquiler), [
        'estado' => EstadoAlquiler::Devuelto->value,
        'danio_descripcion' => 'Andamio doblado en una sección',
        'danio_monto' => '50.00',
        'deposito_devuelto' => '50.00',
    ])->assertRedirect();

    $actualizado = $alquiler->fresh();
    expect($actualizado->estadoEnum())->toBe(EstadoAlquiler::Devuelto);
    expect($actualizado->danio_descripcion)->toBe('Andamio doblado en una sección');
    expect($actualizado->danio_monto)->toBe('50.00');
    expect($actualizado->deposito_devuelto)->toBe('50.00');
});
