<?php

namespace App\Enums;

enum EstadoAlquiler: string
{
    case Borrador = 'borrador';
    case Reservado = 'reservado';
    case Entregado = 'entregado';
    case EnUso = 'en_uso';
    case Devuelto = 'devuelto';
    case Cerrado = 'cerrado';
    case Cancelado = 'cancelado';

    /**
     * @return list<string>
     */
    public static function valoresComprometenStock(): array
    {
        return [
            self::Reservado->value,
            self::Entregado->value,
            self::EnUso->value,
        ];
    }

    /**
     * @return list<self>
     */
    public static function activos(): array
    {
        return [
            self::Reservado,
            self::Entregado,
            self::EnUso,
        ];
    }

    public function etiqueta(): string
    {
        return match ($this) {
            self::Borrador => 'Borrador',
            self::Reservado => 'Reservado',
            self::Entregado => 'Entregado',
            self::EnUso => 'En uso',
            self::Devuelto => 'Devuelto',
            self::Cerrado => 'Cerrado',
            self::Cancelado => 'Cancelado',
        };
    }

    public function puedeTransicionarA(self $destino): bool
    {
        return match ($this) {
            self::Borrador => in_array($destino, [self::Reservado, self::Cancelado], true),
            self::Reservado => in_array($destino, [self::Entregado, self::Cancelado], true),
            self::Entregado => $destino === self::EnUso,
            self::EnUso => $destino === self::Devuelto,
            self::Devuelto => $destino === self::Cerrado,
            self::Cerrado, self::Cancelado => false,
        };
    }
}
