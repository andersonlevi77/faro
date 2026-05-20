<?php

namespace App\Models;

use Database\Factories\AlquilerLineaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class AlquilerLinea extends Model
{
    /** @use HasFactory<AlquilerLineaFactory> */
    use HasFactory;

    protected $table = 'alquiler_lineas';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'alquiler_id',
        'producto_id',
        'cantidad',
        'dias',
        'precio_diario',
        'subtotal',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'cantidad' => 'decimal:3',
            'dias' => 'integer',
            'precio_diario' => 'decimal:2',
            'subtotal' => 'decimal:2',
        ];
    }

    public function alquiler(): BelongsTo
    {
        return $this->belongsTo(Alquiler::class, 'alquiler_id');
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }

    /** @return BelongsToMany<ProductoUnidad> */
    public function unidades(): BelongsToMany
    {
        return $this->belongsToMany(ProductoUnidad::class, 'alquiler_linea_unidades', 'alquiler_linea_id', 'producto_unidad_id');
    }
}
