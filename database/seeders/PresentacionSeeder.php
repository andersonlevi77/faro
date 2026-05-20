<?php

namespace Database\Seeders;

use App\Models\Presentacion;
use Illuminate\Database\Seeder;

class PresentacionSeeder extends Seeder
{
    public function run(): void
    {
        $nombres = ['Tabletas', 'Cápsulas', 'Jarabe 120 ml', 'Crema 50 g', 'Gotas', 'Ampolla', 'Suspensión', 'Supositorio', 'Parche', 'Inyectable'];

        foreach ($nombres as $nombre) {
            Presentacion::firstOrCreate(['nombre' => $nombre]);
        }
    }
}
