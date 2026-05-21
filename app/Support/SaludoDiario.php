<?php

namespace App\Support;

use Illuminate\Support\Carbon;

final class SaludoDiario
{
    /**
     * Saludo según la hora local de la aplicación (America/Guatemala).
     */
    public static function obtener(?Carbon $momento = null): string
    {
        $hora = (int) ($momento ?? now())->format('G');

        return match (true) {
            $hora >= 5 && $hora < 12 => 'Buenos días',
            $hora >= 12 && $hora < 19 => 'Buenas tardes',
            default => 'Buenas noches',
        };
    }
}
