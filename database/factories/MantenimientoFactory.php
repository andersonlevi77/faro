<?php

namespace Database\Factories;

use App\Enums\EstadoMantenimiento;
use App\Models\Mantenimiento;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Mantenimiento>
 */
class MantenimientoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'titulo' => $this->faker->sentence(4),
            'descripcion' => $this->faker->optional()->sentence(),
            'costo' => '0.00',
            'estado' => EstadoMantenimiento::Pendiente->value,
            'fecha_programada' => null,
            'fecha_inicio_at' => null,
            'fecha_fin_at' => null,
            'notas' => null,
            'creado_por' => User::factory(),
            'resuelto_por' => null,
        ];
    }
}
