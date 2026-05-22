<?php

namespace App\Http\Controllers;

use App\Models\Alquiler;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarioController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $hoy = CarbonImmutable::now();
        $anio = $request->integer('anio', $hoy->year);
        $mes = $request->integer('mes', $hoy->month);

        $mes = max(1, min(12, $mes));

        $inicioMes = CarbonImmutable::createFromDate($anio, $mes, 1)->startOfDay();
        $finMes = $inicioMes->endOfMonth()->endOfDay();

        $alquileres = Alquiler::query()
            ->with(['cliente'])
            ->where(function ($q) use ($inicioMes, $finMes): void {
                $q->whereBetween('fecha_inicio_prevista', [$inicioMes->toDateString(), $finMes->toDateString()])
                    ->orWhereBetween('fecha_fin_prevista', [$inicioMes->toDateString(), $finMes->toDateString()])
                    ->orWhere(function ($inner) use ($inicioMes, $finMes): void {
                        $inner->where('fecha_inicio_prevista', '<=', $inicioMes->toDateString())
                            ->where('fecha_fin_prevista', '>=', $finMes->toDateString());
                    });
            })
            ->orderBy('fecha_inicio_prevista')
            ->get(['id', 'codigo', 'cliente_id', 'estado', 'fecha_inicio_prevista', 'fecha_fin_prevista', 'total']);

        return Inertia::render('calendario', [
            'alquileres' => $alquileres,
            'anio' => $anio,
            'mes' => $mes,
            'hoy' => $hoy->toDateString(),
        ]);
    }
}
