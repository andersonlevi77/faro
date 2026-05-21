<?php

namespace App\Models;

use App\Enums\EstadoAlquiler;
use App\Enums\TipoPago;
use Carbon\CarbonInterface;
use Database\Factories\AlquilerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Alquiler extends Model
{
    /** @use HasFactory<AlquilerFactory> */
    use HasFactory;

    protected $table = 'alquileres';

    /** @var list<string> */
    protected $fillable = [
        'codigo',
        'cliente_id',
        'user_id',
        'estado',
        'fecha_inicio_prevista',
        'fecha_fin_prevista',
        'fecha_entrega_at',
        'fecha_devolucion_at',
        'deposito_monto',
        'total',
        'notas',
        'danio_descripcion',
        'danio_monto',
        'deposito_devuelto',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'estado' => EstadoAlquiler::class,
            'fecha_inicio_prevista' => 'date',
            'fecha_fin_prevista' => 'date',
            'fecha_entrega_at' => 'datetime',
            'fecha_devolucion_at' => 'datetime',
            'deposito_monto' => 'decimal:2',
            'total' => 'decimal:2',
            'danio_monto' => 'decimal:2',
            'deposito_devuelto' => 'decimal:2',
        ];
    }

    public static function calcularDias(CarbonInterface $inicio, CarbonInterface $fin): int
    {
        $i = $inicio->copy()->startOfDay();
        $f = $fin->copy()->startOfDay();

        return max(1, (int) $i->diffInDays($f) + 1);
    }

    protected static function booted(): void
    {
        static::creating(function (Alquiler $alquiler): void {
            if (empty($alquiler->codigo)) {
                $alquiler->codigo = static::reservarSiguienteCodigo();
            }
            if (empty($alquiler->estado)) {
                $alquiler->estado = EstadoAlquiler::Borrador;
            }
        });

        static::created(function (Alquiler $alquiler): void {
            AlquilerEstadoHistorial::registrar(
                $alquiler,
                null,
                $alquiler->estadoEnum(),
                $alquiler->user_id ?? auth()->id(),
            );
        });
    }

    public static function reservarSiguienteCodigo(): string
    {
        return DB::transaction(function (): string {
            $maxNumerico = static::query()
                ->lockForUpdate()
                ->pluck('codigo')
                ->map(fn (string $codigo): int => ctype_digit($codigo) ? (int) $codigo : 0)
                ->max() ?? 0;

            return (string) ($maxNumerico + 1);
        });
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** @return HasMany<AlquilerLinea> */
    public function lineas(): HasMany
    {
        return $this->hasMany(AlquilerLinea::class, 'alquiler_id');
    }

    /** @return HasMany<Pago> */
    public function pagos(): HasMany
    {
        return $this->hasMany(Pago::class, 'alquiler_id');
    }

    /** @return HasMany<AlquilerEstadoHistorial> */
    public function historialEstados(): HasMany
    {
        return $this->hasMany(AlquilerEstadoHistorial::class, 'alquiler_id')
            ->orderByDesc('created_at')
            ->orderByDesc('id');
    }

    public function estadoEnum(): EstadoAlquiler
    {
        return $this->estado instanceof EstadoAlquiler
            ? $this->estado
            : EstadoAlquiler::from((string) $this->estado);
    }

    public function recalcularTotalDesdeLineas(): void
    {
        $suma = $this->lineas()->sum('subtotal');
        $this->total = (string) $suma;
    }

    public function estaAtrasado(): bool
    {
        $hoy = now()->toDateString();

        return $this->fecha_fin_prevista->toDateString() < $hoy
            && in_array($this->estadoEnum(), EstadoAlquiler::activos(), true);
    }

    /** Total cobrado al cliente (ingresos). */
    public function totalCobrado(): string
    {
        $sum = $this->pagos()
            ->whereIn('tipo', array_map(
                fn (TipoPago $t) => $t->value,
                array_filter(TipoPago::cases(), fn (TipoPago $t) => $t->esIngreso()),
            ))
            ->sum('monto');

        return number_format((float) $sum, 2, '.', '');
    }

    /** Total devuelto al cliente (egresos). */
    public function totalDevuelto(): string
    {
        $sum = $this->pagos()
            ->where('tipo', TipoPago::DevolucionDeposito->value)
            ->sum('monto');

        return number_format((float) $sum, 2, '.', '');
    }

    /** Saldo pendiente por cobrar (total alquiler + depósito − pagado). */
    public function saldoPendiente(): string
    {
        $deuda = bcadd((string) $this->total, (string) $this->deposito_monto, 2);
        $cobrado = $this->totalCobrado();

        return bcsub($deuda, $cobrado, 2);
    }
}
