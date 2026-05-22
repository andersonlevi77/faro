<?php

namespace App\Services;

use App\Enums\EstadoAlquiler;
use App\Models\Alquiler;
use App\Models\AlquilerLinea;
use App\Models\Paquete;
use App\Models\Producto;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class VerificadorDisponibilidadAlquiler
{
    /**
     * Disponibilidad activa para varios productos en pocas consultas (evita N+1 en listados).
     *
     * @param  iterable<int, Producto>  $productos
     * @return array<int, string>
     */
    public function cantidadesDisponiblesActivasParaProductos(
        iterable $productos,
        ?int $excluirAlquilerId = null,
    ): array {
        $porId = collect($productos)
            ->mapWithKeys(fn (Producto $producto) => [$producto->id => $producto]);

        if ($porId->isEmpty()) {
            return [];
        }

        $comprometidas = $this->comprometidasActivasPorProductoIds(
            $porId->keys()->all(),
            $excluirAlquilerId,
        );

        $disponibles = [];

        foreach ($porId as $id => $producto) {
            $comprometida = $comprometidas[$id] ?? '0';
            $disponibles[$id] = $this->formatearCantidadEntera(
                bcsub((string) $producto->stock_alquiler, $comprometida, 3),
            );
        }

        return $disponibles;
    }

    /**
     * @param  array<int, string>  $disponiblesPorProductoId
     */
    public function cantidadDisponiblePaqueteActivaDesdeMap(
        Paquete $paquete,
        array $disponiblesPorProductoId,
    ): string {
        $paquete->loadMissing('productos');

        if ($paquete->productos->isEmpty()) {
            return '0';
        }

        $maximo = null;

        foreach ($paquete->productos as $producto) {
            $disponible = $disponiblesPorProductoId[$producto->id] ?? '0';
            $porPaquete = bcdiv($disponible, (string) $producto->pivot->cantidad, 0);
            $maximo = $maximo === null
                ? (int) $porPaquete
                : min($maximo, (int) $porPaquete);
        }

        return (string) max(0, $maximo ?? 0);
    }

    /**
     * @param  list<int>  $productoIds
     * @return array<int, string>
     */
    private function comprometidasActivasPorProductoIds(
        array $productoIds,
        ?int $excluirAlquilerId = null,
    ): array {
        if ($productoIds === []) {
            return [];
        }

        $estados = EstadoAlquiler::valoresComprometenStock();

        $directas = AlquilerLinea::query()
            ->selectRaw('producto_id, SUM(cantidad) as total')
            ->whereIn('producto_id', $productoIds)
            ->whereHas('alquiler', function (Builder $query) use ($estados, $excluirAlquilerId): void {
                $query->whereIn('estado', $estados);
                if ($excluirAlquilerId !== null) {
                    $query->where('id', '!=', $excluirAlquilerId);
                }
            })
            ->groupBy('producto_id')
            ->pluck('total', 'producto_id');

        $desdePaquetes = DB::table('alquiler_lineas')
            ->join('alquileres', 'alquileres.id', '=', 'alquiler_lineas.alquiler_id')
            ->join('paquete_producto', 'paquete_producto.paquete_id', '=', 'alquiler_lineas.paquete_id')
            ->whereIn('paquete_producto.producto_id', $productoIds)
            ->whereNotNull('alquiler_lineas.paquete_id')
            ->whereIn('alquileres.estado', $estados)
            ->when($excluirAlquilerId !== null, fn ($query) => $query->where('alquileres.id', '!=', $excluirAlquilerId))
            ->selectRaw('paquete_producto.producto_id as producto_id, SUM(alquiler_lineas.cantidad * paquete_producto.cantidad) as total')
            ->groupBy('paquete_producto.producto_id')
            ->pluck('total', 'producto_id');

        $totales = [];

        foreach ($productoIds as $productoId) {
            $suma = bcadd(
                (string) ($directas[$productoId] ?? 0),
                (string) ($desdePaquetes[$productoId] ?? 0),
                3,
            );
            $totales[$productoId] = $suma;
        }

        return $totales;
    }

    /**
     * Unidades fuera de inventario por alquileres activos (creado o entregado).
     */
    public function cantidadComprometidaActiva(
        Producto $producto,
        ?int $excluirAlquilerId = null,
    ): string {
        $sumaProducto = AlquilerLinea::query()
            ->where('producto_id', $producto->id)
            ->whereHas('alquiler', function (Builder $query) use ($excluirAlquilerId): void {
                $query->whereIn('estado', EstadoAlquiler::valoresComprometenStock());
                if ($excluirAlquilerId !== null) {
                    $query->where('id', '!=', $excluirAlquilerId);
                }
            })
            ->sum('cantidad');

        $sumaPaquetes = AlquilerLinea::query()
            ->whereNotNull('paquete_id')
            ->whereHas('paquete.productos', fn (Builder $q) => $q->where('productos.id', $producto->id))
            ->whereHas('alquiler', function (Builder $query) use ($excluirAlquilerId): void {
                $query->whereIn('estado', EstadoAlquiler::valoresComprometenStock());
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

    public function cantidadDisponibleActiva(
        Producto $producto,
        ?int $excluirAlquilerId = null,
    ): string {
        $comprometida = $this->cantidadComprometidaActiva($producto, $excluirAlquilerId);

        return $this->formatearCantidadEntera(
            bcsub((string) $producto->stock_alquiler, $comprometida, 3),
        );
    }

    public function cantidadDisponiblePaqueteActiva(
        Paquete $paquete,
        ?int $excluirAlquilerId = null,
    ): string {
        $paquete->loadMissing('productos');

        if ($paquete->productos->isEmpty()) {
            return '0';
        }

        $maximo = null;

        foreach ($paquete->productos as $producto) {
            $disponible = $this->cantidadDisponibleActiva($producto, $excluirAlquilerId);
            $porPaquete = bcdiv($disponible, (string) $producto->pivot->cantidad, 0);
            $maximo = $maximo === null
                ? (int) $porPaquete
                : min($maximo, (int) $porPaquete);
        }

        return (string) max(0, $maximo ?? 0);
    }

    private function formatearCantidadEntera(string $cantidad): string
    {
        return (string) max(0, (int) floor((float) $cantidad));
    }

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

            $disponible = $this->cantidadDisponibleActiva($producto, $excluirAlquilerId);

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
            $disponible = $this->cantidadDisponibleActiva($producto, $excluirAlquilerId);

            if (bccomp($necesario, $disponible, 3) === 1) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param  array<int, array{producto_id?: int|string|null, paquete_id?: int|string|null, cantidad: float|int|string}>  $lineas
     */
    public function mensajeErrorStockLineas(array $lineas, ?int $excluirAlquilerId = null): ?string
    {
        /** @var array<int, string> $demandaProductos */
        $demandaProductos = [];
        /** @var array<int, string> $demandaPaquetes */
        $demandaPaquetes = [];

        foreach ($lineas as $row) {
            if (! empty($row['paquete_id'])) {
                $paqueteId = (int) $row['paquete_id'];
                $demandaPaquetes[$paqueteId] = bcadd(
                    $demandaPaquetes[$paqueteId] ?? '0',
                    (string) $row['cantidad'],
                    3,
                );

                $paquete = Paquete::query()->with('productos')->find($paqueteId);
                if ($paquete === null) {
                    continue;
                }

                foreach ($paquete->productos as $producto) {
                    $unidades = bcmul((string) $row['cantidad'], (string) $producto->pivot->cantidad, 3);
                    $demandaProductos[$producto->id] = bcadd(
                        $demandaProductos[$producto->id] ?? '0',
                        $unidades,
                        3,
                    );
                }

                continue;
            }

            if (empty($row['producto_id'])) {
                continue;
            }

            $productoId = (int) $row['producto_id'];
            $demandaProductos[$productoId] = bcadd(
                $demandaProductos[$productoId] ?? '0',
                (string) $row['cantidad'],
                3,
            );
        }

        foreach ($demandaPaquetes as $paqueteId => $cantidadSolicitada) {
            $paquete = Paquete::query()->with('productos')->find($paqueteId);
            if ($paquete === null) {
                continue;
            }

            if (! $paquete->activo || $paquete->productos->isEmpty()) {
                return 'El paquete «'.$paquete->nombre.'» no está disponible.';
            }

            $disponiblePaquetes = $this->cantidadDisponiblePaqueteActiva($paquete, $excluirAlquilerId);
            if (bccomp($cantidadSolicitada, $disponiblePaquetes, 3) === 1) {
                return 'No hay suficientes unidades del paquete «'.$paquete->nombre.'» disponibles (máx. '.$disponiblePaquetes.').';
            }
        }

        foreach ($demandaProductos as $productoId => $necesario) {
            $producto = Producto::query()->find($productoId);
            if ($producto === null) {
                continue;
            }

            $disponible = $this->cantidadDisponibleActiva($producto, $excluirAlquilerId);
            if (bccomp($necesario, $disponible, 3) === 1) {
                return 'No hay suficiente «'.$producto->nombre.'» disponible (máx. '.$disponible.' unidad(es)).';
            }
        }

        return null;
    }
}
