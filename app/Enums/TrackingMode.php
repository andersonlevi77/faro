<?php

namespace App\Enums;

enum TrackingMode: string
{
    case Bulk = 'bulk';
    case Individual = 'individual';

    public function etiqueta(): string
    {
        return match ($this) {
            self::Bulk => 'Por cantidad',
            self::Individual => 'Por unidad individual',
        };
    }
}
