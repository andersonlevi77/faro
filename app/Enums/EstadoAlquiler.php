<?php

namespace App\Enums;

enum EstadoAlquiler: string
{
    case Creado = 'creado';
    case Entregado = 'entregado';
    case Devuelto = 'devuelto';

    /**
     * Estados que reservan stock de alquiler (hasta devolución).
     *
     * @return list<string>
     */
    public static function valoresComprometenStock(): array
    {
        return [
            self::Creado->value,
            self::Entregado->value,
        ];
    }

    /**
     * @return list<self>
     */
    public static function activos(): array
    {
        return [
            self::Creado,
            self::Entregado,
        ];
    }

    public function etiqueta(): string
    {
        return match ($this) {
            self::Creado => 'Creado',
            self::Entregado => 'Entregado',
            self::Devuelto => 'Devuelto',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Creado => 'yellow',
            self::Entregado => 'blue',
            self::Devuelto => 'green',
        };
    }

    /**
     * @return list<self>
     */
    public static function flujoPrincipal(): array
    {
        return [
            self::Creado,
            self::Entregado,
            self::Devuelto,
        ];
    }

    public function puedeTransicionarA(self $destino): bool
    {
        return match ($this) {
            self::Creado => $destino === self::Entregado,
            self::Entregado => $destino === self::Devuelto,
            self::Devuelto => false,
        };
    }
}
