<?php

namespace App\Http\Controllers;

use App\Enums\EstadoAlquiler;
use App\Enums\EstadoMantenimiento;
use App\Enums\TipoPago;
use App\Models\Alquiler;
use App\Models\Cliente;
use App\Models\Mantenimiento;
use App\Models\Pago;
use App\Models\Producto;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $hoy = CarbonImmutable::now()->startOfDay();
        $finVentana = $hoy->addDays(7);
        $inicioMes = CarbonImmutable::now()->startOfMonth();

        $estadosActivos = array_map(fn (EstadoAlquiler $e) => $e->value, EstadoAlquiler::activos());

        $alquileresActivos = Alquiler::query()
            ->whereIn('estado', $estadosActivos)
            ->count();

        $ingresosEsoMes = number_format(
            (float) Pago::query()
                ->whereIn('tipo', array_map(fn (TipoPago $t) => $t->value,
                    array_filter(TipoPago::cases(), fn (TipoPago $t) => $t->esIngreso())))
                ->where('created_at', '>=', $inicioMes)
                ->sum('monto'),
            2,
            '.',
            '',
        );

        $saldoPendienteTotal = number_format(
            (float) Alquiler::query()
                ->whereIn('estado', $estadosActivos)
                ->get(['id', 'total', 'deposito_monto'])
                ->sum(fn (Alquiler $a) => (float) $a->saldoPendiente()),
            2,
            '.',
            '',
        );

        $mantenimientosActivos = Mantenimiento::query()
            ->whereIn('estado', [EstadoMantenimiento::Pendiente->value, EstadoMantenimiento::EnProceso->value])
            ->count();

        $proximasDevoluciones = Alquiler::query()
            ->with(['cliente'])
            ->whereIn('estado', $estadosActivos)
            ->whereBetween('fecha_fin_prevista', [$hoy->toDateString(), $finVentana->toDateString()])
            ->orderBy('fecha_fin_prevista')
            ->limit(8)
            ->get(['id', 'codigo', 'cliente_id', 'estado', 'fecha_fin_prevista', 'total']);

        $atrasados = Alquiler::query()
            ->with(['cliente'])
            ->whereIn('estado', $estadosActivos)
            ->whereDate('fecha_fin_prevista', '<', $hoy->toDateString())
            ->orderBy('fecha_fin_prevista')
            ->limit(8)
            ->get(['id', 'codigo', 'cliente_id', 'estado', 'fecha_fin_prevista', 'total']);

        $productosStockBajo = Producto::query()
            ->where('activo', true)
            ->where('es_alquilable', true)
            ->whereColumn('stock_alquiler', '<=', 'stock_minimo')
            ->orderBy('stock_alquiler')
            ->limit(8)
            ->get(['id', 'nombre', 'codigo', 'stock_alquiler', 'stock_minimo']);

        $mantenimientosPendientes = Mantenimiento::query()
            ->with(['unidad.producto', 'producto'])
            ->whereIn('estado', [EstadoMantenimiento::Pendiente->value, EstadoMantenimiento::EnProceso->value])
            ->orderBy('created_at')
            ->limit(5)
            ->get(['id', 'titulo', 'estado', 'producto_unidad_id', 'producto_id', 'fecha_programada']);

        return Inertia::render('dashboard', [
            'stats' => [
                'clientes' => Cliente::query()->count(),
                'productosActivos' => Producto::query()->where('activo', true)->count(),
                'alquileresActivos' => $alquileresActivos,
                'alquileresMes' => Alquiler::query()
                    ->where('created_at', '>=', $inicioMes)
                    ->count(),
                'ingresosEseMes' => $ingresosEsoMes,
                'saldoPendienteTotal' => $saldoPendienteTotal,
                'mantenimientosActivos' => $mantenimientosActivos,
            ],
            'proximasDevoluciones' => $proximasDevoluciones,
            'atrasados' => $atrasados,
            'productosStockBajo' => $productosStockBajo,
            'mantenimientosPendientes' => $mantenimientosPendientes,
        ]);
    }
}
