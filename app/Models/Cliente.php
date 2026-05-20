<?php

namespace App\Models;

use App\Enums\EstadoAlquiler;
use Database\Factories\ClienteFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cliente extends Model
{
    /** @use HasFactory<ClienteFactory> */
    use HasFactory;

    protected $table = 'clientes';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'nombre',
        'documento',
        'email',
        'telefono',
        'direccion',
        'ciudad',
        'notas',
        'creado_por',
        'actualizado_por',
    ];

    public function creadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creado_por');
    }

    public function actualizadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actualizado_por');
    }

    /**
     * @return HasMany<Alquiler>
     */
    public function alquileres(): HasMany
    {
        return $this->hasMany(Alquiler::class, 'cliente_id');
    }

    /**
     * Puntuación del cliente de 0–100 basada en historial.
     * +5 por alquiler completado/cerrado, +2 por devuelto a tiempo,
     * -10 por alquiler cancelado, -5 por daño registrado.
     */
    public function puntuacion(): int
    {
        $alquileres = $this->alquileres()
            ->with('pagos:id,alquiler_id,tipo,monto')
            ->get(['id', 'cliente_id', 'estado', 'fecha_fin_prevista', 'fecha_devolucion_at', 'danio_monto']);

        $score = 50; // Base

        foreach ($alquileres as $a) {
            $estado = $a->estado instanceof EstadoAlquiler
                ? $a->estado
                : EstadoAlquiler::from($a->estado);

            if ($estado === EstadoAlquiler::Cerrado) {
                $score += 5;
            }

            if ($estado === EstadoAlquiler::Cancelado) {
                $score -= 10;
            }

            // Devuelto a tiempo (antes o el mismo día del fin previsto)
            if ($a->fecha_devolucion_at !== null && $a->fecha_fin_prevista !== null) {
                if ($a->fecha_devolucion_at <= $a->fecha_fin_prevista) {
                    $score += 2;
                } else {
                    $score -= 3;
                }
            }

            // Daño registrado
            if ((float) $a->danio_monto > 0) {
                $score -= 5;
            }
        }

        return max(0, min(100, $score));
    }

    public function etiquetaPuntuacion(): string
    {
        $p = $this->puntuacion();

        if ($p >= 80) {
            return 'Excelente';
        }

        if ($p >= 60) {
            return 'Bueno';
        }

        if ($p >= 40) {
            return 'Regular';
        }

        return 'Bajo';
    }
}
