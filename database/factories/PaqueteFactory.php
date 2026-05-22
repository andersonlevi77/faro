<?php

namespace Database\Factories;

use App\Models\Paquete;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Paquete>
 */
class PaqueteFactory extends Factory
{
    protected $model = Paquete::class;

    public function definition(): array
    {
        return [
            'nombre' => fake()->words(3, true),
            'codigo' => strtoupper(fake()->unique()->bothify('PKG-###')),
            'descripcion' => fake()->optional()->sentence(),
            'precio_alquiler' => fake()->randomFloat(2, 50, 500),
            'activo' => true,
        ];
    }
}
