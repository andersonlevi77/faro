<?php

namespace App\Models;

use Database\Factories\LoteFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lote extends Model
{
    /** @use HasFactory<LoteFactory> */
    use HasFactory;

    protected $table = 'lotes';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'producto_id',
        'numero_lote',
        'fecha_vencimiento',
        'cantidad',
        'cantidad_inicial',
        'creado_por',
        'actualizado_por',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fecha_vencimiento' => 'date',
            'cantidad' => 'decimal:3',
            'cantidad_inicial' => 'decimal:3',
        ];
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }

    public function creadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creado_por');
    }

    public function actualizadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actualizado_por');
    }

    /**
     * Scope: lotes no vencidos.
     *
     * @param  Builder<Lote>  $query
     * @return Builder<Lote>
     */
    public function scopeVigentes(Builder $query): Builder
    {
        return $query->where('fecha_vencimiento', '>', now()->toDateString());
    }

    public function estaVencido(): bool
    {
        return $this->fecha_vencimiento->isPast();
    }
}
