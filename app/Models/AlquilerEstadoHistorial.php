<?php

namespace App\Models;

use App\Enums\EstadoAlquiler;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AlquilerEstadoHistorial extends Model
{
    public $timestamps = false;

    /** @var list<string> */
    protected $fillable = [
        'alquiler_id',
        'estado_anterior',
        'estado_nuevo',
        'user_id',
        'created_at',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public static function registrar(
        Alquiler $alquiler,
        ?EstadoAlquiler $estadoAnterior,
        EstadoAlquiler $estadoNuevo,
        ?int $userId,
    ): self {
        return self::query()->create([
            'alquiler_id' => $alquiler->id,
            'estado_anterior' => $estadoAnterior?->value,
            'estado_nuevo' => $estadoNuevo->value,
            'user_id' => $userId,
            'created_at' => now(),
        ]);
    }

    public function alquiler(): BelongsTo
    {
        return $this->belongsTo(Alquiler::class, 'alquiler_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function estadoAnteriorEnum(): ?EstadoAlquiler
    {
        return $this->estado_anterior !== null
            ? EstadoAlquiler::from($this->estado_anterior)
            : null;
    }

    public function estadoNuevoEnum(): EstadoAlquiler
    {
        return EstadoAlquiler::from($this->estado_nuevo);
    }
}
