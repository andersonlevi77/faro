<?php

namespace App\Services;

use App\Enums\EstadoAlquiler;
use App\Enums\EstadoUnidad;
use App\Enums\TrackingMode;
use App\Models\Alquiler;
use App\Models\AlquilerLinea;
use App\Models\Producto;
use App\Models\ProductoUnidad;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

class VerificadorDisponibilidadAlquiler
{
    // -------------------------------------------------------------------------
    // Bulk mode
    // -------------------------------------------------------------------------

    public function cantidadComprometida(
        Producto $producto,
        CarbonInterface $inicio,
        CarbonInterface $fin,
        ?int $excluirAlquilerId = null,
    ): string {
        $inicioStr = $inicio->toDateString();
        $finStr = $fin->toDateString();

        $suma = AlquilerLinea::query()
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

        return (string) $suma;
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

    // -------------------------------------------------------------------------
    // Individual mode
    // -------------------------------------------------------------------------

    public function unidadesDisponiblesCount(Producto $producto): int
    {
        return $producto->unidades()->where('estado', EstadoUnidad::Disponible->value)->count();
    }

    // -------------------------------------------------------------------------
    // Stock check (ambos modos)
    // -------------------------------------------------------------------------

    public function alquilerTieneStockSuficiente(Alquiler $alquiler): bool
    {
        $alquiler->loadMissing('lineas.producto');

        $excluirAlquilerId = in_array($alquiler->estadoEnum(), EstadoAlquiler::activos(), true)
            ? $alquiler->id
            : null;

        foreach ($alquiler->lineas as $linea) {
            $producto = $linea->producto;
            if (! $producto->es_alquilable) {
                return false;
            }

            if ($producto->tracking_mode === TrackingMode::Individual) {
                $disponibles = $this->unidadesDisponiblesCount($producto);
                if ((int) $linea->cantidad > $disponibles) {
                    return false;
                }
            } else {
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
        }

        return true;
    }

    // -------------------------------------------------------------------------
    // Asignar / liberar unidades físicas
    // -------------------------------------------------------------------------

    /**
     * Asigna unidades disponibles a cada línea de productos individuales.
     * Lanza ValidationException si no hay suficientes.
     */
    public function asignarUnidades(Alquiler $alquiler): void
    {
        $alquiler->loadMissing('lineas.producto');

        foreach ($alquiler->lineas as $linea) {
            if ($linea->producto->tracking_mode !== TrackingMode::Individual) {
                continue;
            }

            $cantidad = (int) $linea->cantidad;

            $unidades = ProductoUnidad::query()
                ->where('producto_id', $linea->producto_id)
                ->where('estado', EstadoUnidad::Disponible->value)
                ->lockForUpdate()
                ->limit($cantidad)
                ->get();

            if ($unidades->count() < $cantidad) {
                throw ValidationException::withMessages([
                    'stock' => 'No hay suficientes unidades disponibles de «'.$linea->producto->nombre.'» ('.$unidades->count().' de '.$cantidad.' requeridas).',
                ]);
            }

            $unidades->each(function (ProductoUnidad $unidad) use ($linea): void {
                $unidad->update(['estado' => EstadoUnidad::Reservado]);
                $linea->unidades()->syncWithoutDetaching([$unidad->id]);
            });
        }
    }

    /**
     * Cambia el estado de las unidades asignadas a una linea según la transición del alquiler.
     */
    public function actualizarEstadoUnidades(Alquiler $alquiler, EstadoAlquiler $nuevoEstado): void
    {
        $alquiler->loadMissing('lineas.unidades');

        $estadoUnidad = match ($nuevoEstado) {
            EstadoAlquiler::Reservado => EstadoUnidad::Reservado,
            EstadoAlquiler::Entregado, EstadoAlquiler::EnUso => EstadoUnidad::Alquilado,
            EstadoAlquiler::Devuelto, EstadoAlquiler::Cerrado, EstadoAlquiler::Cancelado => EstadoUnidad::Disponible,
            default => null,
        };

        if ($estadoUnidad === null) {
            return;
        }

        foreach ($alquiler->lineas as $linea) {
            foreach ($linea->unidades as $unidad) {
                $unidad->update(['estado' => $estadoUnidad]);
            }
        }
    }
}
