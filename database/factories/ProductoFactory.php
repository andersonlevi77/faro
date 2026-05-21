<?php

namespace Database\Factories;

use App\Enums\TrackingMode;
use App\Models\Categoria;
use App\Models\Marca;
use App\Models\Presentacion;
use App\Models\Producto;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Producto>
 */
class ProductoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $nombre = fake()->words(3, true);
        $codigo = 'PRD-'.str_pad((string) fake()->unique()->numberBetween(1, 99999), 5, '0', STR_PAD_LEFT);

        return [
            'nombre' => ucfirst($nombre),
            'slug' => Str::slug($nombre),
            'codigo' => $codigo,
            'descripcion' => fake()->optional(0.5)->sentence(),
            'codigo_barras' => fake()->optional(0.3)->ean13(),
            'marca_id' => Marca::factory(),
            'categoria_id' => Categoria::factory(),
            'presentacion_id' => Presentacion::factory(),
            'precio_compra' => 0,
            'precio_venta' => 0,
            'stock_minimo' => fake()->numberBetween(1, 5),
            'stock_maximo' => null,
            'activo' => true,
            'es_alquilable' => true,
            'tracking_mode' => TrackingMode::Bulk,
            'stock_alquiler' => (string) fake()->numberBetween(5, 50),
            'precio_alquiler_diario' => (string) fake()->randomFloat(2, 25, 500),
            'deposito_unitario' => (string) fake()->randomFloat(2, 100, 2000),
        ];
    }

    public function alquilableBulk(): static
    {
        return $this->state([
            'es_alquilable' => true,
            'tracking_mode' => TrackingMode::Bulk,
            'stock_alquiler' => '10',
            'precio_alquiler_diario' => '50.00',
            'deposito_unitario' => '200.00',
        ]);
    }

    public function alquilableIndividual(): static
    {
        return $this->state([
            'es_alquilable' => true,
            'tracking_mode' => TrackingMode::Individual,
            'stock_alquiler' => '0',
            'precio_alquiler_diario' => '150.00',
            'deposito_unitario' => '500.00',
        ]);
    }
}
