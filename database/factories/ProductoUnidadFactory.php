<?php

namespace Database\Factories;

use App\Enums\EstadoUnidad;
use App\Models\Producto;
use App\Models\ProductoUnidad;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductoUnidad>
 */
class ProductoUnidadFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'producto_id' => Producto::factory(),
            'codigo' => strtoupper(fake()->unique()->bothify('???-###')),
            'estado' => EstadoUnidad::Disponible,
            'notas' => fake()->optional(0.2)->sentence(),
        ];
    }

    public function disponible(): static
    {
        return $this->state(['estado' => EstadoUnidad::Disponible]);
    }

    public function reservado(): static
    {
        return $this->state(['estado' => EstadoUnidad::Reservado]);
    }

    public function alquilado(): static
    {
        return $this->state(['estado' => EstadoUnidad::Alquilado]);
    }

    public function enMantenimiento(): static
    {
        return $this->state(['estado' => EstadoUnidad::Mantenimiento]);
    }

    public function danado(): static
    {
        return $this->state(['estado' => EstadoUnidad::Danado]);
    }
}
