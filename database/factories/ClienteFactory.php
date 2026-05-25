<?php

namespace Database\Factories;

use App\Models\Cliente;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Cliente>
 */
class ClienteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'codigo' => fake()->boolean(60) ? fake()->unique()->bothify('CLI-###') : null,
            'nombre' => fake()->company(),
            'documento' => fake()->unique()->numerify('###########'),
            'email' => fake()->unique()->safeEmail(),
            'telefono' => fake()->phoneNumber(),
            'direccion' => fake()->streetAddress(),
            'ciudad' => fake()->city(),
            'notas' => fake()->optional()->sentence(),
        ];
    }
}
