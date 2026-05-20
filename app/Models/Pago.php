<?php

namespace App\Models;

use App\Enums\MetodoPago;
use App\Enums\TipoPago;
use Database\Factories\PagoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pago extends Model
{
    /** @use HasFactory<PagoFactory> */
    use HasFactory;

    protected $table = 'pagos';

    /** @var list<string> */
    protected $fillable = [
        'alquiler_id',
        'tipo',
        'monto',
        'metodo_pago',
        'notas',
        'registrado_por',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'tipo' => TipoPago::class,
            'metodo_pago' => MetodoPago::class,
            'monto' => 'decimal:2',
        ];
    }

    public function alquiler(): BelongsTo
    {
        return $this->belongsTo(Alquiler::class, 'alquiler_id');
    }

    public function registradoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registrado_por');
    }
}
