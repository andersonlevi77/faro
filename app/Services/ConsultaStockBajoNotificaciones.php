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
        return Producto::query()
            ->where('activo', true)
            ->where('es_alquilable', true)
            ->where('stock_minimo', '>', 0)
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'codigo', 'stock_alquiler', 'stock_minimo'])
            ->filter(function (Producto $producto): bool {
                $disponible = (float) $this->verificador->cantidadDisponibleActiva($producto);

                return $disponible <= (float) $producto->stock_minimo;
            })
            ->take($this->limite)
            ->map(fn (Producto $producto) => [
                'id' => $producto->id,
                'nombre' => $producto->nombre,
                'codigo' => $producto->codigo,
                'disponible' => $this->verificador->cantidadDisponibleActiva($producto),
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
