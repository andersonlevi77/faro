<?php

namespace App\Enums;

enum TipoPago: string
{
    case Anticipo = 'anticipo';
    case Deposito = 'deposito';
    case PagoAlquiler = 'pago_alquiler';
    case DevolucionDeposito = 'devolucion_deposito';
    case CobroDanio = 'cobro_danio';

    public function etiqueta(): string
    {
        return match ($this) {
            self::Anticipo => 'Anticipo',
            self::Deposito => 'Depósito',
            self::PagoAlquiler => 'Pago de alquiler',
            self::DevolucionDeposito => 'Devolución de depósito',
            self::CobroDanio => 'Cobro por daño',
        };
    }

    public function esIngreso(): bool
    {
        return in_array($this, [self::Anticipo, self::Deposito, self::PagoAlquiler, self::CobroDanio], true);
    }
}
