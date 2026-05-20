<?php

namespace App\Http\Controllers;

use App\Enums\EstadoAlquiler;
use App\Enums\MetodoPago;
use App\Enums\TipoPago;
use App\Http\Requests\StoreAlquilerRequest;
use App\Http\Requests\UpdateAlquilerRequest;
use App\Models\Alquiler;
use App\Models\AlquilerLinea;
use App\Models\Cliente;
use App\Models\Pago;
use App\Models\Producto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AlquilerController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Alquiler::class);

        $alquileres = Alquiler::query()
            ->with(['cliente'])
            ->withCount('lineas')
            ->when($request->filled('estado'), fn ($q) => $q->where('estado', $request->string('estado')))
            ->when($request->filled('buscar'), function ($q) use ($request): void {
                $b = '%'.$request->string('buscar').'%';
                $q->where(function ($inner) use ($b): void {
                    $inner->where('codigo', 'like', $b)
                        ->orWhereHas('cliente', fn ($c) => $c->where('nombre', 'like', $b));
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        // Eager-load pagos so saldoPendiente() doesn't N+1
        $alquileres->getCollection()->load('pagos:id,alquiler_id,tipo,monto');

        $saldos = $alquileres->getCollection()->mapWithKeys(
            fn (Alquiler $a) => [$a->id => $a->saldoPendiente()],
        );

        return Inertia::render('alquileres/alquileres/index', [
            'alquileres' => $alquileres,
            'filters' => $request->only(['buscar', 'estado']),
            'estados' => collect(EstadoAlquiler::cases())->map(fn (EstadoAlquiler $e) => [
                'value' => $e->value,
                'label' => $e->etiqueta(),
            ]),
            'saldos' => $saldos,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Alquiler::class);

        return Inertia::render('alquileres/alquileres/crear', [
            'clientes' => Cliente::query()->orderBy('nombre')->get(['id', 'nombre', 'documento']),
            'productosAlquiler' => Producto::query()
                ->where('activo', true)
                ->where('es_alquilable', true)
                ->whereNotNull('precio_alquiler_diario')
                ->with(['categoria', 'marca'])
                ->orderBy('nombre')
                ->get([
                    'id',
                    'nombre',
                    'codigo',
                    'stock_alquiler',
                    'precio_alquiler_diario',
                    'categoria_id',
                    'marca_id',
                ]),
        ]);
    }

    public function store(StoreAlquilerRequest $request): RedirectResponse
    {
        $this->authorize('create', Alquiler::class);

        $alquiler = DB::transaction(function () use ($request): Alquiler {
            $inicio = $request->date('fecha_inicio_prevista');
            $fin = $request->date('fecha_fin_prevista');

            $alquiler = Alquiler::create([
                'cliente_id' => (int) $request->validated('cliente_id'),
                'user_id' => $request->user()->id,
                'estado' => EstadoAlquiler::Borrador,
                'fecha_inicio_prevista' => $inicio,
                'fecha_fin_prevista' => $fin,
                'deposito_monto' => $request->filled('deposito_monto') ? $request->string('deposito_monto') : '0',
                'notas' => $request->validated('notas') ?? null,
            ]);

            $this->reemplazarLineas($alquiler, $request->validated('lineas'));
            $alquiler->recalcularTotalDesdeLineas();
            $alquiler->save();

            return $alquiler;
        });

        return to_route('alquileres.show', $alquiler)->with('success', 'Alquiler creado como borrador.');
    }

    public function show(Alquiler $alquiler): Response
    {
        $this->authorize('view', $alquiler);

        $alquiler->load(['cliente', 'usuario', 'lineas.producto.categoria', 'lineas.producto.marca', 'pagos.registradoPor']);

        $user = request()->user();

        $transiciones = collect(EstadoAlquiler::cases())
            ->filter(fn (EstadoAlquiler $e) => $alquiler->estadoEnum()->puedeTransicionarA($e))
            ->map(fn (EstadoAlquiler $e) => [
                'value' => $e->value,
                'label' => $e->etiqueta(),
            ])
            ->values()
            ->all();

        return Inertia::render('alquileres/alquileres/ver', [
            'alquiler' => $alquiler,
            'transicionesPermitidas' => $transiciones,
            'puedeEditar' => $alquiler->estadoEnum() === EstadoAlquiler::Borrador
                && ($user?->can('update', $alquiler) ?? false),
            'puedeCambiarEstado' => $user?->can('cambiarEstado', $alquiler) ?? false,
            'puedeCobrar' => $user?->can('create', Pago::class) ?? false,
            'resumen' => [
                'total_alquiler' => $alquiler->total,
                'deposito' => $alquiler->deposito_monto,
                'total_cobrado' => $alquiler->totalCobrado(),
                'total_devuelto' => $alquiler->totalDevuelto(),
                'saldo_pendiente' => $alquiler->saldoPendiente(),
            ],
            'tiposPago' => collect(TipoPago::cases())->map(fn ($e) => ['value' => $e->value, 'label' => $e->etiqueta()]),
            'metodosPago' => collect(MetodoPago::cases())->map(fn ($e) => ['value' => $e->value, 'label' => $e->etiqueta()]),
        ]);
    }

    public function edit(Alquiler $alquiler): Response
    {
        $this->authorize('update', $alquiler);

        if ($alquiler->estadoEnum() !== EstadoAlquiler::Borrador) {
            abort(403, 'Solo se pueden editar alquileres en borrador.');
        }

        $alquiler->load('lineas.producto');

        return Inertia::render('alquileres/alquileres/editar', [
            'alquiler' => $alquiler,
            'clientes' => Cliente::query()->orderBy('nombre')->get(['id', 'nombre', 'documento']),
            'productosAlquiler' => Producto::query()
                ->where('activo', true)
                ->where('es_alquilable', true)
                ->whereNotNull('precio_alquiler_diario')
                ->with(['categoria', 'marca'])
                ->orderBy('nombre')
                ->get([
                    'id',
                    'nombre',
                    'codigo',
                    'stock_alquiler',
                    'precio_alquiler_diario',
                    'categoria_id',
                    'marca_id',
                ]),
        ]);
    }

    public function update(UpdateAlquilerRequest $request, Alquiler $alquiler): RedirectResponse
    {
        $this->authorize('update', $alquiler);

        if ($alquiler->estadoEnum() !== EstadoAlquiler::Borrador) {
            abort(403);
        }

        DB::transaction(function () use ($request, $alquiler): void {
            $alquiler->update([
                'cliente_id' => (int) $request->validated('cliente_id'),
                'fecha_inicio_prevista' => $request->date('fecha_inicio_prevista'),
                'fecha_fin_prevista' => $request->date('fecha_fin_prevista'),
                'deposito_monto' => $request->filled('deposito_monto') ? $request->string('deposito_monto') : '0',
                'notas' => $request->validated('notas') ?? null,
            ]);

            $this->reemplazarLineas($alquiler, $request->validated('lineas'));
            $alquiler->recalcularTotalDesdeLineas();
            $alquiler->save();
        });

        return to_route('alquileres.show', $alquiler)->with('success', 'Alquiler actualizado.');
    }

    public function destroy(Alquiler $alquiler): RedirectResponse
    {
        $this->authorize('delete', $alquiler);

        if (! in_array($alquiler->estadoEnum(), [EstadoAlquiler::Borrador, EstadoAlquiler::Cancelado], true)) {
            return back()->with('error', 'Solo se pueden eliminar borradores o alquileres cancelados.');
        }

        $alquiler->delete();

        return to_route('alquileres.index')->with('success', 'Alquiler eliminado.');
    }

    /**
     * @param  array<int, array{producto_id: int|string, cantidad: float|int|string}>  $lineas
     */
    private function reemplazarLineas(Alquiler $alquiler, array $lineas): void
    {
        $alquiler->lineas()->delete();

        $inicio = $alquiler->fecha_inicio_prevista;
        $fin = $alquiler->fecha_fin_prevista;
        $dias = Alquiler::calcularDias($inicio, $fin);

        foreach ($lineas as $row) {
            $producto = Producto::query()->findOrFail((int) $row['producto_id']);
            if (! $producto->es_alquilable || $producto->precio_alquiler_diario === null) {
                throw ValidationException::withMessages([
                    'lineas' => 'El producto «'.$producto->nombre.'» no está habilitado para alquiler o no tiene precio diario.',
                ]);
            }

            $precio = (string) $producto->precio_alquiler_diario;
            $cant = (string) $row['cantidad'];
            $subtotal = bcmul(bcmul($precio, (string) $dias, 2), $cant, 2);

            AlquilerLinea::create([
                'alquiler_id' => $alquiler->id,
                'producto_id' => $producto->id,
                'cantidad' => $cant,
                'dias' => $dias,
                'precio_diario' => $precio,
                'subtotal' => $subtotal,
            ]);
        }
    }
}
