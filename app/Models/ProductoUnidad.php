<?php

namespace App\Models;

use App\Enums\EstadoUnidad;
use Database\Factories\ProductoUnidadFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductoUnidad extends Model
{
    /** @use HasFactory<ProductoUnidadFactory> */
    use HasFactory;

    protected $table = 'producto_unidades';

    /** @var list<string> */
    protected $fillable = [
        'producto_id',
        'codigo',
        'estado',
        'notas',
        'creado_por',
        'actualizado_por',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'estado' => EstadoUnidad::class,
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

    /** @return BelongsToMany<AlquilerLinea> */
    public function alquilerLineas(): BelongsToMany
    {
        return $this->belongsToMany(AlquilerLinea::class, 'alquiler_linea_unidades', 'producto_unidad_id', 'alquiler_linea_id');
    }

    /** @return HasMany<Mantenimiento> */
    public function mantenimientos(): HasMany
    {
        return $this->hasMany(Mantenimiento::class, 'producto_unidad_id');
    }

    public function estaDisponible(): bool
    {
        return $this->estado === EstadoUnidad::Disponible;
    }
}
