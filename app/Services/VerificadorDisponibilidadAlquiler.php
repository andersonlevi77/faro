<?php

namespace App\Services;

use App\Enums\EstadoAlquiler;
use App\Models\Alquiler;
use App\Models\AlquilerLinea;
use App\Models\Paquete;
use App\Models\Producto;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;

class VerificadorDisponibilidadAlquiler
{
    public function cantidadComprometida(
        Producto $producto,
        CarbonInterface $inicio,
        CarbonInterface $fin,
        ?int $excluirAlquilerId = null,
    ): string {
        $inicioStr = $inicio->toDateString();
        $finStr = $fin->toDateString();

        $sumaProducto = AlquilerLinea::query()
            ->where('producto_id', $producto->id)
            ->whereHas('alquiler', function (Builder $query) use ($inicioStr, $finStr, $excluirAlquilerId): void {
                $query->whereIn('estado', EstadoAlquiler::valoresComprometenStock())
                    ->whereDate('fecha_inicio_prevista', '<=', $finStr)
                    ->whereDate('fecha_fin_prevista', '>=', $inicioStr);
                if ($excluirAlquilerId !== null) {
                    $query->where('id', '!=', $excluirAlquilerId);
                }
            })
            ->sum('cantidad');

        $sumaPaquetes = AlquilerLinea::query()
            ->whereNotNull('paquete_id')
            ->whereHas('paquete.productos', fn (Builder $q) => $q->where('productos.id', $producto->id))
            ->whereHas('alquiler', function (Builder $query) use ($inicioStr, $finStr, $excluirAlquilerId): void {
                $query->whereIn('estado', EstadoAlquiler::valoresComprometenStock())
                    ->whereDate('fecha_inicio_prevista', '<=', $finStr)
                    ->whereDate('fecha_fin_prevista', '>=', $inicioStr);
                if ($excluirAlquilerId !== null) {
                    $query->where('id', '!=', $excluirAlquilerId);
                }
            })
            ->with('paquete.productos')
            ->get()
            ->sum(function (AlquilerLinea $linea) use ($producto): float {
                $item = $linea->paquete?->productos->firstWhere('id', $producto->id);

                if ($item === null) {
                    return 0;
                }

                return (float) $linea->cantidad * (float) $item->pivot->cantidad;
            });

        return bcadd((string) $sumaProducto, (string) $sumaPaquetes, 3);
    }

    public function cantidadDisponible(
        Producto $producto,
        CarbonInterface $inicio,
        CarbonInterface $fin,
        ?int $excluirAlquilerId = null,
    ): string {
        $comprometida = $this->cantidadComprometida($producto, $inicio, $fin, $excluirAlquilerId);
        $stock = (string) $producto->stock_alquiler;

        return bcsub($stock, $comprometida, 3);
    }

    public function alquilerTieneStockSuficiente(Alquiler $alquiler): bool
    {
        $alquiler->loadMissing(['lineas.producto', 'lineas.paquete.productos']);

        $excluirAlquilerId = in_array($alquiler->estadoEnum(), EstadoAlquiler::activos(), true)
            ? $alquiler->id
            : null;

        foreach ($alquiler->lineas as $linea) {
            if ($linea->paquete_id !== null) {
                if (! $this->paqueteTieneStock($linea->paquete, (string) $linea->cantidad, $alquiler, $excluirAlquilerId)) {
                    return false;
                }

                continue;
            }

            $producto = $linea->producto;
            if ($producto === null || ! $producto->es_alquilable) {
                return false;
            }

            $disponible = $this->cantidadDisponible(
                $producto,
                $alquiler->fecha_inicio_prevista,
                $alquiler->fecha_fin_prevista,
                $excluirAlquilerId,
            );

            if (bccomp((string) $linea->cantidad, $disponible, 3) === 1) {
                return false;
            }
        }

        return true;
    }

    private function paqueteTieneStock(
        ?Paquete $paquete,
        string $cantidadPaquetes,
        Alquiler $alquiler,
        ?int $excluirAlquilerId,
    ): bool {
        if ($paquete === null || $paquete->productos->isEmpty()) {
            return false;
        }

        foreach ($paquete->productos as $producto) {
            $necesario = bcmul($cantidadPaquetes, (string) $producto->pivot->cantidad, 3);
            $disponible = $this->cantidadDisponible(
                $producto,
                $alquiler->fecha_inicio_prevista,
                $alquiler->fecha_fin_prevista,
                $excluirAlquilerId,
            );

            if (bccomp($necesario, $disponible, 3) === 1) {
                return false;
            }
        }

        return true;
    }
}
