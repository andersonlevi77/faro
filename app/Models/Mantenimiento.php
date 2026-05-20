<?php

namespace App\Models;

use App\Enums\EstadoMantenimiento;
use App\Enums\EstadoUnidad;
use Database\Factories\MantenimientoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Mantenimiento extends Model
{
    /** @use HasFactory<MantenimientoFactory> */
    use HasFactory;

    protected $table = 'mantenimientos';

    /** @var list<string> */
    protected $fillable = [
        'producto_unidad_id',
        'producto_id',
        'titulo',
        'descripcion',
        'costo',
        'estado',
        'fecha_programada',
        'fecha_inicio_at',
        'fecha_fin_at',
        'notas',
        'creado_por',
        'resuelto_por',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'estado' => EstadoMantenimiento::class,
            'costo' => 'decimal:2',
            'fecha_programada' => 'date',
            'fecha_inicio_at' => 'datetime',
            'fecha_fin_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::created(function (Mantenimiento $m): void {
            if ($m->producto_unidad_id !== null) {
                ProductoUnidad::query()->where('id', $m->producto_unidad_id)
                    ->update(['estado' => EstadoUnidad::Mantenimiento]);
            }
        });

        static::updated(function (Mantenimiento $m): void {
            if ($m->wasChanged('estado') && $m->estado === EstadoMantenimiento::Completado && $m->producto_unidad_id !== null) {
                ProductoUnidad::query()->where('id', $m->producto_unidad_id)
                    ->update(['estado' => EstadoUnidad::Disponible]);
            }
        });
    }

    public function unidad(): BelongsTo
    {
        return $this->belongsTo(ProductoUnidad::class, 'producto_unidad_id');
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }

    public function creadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creado_por');
    }

    public function resueltoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resuelto_por');
    }
}
