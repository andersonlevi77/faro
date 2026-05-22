<?php

namespace App\Services;

use App\Enums\EstadoAlquiler;
use App\Models\Alquiler;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class ConsultaAlquileresNotificaciones
{
    public function __construct(
        private ConsultaStockBajoNotificaciones $stockBajoNotificaciones,
        private int $diasVentana = 7,
        private int $limite = 12,
    ) {}

    /**
     * @return array{
     *     proximos: Collection<int, Alquiler>,
     *     atrasados: Collection<int, Alquiler>
     * }
     */
    public function obtener(): array
    {
        $hoy = CarbonImmutable::now()->startOfDay();
        $finVentana = $hoy->addDays($this->diasVentana);
        $estadosActivos = array_map(
            fn (EstadoAlquiler $estado) => $estado->value,
            EstadoAlquiler::activos(),
        );

        $proximos = Alquiler::query()
            ->with(['cliente:id,nombre'])
            ->whereIn('estado', $estadosActivos)
            ->whereBetween('fecha_fin_prevista', [$hoy->toDateString(), $finVentana->toDateString()])
            ->orderBy('fecha_fin_prevista')
            ->limit($this->limite)
            ->get(['id', 'codigo', 'cliente_id', 'estado', 'fecha_fin_prevista']);

        $atrasados = Alquiler::query()
            ->with(['cliente:id,nombre'])
            ->whereIn('estado', $estadosActivos)
            ->whereDate('fecha_fin_prevista', '<', $hoy->toDateString())
            ->orderBy('fecha_fin_prevista')
            ->limit($this->limite)
            ->get(['id', 'codigo', 'cliente_id', 'estado', 'fecha_fin_prevista']);

        return [
            'proximos' => $proximos,
            'atrasados' => $atrasados,
        ];
    }

    /**
     * @return array{
     *     dias_ventana: int,
     *     total: int,
     *     proximos: list<array<string, mixed>>,
     *     atrasados: list<array<string, mixed>>
     * }
     */
    public function paraCompartir(): array
    {
        $datos = $this->obtener();

        $proximos = $datos['proximos']
            ->map(fn (Alquiler $alquiler) => $this->serializar($alquiler))
            ->values()
            ->all();

        $atrasados = $datos['atrasados']
            ->map(fn (Alquiler $alquiler) => $this->serializar($alquiler))
            ->values()
            ->all();

        $stockBajo = $this->stockBajoNotificaciones->paraCompartir();

        return [
            'dias_ventana' => $this->diasVentana,
            'total' => count($proximos) + count($atrasados) + count($stockBajo),
            'proximos' => $proximos,
            'atrasados' => $atrasados,
            'stock_bajo' => $stockBajo,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializar(Alquiler $alquiler): array
    {
        return [
            'id' => $alquiler->id,
            'codigo' => $alquiler->codigo,
            'estado' => $alquiler->estado instanceof EstadoAlquiler
                ? $alquiler->estado->value
                : (string) $alquiler->estado,
            'fecha_fin_prevista' => $alquiler->fecha_fin_prevista->toDateString(),
            'cliente' => $alquiler->cliente
                ? ['id' => $alquiler->cliente->id, 'nombre' => $alquiler->cliente->nombre]
                : null,
        ];
    }
}
