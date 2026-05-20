<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            ['nombre' => 'Analgésicos', 'descripcion' => 'Medicamentos para el dolor'],
            ['nombre' => 'Antibióticos', 'descripcion' => 'Tratamiento de infecciones'],
            ['nombre' => 'Vitaminas y suplementos', 'descripcion' => 'Suplementos nutricionales'],
            ['nombre' => 'Cuidado personal', 'descripcion' => 'Higiene y cuidado corporal'],
            ['nombre' => 'Medicamentos de venta libre', 'descripcion' => 'OTC'],
        ];

        foreach ($categorias as $c) {
            $slug = Str::slug($c['nombre']);
            Categoria::firstOrCreate(
                ['slug' => $slug],
                array_merge($c, ['slug' => $slug])
            );
        }
    }
}
