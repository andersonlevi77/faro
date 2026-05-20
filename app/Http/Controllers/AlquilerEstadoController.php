<?php

namespace App\Http\Controllers;

use App\Enums\EstadoAlquiler;
use App\Http\Requests\UpdateAlquilerEstadoRequest;
use App\Models\Alquiler;
use App\Services\VerificadorDisponibilidadAlquiler;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class AlquilerEstadoController extends Controller
{
    public function update(UpdateAlquilerEstadoRequest $request, Alquiler $alquiler, VerificadorDisponibilidadAlquiler $verificador): RedirectResponse
    {
        $this->authorize('cambiarEstado', $alquiler);

        $nuevo = EstadoAlquiler::from($request->validated('estado'));
        $actual = $alquiler->estadoEnum();

        if (! $actual->puedeTransicionarA($nuevo)) {
            return back()->with(
                'error',
                'Transición de estado no permitida desde «'.$actual->etiqueta().'» hacia «'.$nuevo->etiqueta().'».',
            );
        }

        if ($nuevo === EstadoAlquiler::Reservado) {
            $alquiler->load('lineas');
            if ($alquiler->lineas->isEmpty()) {
                return back()->with('error', 'Agrega al menos una línea antes de reservar.');
            }
            if (! $verificador->alquilerTieneStockSuficiente($alquiler)) {
                return back()->with('error', 'No hay stock de alquiler suficiente para las fechas y cantidades indicadas.');
            }
        }

        DB::transaction(function () use ($request, $alquiler, $nuevo, $verificador): void {
            if ($nuevo === EstadoAlquiler::Reservado) {
                $verificador->asignarUnidades($alquiler);
            }

            $verificador->actualizarEstadoUnidades($alquiler, $nuevo);

            $alquiler->estado = $nuevo;

            if ($nuevo === EstadoAlquiler::Entregado && $alquiler->fecha_entrega_at === null) {
                $alquiler->fecha_entrega_at = now();
            }

            if ($nuevo === EstadoAlquiler::Devuelto && $alquiler->fecha_devolucion_at === null) {
                $alquiler->fecha_devolucion_at = now();
                $alquiler->danio_descripcion = $request->validated('danio_descripcion');
                $alquiler->danio_monto = $request->validated('danio_monto') ?? '0';
                $alquiler->deposito_devuelto = $request->validated('deposito_devuelto');
            }

            $alquiler->save();
        });

        return back()->with('success', 'Estado actualizado a «'.$nuevo->etiqueta().'».');
    }
}
