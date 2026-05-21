<?php

namespace App\Models;

use Database\Factories\CategoriaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Categoria extends Model
{
    /** @use HasFactory<CategoriaFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'categorias';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'nombre',
        'slug',
        'descripcion',
        'creado_por',
        'actualizado_por',
        'eliminado_por',
    ];

    protected static function booted(): void
    {
        static::creating(function (Categoria $categoria): void {
            if (! empty($categoria->slug) || empty($categoria->nombre)) {
                return;
            }

            $baseSlug = Str::slug($categoria->nombre);
            $slug = $baseSlug;
            $suffix = 2;

            while (static::query()->where('slug', $slug)->exists()) {
                $slug = $baseSlug.'-'.$suffix;
                $suffix++;
            }

            $categoria->slug = $slug;
        });
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

    /**
     * @return HasMany<Producto>
     */
    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class, 'categoria_id');
    }
}
