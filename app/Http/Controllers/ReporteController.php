<?php

namespace App\Http\Controllers;

use App\Enums\EstadoAlquiler;
use App\Enums\TipoPago;
use App\Models\Alquiler;
use App\Models\AlquilerLinea;
use App\Models\Mantenimiento;
use App\Models\Pago;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReporteController extends Controller
{
    private function mesExpr(string $column): string
    {
        return DB::connection()->getDriverName() === 'sqlite'
            ? "strftime('%m', {$column})"
            : "LPAD(MONTH({$column}), 2, '0')";
    }

    public function __invoke(Request $request): Response
    {
        $hoy = CarbonImmutable::now();
        $anio = $request->integer('anio', $hoy->year);

        $inicioAnio = CarbonImmutable::createFromDate($anio, 1, 1)->startOfDay();
        $finAnio = $inicioAnio->endOfYear()->endOfDay();

        // Ingresos por mes (pagos de tipo ingreso)
        $tiposIngreso = array_map(
            fn (TipoPago $t) => $t->value,
            array_filter(TipoPago::cases(), fn (TipoPago $t) => $t->esIngreso()),
        );

        $mesCreatedAt = $this->mesExpr('created_at');

        $ingresosPorMes = Pago::query()
            ->selectRaw("{$mesCreatedAt} as mes, SUM(monto) as total")
            ->whereIn('tipo', $tiposIngreso)
            ->whereBetween('created_at', [$inicioAnio, $finAnio])
            ->groupByRaw($mesCreatedAt)
            ->orderByRaw('mes')
            ->get()
            ->keyBy('mes');

        $mesesData = collect(range(1, 12))->map(fn (int $m) => [
            'mes' => $m,
            'nombre' => CarbonImmutable::createFromDate($anio, $m, 1)->locale('es')->isoFormat('MMM'),
            'total' => number_format((float) ($ingresosPorMes[str_pad($m, 2, '0', STR_PAD_LEFT)]->total ?? 0), 2, '.', ''),
        ]);

        // Alquileres por estado (todo el año)
        $alquileresPorEstado = Alquiler::query()
            ->selectRaw('estado, COUNT(*) as total')
            ->whereBetween('created_at', [$inicioAnio, $finAnio])
            ->groupBy('estado')
            ->get()
            ->map(fn ($r) => [
                'estado' => $r->estado instanceof EstadoAlquiler ? $r->estado->value : $r->estado,
                'label' => $r->estado instanceof EstadoAlquiler ? $r->estado->etiqueta() : EstadoAlquiler::from($r->estado)->etiqueta(),
                'total' => $r->total,
            ]);

        // Top 10 productos más alquilados (por cantidad de lineas)
        $topProductos = AlquilerLinea::query()
            ->selectRaw('producto_id, SUM(cantidad) as total_cantidad, COUNT(*) as veces')
            ->with('producto:id,nombre,codigo')
            ->whereHas('alquiler', fn ($q) => $q->whereBetween('created_at', [$inicioAnio, $finAnio]))
            ->groupBy('producto_id')
            ->orderByDesc('total_cantidad')
            ->limit(10)
            ->get();

        // Costos de mantenimiento por mes
        $mesFechaFin = $this->mesExpr('fecha_fin_at');

        $mantenimientoPorMes = Mantenimiento::query()
            ->selectRaw("{$mesFechaFin} as mes, SUM(costo) as total")
            ->whereNotNull('fecha_fin_at')
            ->whereBetween('fecha_fin_at', [$inicioAnio, $finAnio])
            ->groupByRaw($mesFechaFin)
            ->orderByRaw('mes')
            ->get()
            ->keyBy('mes');

        $mantenimientoMesesData = collect(range(1, 12))->map(fn (int $m) => [
            'mes' => $m,
            'nombre' => CarbonImmutable::createFromDate($anio, $m, 1)->locale('es')->isoFormat('MMM'),
            'total' => number_format((float) ($mantenimientoPorMes[str_pad($m, 2, '0', STR_PAD_LEFT)]->total ?? 0), 2, '.', ''),
        ]);

        // Totales del año
        $totalIngresosAnio = number_format(
            (float) Pago::query()
                ->whereIn('tipo', $tiposIngreso)
                ->whereBetween('created_at', [$inicioAnio, $finAnio])
                ->sum('monto'),
            2, '.', '',
        );

        $totalMantenimientoAnio = number_format(
            (float) Mantenimiento::query()
                ->whereBetween('created_at', [$inicioAnio, $finAnio])
                ->sum('costo'),
            2, '.', '',
        );

        $totalAlquileresAnio = Alquiler::query()
            ->whereBetween('created_at', [$inicioAnio, $finAnio])
            ->count();

        return Inertia::render('reportes', [
            'anio' => $anio,
            'anioActual' => $hoy->year,
            'ingresosPorMes' => $mesesData,
            'alquileresPorEstado' => $alquileresPorEstado,
            'topProductos' => $topProductos,
            'mantenimientoPorMes' => $mantenimientoMesesData,
            'resumen' => [
                'totalIngresos' => $totalIngresosAnio,
                'totalMantenimiento' => $totalMantenimientoAnio,
                'totalAlquileres' => $totalAlquileresAnio,
            ],
        ]);
    }
}
