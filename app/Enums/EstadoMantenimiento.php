<?php

namespace App\Enums;

enum EstadoMantenimiento: string
{
    case Pendiente = 'pendiente';
    case EnProceso = 'en_proceso';
    case Completado = 'completado';

    public function etiqueta(): string
    {
        return match ($this) {
            self::Pendiente => 'Pendiente',
            self::EnProceso => 'En proceso',
            self::Completado => 'Completado',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Pendiente => 'yellow',
            self::EnProceso => 'blue',
            self::Completado => 'green',
        };
    }

    public function estaActivo(): bool
    {
        return in_array($this, [self::Pendiente, self::EnProceso], true);
    }
}
