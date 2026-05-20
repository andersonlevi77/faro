<?php

namespace Database\Factories;

use App\Models\Lote;
use App\Models\Producto;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Lote>
 */
class LoteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $cantidad = fake()->randomFloat(3, 1, 500);
        $fechaVencimiento = fake()->dateTimeBetween('+3 months', '+2 years');

        return [
            'producto_id' => Producto::factory(),
            'numero_lote' => strtoupper(fake()->bothify('LOT-####-????')),
            'fecha_vencimiento' => $fechaVencimiento,
            'cantidad' => $cantidad,
            'cantidad_inicial' => $cantidad,
        ];
    }
}
