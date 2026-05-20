<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePagoRequest;
use App\Models\Alquiler;
use App\Models\Pago;
use Illuminate\Http\RedirectResponse;

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
}
