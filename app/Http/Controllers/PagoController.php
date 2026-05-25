<?php

namespace App\Http\Controllers;

use App\Enums\MetodoPago;
use App\Enums\TipoPago;
use App\Http\Requests\StorePagoRequest;
use App\Models\Alquiler;
use App\Models\Pago;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class PagoController extends Controller
{
    public function store(StorePagoRequest $request, Alquiler $alquiler): RedirectResponse
    {
        $this->authorize('create', Pago::class);

        $alquiler->pagos()->create([
            ...$request->validated(),
            'registrado_por' => $request->user()?->id,
        ]);

        return back()->with('success', 'Pago registrado correctamente.');
    }

    public function destroy(Alquiler $alquiler, Pago $pago): RedirectResponse
    {
        $this->authorize('delete', $pago);

        if ($pago->alquiler_id !== $alquiler->id) {
            abort(403);
        }

        $pago->delete();

        return back()->with('success', 'Pago eliminado.');
    }

    public function print(Alquiler $alquiler, Pago $pago): View
    {
        $this->authorize('view', $alquiler);

        if ($pago->alquiler_id !== $alquiler->id) {
            abort(403);
        }

        $alquiler->load([
            'cliente',
            'lineas.producto',
            'lineas.paquete',
            'pagos.registradoPor',
        ]);
        $pago->load('registradoPor');

        return view('print.pago', [
            'alquiler' => $alquiler,
            'pago' => $pago,
            'tipoLabel' => ($pago->tipo instanceof TipoPago ? $pago->tipo : TipoPago::from((string) $pago->tipo))->etiqueta(),
            'metodoLabel' => ($pago->metodo_pago instanceof MetodoPago ? $pago->metodo_pago : MetodoPago::from((string) $pago->metodo_pago))->etiqueta(),
            'resumen' => [
                'total_alquiler' => $alquiler->total,
                'deposito' => $alquiler->deposito_monto,
                'total_cobrado' => $alquiler->totalCobrado(),
                'saldo_pendiente' => $alquiler->saldoPendiente(),
            ],
        ]);
    }
}
