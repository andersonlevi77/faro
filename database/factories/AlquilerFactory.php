<?php

namespace Database\Factories;

use App\Enums\EstadoAlquiler;
use App\Models\Alquiler;
use App\Models\Cliente;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Alquiler>
 */
class AlquilerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $inicio = fake()->dateTimeBetween('now', '+1 week');
        $fin = (clone $inicio)->modify('+'.fake()->numberBetween(2, 14).' days');

        return [
            'cliente_id' => Cliente::factory(),
            'user_id' => User::factory(),
            'estado' => EstadoAlquiler::Borrador,
            'fecha_inicio_prevista' => $inicio->format('Y-m-d'),
            'fecha_fin_prevista' => $fin->format('Y-m-d'),
            'deposito_monto' => fake()->randomFloat(2, 0, 500),
            'total' => 0,
            'notas' => fake()->optional()->sentence(),
        ];
    }
}
