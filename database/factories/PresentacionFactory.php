<?php

namespace Database\Factories;

use App\Models\Presentacion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Presentacion>
 */
class PresentacionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $nombres = ['Tabletas', 'Cápsulas', 'Jarabe 120 ml', 'Crema 50 g', 'Gotas', 'Ampolla', 'Suspensión', 'Supositorio', 'Parche', 'Inyectable'];
        $nombre = fake()->unique()->randomElement($nombres);

        return [
            'nombre' => $nombre,
        ];
    }
}
