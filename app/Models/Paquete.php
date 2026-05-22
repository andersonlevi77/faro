<?php

namespace App\Models;

use Database\Factories\PaqueteFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Paquete extends Model
{
    /** @use HasFactory<PaqueteFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'nombre',
        'codigo',
        'descripcion',
        'precio_alquiler',
        'activo',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'precio_alquiler' => 'decimal:2',
            'activo' => 'boolean',
        ];
    }

    /** @return BelongsToMany<Producto> */
    public function productos(): BelongsToMany
    {
        return $this->belongsToMany(Producto::class, 'paquete_producto')
            ->withPivot('cantidad');
    }

    /** @return HasMany<AlquilerLinea> */
    public function alquilerLineas(): HasMany
    {
        return $this->hasMany(AlquilerLinea::class, 'paquete_id');
    }
}
