<?php

namespace Database\Factories;

use App\Models\Alquiler;
use App\Models\AlquilerLinea;
use App\Models\Producto;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AlquilerLinea>
 */
class AlquilerLineaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $dias = fake()->numberBetween(1, 7);
        $precio = fake()->randomFloat(2, 5, 150);
        $cant = fake()->randomFloat(3, 1, 10);
        $subtotal = round($precio * $dias * $cant, 2);

        return [
            'alquiler_id' => Alquiler::factory(),
            'producto_id' => Producto::factory(),
            'cantidad' => (string) $cant,
            'dias' => $dias,
            'precio_diario' => (string) $precio,
            'subtotal' => (string) $subtotal,
        ];
    }
}
