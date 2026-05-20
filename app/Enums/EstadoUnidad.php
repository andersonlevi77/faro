<?php

namespace App\Enums;

enum EstadoUnidad: string
{
    case Disponible = 'disponible';
    case Reservado = 'reservado';
    case Alquilado = 'alquilado';
    case Mantenimiento = 'mantenimiento';
    case Danado = 'danado';
    case Perdido = 'perdido';

    public function etiqueta(): string
    {
        return match ($this) {
            self::Disponible => 'Disponible',
            self::Reservado => 'Reservado',
            self::Alquilado => 'Alquilado',
            self::Mantenimiento => 'En mantenimiento',
            self::Danado => 'Dañado',
            self::Perdido => 'Perdido',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Disponible => 'green',
            self::Reservado => 'yellow',
            self::Alquilado => 'blue',
            self::Mantenimiento => 'orange',
            self::Danado => 'red',
            self::Perdido => 'gray',
        };
    }

    /** @return list<self> */
    public static function disponiblesParaAlquilar(): array
    {
        return [self::Disponible];
    }

    /** Estados que bloquean la unidad del flujo normal de alquiler. */
    public function estaOperativa(): bool
    {
        return $this === self::Disponible;
    }
}
