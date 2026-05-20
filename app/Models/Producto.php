<?php

namespace App\Models;

use App\Enums\TrackingMode;
use Database\Factories\ProductoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Producto extends Model
{
    /** @use HasFactory<ProductoFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'productos';

    /** @var list<string> */
    protected $fillable = [
        'slug',
        'codigo',
        'nombre',
        'descripcion',
        'codigo_barras',
        'marca_id',
        'categoria_id',
        'presentacion_id',
        'proveedor_id',
        'precio_compra',
        'precio_venta',
        'stock_minimo',
        'stock_maximo',
        'activo',
        'es_alquilable',
        'tracking_mode',
        'stock_alquiler',
        'precio_alquiler_diario',
        'deposito_unitario',
        'creado_por',
        'actualizado_por',
        'eliminado_por',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'precio_compra' => 'decimal:2',
            'precio_venta' => 'decimal:2',
            'activo' => 'boolean',
            'es_alquilable' => 'boolean',
            'tracking_mode' => TrackingMode::class,
            'stock_alquiler' => 'decimal:3',
            'precio_alquiler_diario' => 'decimal:2',
            'deposito_unitario' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Producto $producto): void {
            if (empty($producto->slug) && ! empty($producto->nombre)) {
                $producto->slug = Str::slug($producto->nombre);
            }
        });
    }

    public function esIndividual(): bool
    {
        return $this->tracking_mode === TrackingMode::Individual;
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    public function marca(): BelongsTo
    {
        return $this->belongsTo(Marca::class, 'marca_id');
    }

    public function presentacion(): BelongsTo
    {
        return $this->belongsTo(Presentacion::class, 'presentacion_id');
    }

    public function creadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creado_por');
    }

    public function actualizadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actualizado_por');
    }

    public function eliminadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'eliminado_por');
    }

    /** @return HasMany<Lote> */
    public function lotes(): HasMany
    {
        return $this->hasMany(Lote::class, 'producto_id');
    }

    /** @return HasMany<AlquilerLinea> */
    public function alquilerLineas(): HasMany
    {
        return $this->hasMany(AlquilerLinea::class, 'producto_id');
    }

    /** @return HasMany<ProductoUnidad> */
    public function unidades(): HasMany
    {
        return $this->hasMany(ProductoUnidad::class, 'producto_id');
    }

    /** Stock total sumando cantidad de todos los lotes vigentes (no vencidos). */
    public function stockDisponible(): float
    {
        return (float) $this->lotes()
            ->where('fecha_vencimiento', '>', now()->toDateString())
            ->sum('cantidad');
    }

    /** Unidades disponibles para alquilar (solo productos individuales). */
    public function unidadesDisponibles(): int
    {
        return $this->unidades()->where('estado', 'disponible')->count();
    }
}
