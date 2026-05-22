<?php

namespace App\Services;

use App\Models\Producto;
use Illuminate\Support\Collection;

class ConsultaStockBajoNotificaciones
{
    public function __construct(
        private VerificadorDisponibilidadAlquiler $verificador,
        private int $limite = 15,
    ) {}

    /**
     * Productos cuya disponibilidad actual está en o por debajo del umbral de alerta.
     * Solo aviso; no restringe alquileres.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function obtener(): Collection
    {
        $productos = Producto::query()
            ->where('activo', true)
            ->where('es_alquilable', true)
            ->where('stock_minimo', '>', 0)
            ->orderBy('nombre')
            ->limit(80)
            ->get(['id', 'nombre', 'codigo', 'stock_alquiler', 'stock_minimo']);

        $disponibles = $this->verificador->cantidadesDisponiblesActivasParaProductos($productos);

        return $productos
            ->filter(function (Producto $producto) use ($disponibles): bool {
                $disponible = (float) ($disponibles[$producto->id] ?? 0);

                return $disponible <= (float) $producto->stock_minimo;
            })
            ->take($this->limite)
            ->map(fn (Producto $producto) => [
                'id' => $producto->id,
                'nombre' => $producto->nombre,
                'codigo' => $producto->codigo,
                'disponible' => $disponibles[$producto->id] ?? '0',
                'stock_minimo' => (string) $producto->stock_minimo,
                'stock_total' => (string) (int) (float) $producto->stock_alquiler,
            ])
            ->values();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function paraCompartir(): array
    {
        return $this->obtener()->all();
    }
}
