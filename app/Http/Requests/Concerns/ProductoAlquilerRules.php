<?php

namespace App\Http\Requests\Concerns;

use App\Enums\TrackingMode;

trait ProductoAlquilerRules
{
    /**
     * @return array<string, mixed>
     */
    protected function productoBaseRules(?int $productoId = null): array
    {
        $codigoUnique = $productoId
            ? 'unique:productos,codigo,'.$productoId
            : 'unique:productos,codigo';

        return [
            'nombre' => ['required', 'string', 'max:255'],
            'codigo' => ['required', 'string', 'max:100', $codigoUnique],
            'descripcion' => ['nullable', 'string', 'max:2000'],
            'marca_id' => ['nullable', 'exists:marcas,id'],
            'categoria_id' => ['nullable', 'exists:categorias,id'],
            'presentacion_id' => ['nullable', 'exists:presentaciones,id'],
            'stock_minimo' => ['nullable', 'integer', 'min:0'],
            'activo' => ['boolean'],
            'precio_alquiler_diario' => ['required', 'numeric', 'min:0'],
            'stock_alquiler' => ['required', 'numeric', 'min:0'],
        ];
    }

    protected function prepareProductoCatalogIds(): void
    {
        foreach (['marca_id', 'categoria_id', 'presentacion_id'] as $key) {
            if ($this->has($key) && $this->input($key) === '') {
                $this->merge([$key => null]);
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    protected function productoAlquilerDefaults(): array
    {
        return [
            'es_alquilable' => true,
            'tracking_mode' => TrackingMode::Bulk->value,
            'deposito_unitario' => '0',
        ];
    }
}
