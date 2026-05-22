<?php

namespace App\Http\Controllers;

use App\Enums\EstadoAlquiler;
use App\Enums\MetodoPago;
use App\Enums\TipoPago;
use App\Http\Requests\StoreAlquilerRequest;
use App\Http\Requests\UpdateAlquilerRequest;
use App\Models\Alquiler;
use App\Models\AlquilerEstadoHistorial;
use App\Models\AlquilerLinea;
use App\Models\Cliente;
use App\Models\Pago;
use App\Models\Paquete;
use App\Models\Producto;
use App\Services\VerificadorDisponibilidadAlquiler;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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

    public function create(VerificadorDisponibilidadAlquiler $verificador): Response
    {
        $this->authorize('create', Alquiler::class);

        return Inertia::render('alquileres/alquileres/crear', $this->opcionesFormularioAlquiler($verificador));
    }

    public function store(StoreAlquilerRequest $request, VerificadorDisponibilidadAlquiler $verificador): RedirectResponse
    {
        $this->authorize('create', Alquiler::class);

        $alquiler = DB::transaction(function () use ($request, $verificador): Alquiler {
            $inicio = $request->date('fecha_inicio_prevista');
            $fin = $request->date('fecha_fin_prevista');

            $alquiler = Alquiler::create([
                'cliente_id' => (int) $request->validated('cliente_id'),
                'user_id' => $request->user()->id,
                'estado' => EstadoAlquiler::Creado,
                'fecha_inicio_prevista' => $inicio,
                'fecha_fin_prevista' => $fin,
                'deposito_monto' => $request->filled('deposito_monto') ? $request->string('deposito_monto') : '0',
                'notas' => $request->validated('notas') ?? null,
            ]);

            $this->reemplazarLineas($alquiler, $request->validated('lineas'));
            $alquiler->recalcularTotalDesdeLineas();
            $alquiler->save();

            $alquiler->load('lineas.producto', 'lineas.paquete.productos');
            $mensajeStock = $verificador->mensajeErrorStockLineas(
                $request->validated('lineas'),
                $alquiler->id,
            );
            if ($mensajeStock !== null) {
                throw ValidationException::withMessages(['lineas' => $mensajeStock]);
            }

            return $alquiler;
        });

        return to_route('alquileres.show', $alquiler)->with('success', 'Alquiler creado.');
    }

    public function show(Alquiler $alquiler): Response
    {
        $this->authorize('view', $alquiler);

        $alquiler->load([
            'cliente',
            'usuario',
            'lineas.producto.categoria',
            'lineas.producto.marca',
            'lineas.paquete.productos',
            'pagos.registradoPor',
            'historialEstados.usuario:id,name',
        ]);

        $user = request()->user();
        $estadoActual = $alquiler->estadoEnum();

        $transiciones = collect(EstadoAlquiler::cases())
            ->filter(fn (EstadoAlquiler $e) => $estadoActual->puedeTransicionarA($e))
            ->map(fn (EstadoAlquiler $e) => [
                'value' => $e->value,
                'label' => $e->etiqueta(),
                'color' => $e->color(),
            ])
            ->values()
            ->all();

        $historialEstados = $alquiler->historialEstados
            ->sortByDesc(fn (AlquilerEstadoHistorial $h) => $h->created_at->getTimestamp() * 1000 + $h->id)
            ->values()
            ->map(
                fn (AlquilerEstadoHistorial $h) => [
                    'id' => $h->id,
                    'estado_anterior' => $h->estado_anterior,
                    'estado_anterior_label' => $h->estadoAnteriorEnum()?->etiqueta(),
                    'estado_anterior_color' => $h->estadoAnteriorEnum()?->color(),
                    'estado_nuevo' => $h->estado_nuevo,
                    'estado_nuevo_label' => $h->estadoNuevoEnum()->etiqueta(),
                    'estado_nuevo_color' => $h->estadoNuevoEnum()->color(),
                    'usuario' => $h->usuario ? ['name' => $h->usuario->name] : null,
                    'created_at' => $h->created_at->toIso8601String(),
                ],
            )->values()->all();

        $flujoPrincipal = collect(EstadoAlquiler::flujoPrincipal())
            ->map(fn (EstadoAlquiler $e) => [
                'value' => $e->value,
                'label' => $e->etiqueta(),
                'color' => $e->color(),
            ])
            ->values()
            ->all();

        return Inertia::render('alquileres/alquileres/ver', [
            'alquiler' => $alquiler,
            'estadoActual' => [
                'value' => $estadoActual->value,
                'label' => $estadoActual->etiqueta(),
                'color' => $estadoActual->color(),
            ],
            'flujoPrincipal' => $flujoPrincipal,
            'historialEstados' => $historialEstados,
            'transicionesPermitidas' => $transiciones,
            'puedeEditar' => $alquiler->estadoEnum() === EstadoAlquiler::Creado
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

    public function edit(Alquiler $alquiler, VerificadorDisponibilidadAlquiler $verificador): Response
    {
        $this->authorize('update', $alquiler);

        if ($alquiler->estadoEnum() !== EstadoAlquiler::Creado) {
            abort(403, 'Solo se pueden editar alquileres en estado creado.');
        }

        $alquiler->load('lineas.producto');

        return Inertia::render('alquileres/alquileres/editar', [
            'alquiler' => $alquiler,
            ...$this->opcionesFormularioAlquiler($verificador, $alquiler),
        ]);
    }

    public function update(UpdateAlquilerRequest $request, Alquiler $alquiler, VerificadorDisponibilidadAlquiler $verificador): RedirectResponse
    {
        $this->authorize('update', $alquiler);

        if ($alquiler->estadoEnum() !== EstadoAlquiler::Creado) {
            abort(403);
        }

        $mensajeStock = $verificador->mensajeErrorStockLineas($request->validated('lineas'), $alquiler->id);
        if ($mensajeStock !== null) {
            throw ValidationException::withMessages(['lineas' => $mensajeStock]);
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

        if ($alquiler->estadoEnum() !== EstadoAlquiler::Creado) {
            return back()->with('error', 'Solo se pueden eliminar alquileres en estado creado.');
        }

        $alquiler->delete();

        return to_route('alquileres.index')->with('success', 'Alquiler eliminado.');
    }

    /**
     * @param  array<int, array{producto_id?: int|string|null, paquete_id?: int|string|null, cantidad: float|int|string, precio_diario?: float|int|string|null}>  $lineas
     */
    private function reemplazarLineas(Alquiler $alquiler, array $lineas): void
    {
        $alquiler->lineas()->delete();

        $inicio = $alquiler->fecha_inicio_prevista;
        $fin = $alquiler->fecha_fin_prevista;
        $dias = Alquiler::calcularDias($inicio, $fin);

        foreach ($lineas as $row) {
            $cant = (string) $row['cantidad'];

            if (! empty($row['paquete_id'])) {
                $paquete = Paquete::query()->with('productos')->findOrFail((int) $row['paquete_id']);
                if (! $paquete->activo || $paquete->productos->isEmpty()) {
                    throw ValidationException::withMessages([
                        'lineas' => 'El paquete «'.$paquete->nombre.'» no está disponible.',
                    ]);
                }

                $precio = isset($row['precio_diario']) && $row['precio_diario'] !== ''
                    ? (string) $row['precio_diario']
                    : (string) $paquete->precio_alquiler;
                $subtotal = bcmul(bcmul($precio, (string) $dias, 2), $cant, 2);

                AlquilerLinea::create([
                    'alquiler_id' => $alquiler->id,
                    'paquete_id' => $paquete->id,
                    'cantidad' => $cant,
                    'dias' => $dias,
                    'precio_diario' => $precio,
                    'subtotal' => $subtotal,
                ]);

                continue;
            }

            $producto = Producto::query()->findOrFail((int) $row['producto_id']);
            if (! $producto->es_alquilable || $producto->precio_alquiler_diario === null) {
                throw ValidationException::withMessages([
                    'lineas' => 'El producto «'.$producto->nombre.'» no está habilitado para alquiler o no tiene precio diario.',
                ]);
            }

            $precio = isset($row['precio_diario']) && $row['precio_diario'] !== ''
                ? (string) $row['precio_diario']
                : (string) $producto->precio_alquiler_diario;
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

    /**
     * @return array{
     *     clientes: Collection<int, array<string, mixed>>,
     *     productosAlquiler: Collection<int, array<string, mixed>>,
     *     paquetesAlquiler: Collection<int, array<string, mixed>>
     * }
     */
    private function opcionesFormularioAlquiler(
        VerificadorDisponibilidadAlquiler $verificador,
        ?Alquiler $excluirAlquiler = null,
    ): array {
        $excluirAlquilerId = $excluirAlquiler?->id;

        return [
            'clientes' => Cliente::query()
                ->orderBy('nombre')
                ->get(['id', 'nombre', 'documento', 'email', 'telefono']),
            'productosAlquiler' => Producto::query()
                ->where('activo', true)
                ->where('es_alquilable', true)
                ->whereNotNull('precio_alquiler_diario')
                ->with(['categoria:id,nombre', 'marca:id,nombre'])
                ->orderBy('nombre')
                ->get([
                    'id',
                    'nombre',
                    'codigo',
                    'stock_alquiler',
                    'precio_alquiler_diario',
                    'categoria_id',
                    'marca_id',
                ])
                ->map(fn (Producto $producto) => [
                    'id' => $producto->id,
                    'nombre' => $producto->nombre,
                    'codigo' => $producto->codigo,
                    'stock_alquiler' => (string) $producto->stock_alquiler,
                    'stock_disponible' => $verificador->cantidadDisponibleActiva($producto, $excluirAlquilerId),
                    'precio_alquiler_diario' => (string) $producto->precio_alquiler_diario,
                    'marca_nombre' => $producto->marca?->nombre,
                    'categoria_nombre' => $producto->categoria?->nombre,
                ])
                ->values(),
            'paquetesAlquiler' => Paquete::query()
                ->where('activo', true)
                ->with('productos:id,nombre,codigo')
                ->orderBy('nombre')
                ->get()
                ->map(fn (Paquete $paquete) => [
                    'id' => $paquete->id,
                    'nombre' => $paquete->nombre,
                    'codigo' => $paquete->codigo,
                    'precio_alquiler' => (string) $paquete->precio_alquiler,
                    'productos' => $paquete->productos->map(fn (Producto $p) => [
                        'nombre' => $p->nombre,
                        'codigo' => $p->codigo,
                        'cantidad' => (string) $p->pivot->cantidad,
                    ])->values(),
                ])
                ->values(),
        ];
    }
}
