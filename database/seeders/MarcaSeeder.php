<?php

namespace Database\Seeders;

use App\Models\Marca;
use Illuminate\Database\Seeder;

class MarcaSeeder extends Seeder
{
    public function run(): void
    {
        $nombres = ['Genérico', 'Bayer', 'Pfizer', 'Roche', 'Sanofi', 'Novartis', 'Johnson & Johnson', 'Medicamentos del país'];

        foreach ($nombres as $nombre) {
            Marca::firstOrCreate(['nombre' => $nombre]);
        }
    }
}
