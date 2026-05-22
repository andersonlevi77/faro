<?php

namespace App\Http\Controllers;

use App\Enums\EstadoMantenimiento;
use App\Http\Concerns\SortsPaginatedIndex;
use App\Http\Requests\StoreMantenimientoRequest;
use App\Http\Requests\UpdateMantenimientoRequest;
use App\Models\Mantenimiento;
use App\Models\Producto;
use App\Models\ProductoUnidad;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MantenimientoController extends Controller
{
    use SortsPaginatedIndex;

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Mantenimiento::class);

        $query = Mantenimiento::query()
            ->with(['unidad.producto', 'producto', 'creadoPor'])
            ->when($request->filled('estado'), fn ($q) => $q->where('estado', $request->string('estado')))
            ->when($request->filled('buscar'), function ($q) use ($request): void {
                $b = '%'.$request->string('buscar').'%';
                $q->where('titulo', 'like', $b)
                    ->orWhereHas('unidad', fn ($u) => $u->where('codigo', 'like', $b))
                    ->orWhereHas('producto', fn ($p) => $p->where('nombre', 'like', $b));
            });

        $this->applyIndexSort($query, $request, [
            'titulo' => 'titulo',
            'estado' => 'estado',
            'costo' => 'costo',
            'fecha_programada' => 'fecha_programada',
        ], 'created_at', 'desc');

        $mantenimientos = $query->paginate(20)->withQueryString();

        return Inertia::render('mantenimientos/index', [
            'mantenimientos' => $mantenimientos,
            'filters' => array_merge(
                $request->only(['buscar', 'estado']),
                $this->indexSortFilters($request),
            ),
            'estados' => collect(EstadoMantenimiento::cases())->map(fn (EstadoMantenimiento $e) => [
                'value' => $e->value,
                'label' => $e->etiqueta(),
                'color' => $e->color(),
            ]),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Mantenimiento::class);

        $unidad = $request->filled('unidad_id')
            ? ProductoUnidad::query()->with('producto')->find($request->integer('unidad_id'))
            : null;

        return Inertia::render('mantenimientos/crear', [
            'unidadInicial' => $unidad,
            'productos' => Producto::query()
                ->where('activo', true)
                ->with(['categoria:id,nombre', 'marca:id,nombre'])
                ->orderBy('nombre')
                ->get(['id', 'nombre', 'codigo', 'categoria_id', 'marca_id'])
                ->map(fn (Producto $producto) => [
                    'id' => $producto->id,
                    'nombre' => $producto->nombre,
                    'codigo' => $producto->codigo,
                    'marca_nombre' => $producto->marca?->nombre,
                    'categoria_nombre' => $producto->categoria?->nombre,
                ])
                ->values(),
            'unidades' => ProductoUnidad::query()
                ->with('producto:id,nombre,codigo')
                ->orderBy('codigo')
                ->get()
                ->map(fn (ProductoUnidad $unidad) => [
                    'id' => $unidad->id,
                    'codigo' => $unidad->codigo,
                    'estado' => $unidad->estado->value,
                    'estado_label' => $unidad->estado->etiqueta(),
                    'producto_id' => $unidad->producto_id,
                    'producto_nombre' => $unidad->producto?->nombre,
                    'producto_codigo' => $unidad->producto?->codigo,
                ]),
        ]);
    }

    public function store(StoreMantenimientoRequest $request): RedirectResponse
    {
        $this->authorize('create', Mantenimiento::class);

        $mantenimiento = Mantenimiento::create([
            ...$request->validated(),
            'estado' => EstadoMantenimiento::Pendiente,
            'costo' => $request->filled('costo') ? $request->string('costo') : '0',
            'creado_por' => $request->user()?->id,
        ]);

        return to_route('mantenimientos.show', $mantenimiento)
            ->with('success', 'Mantenimiento creado. La unidad fue marcada en mantenimiento.');
    }

    public function show(Mantenimiento $mantenimiento): Response
    {
        $this->authorize('view', $mantenimiento);

        $mantenimiento->load(['unidad.producto', 'producto', 'creadoPor', 'resueltoPor']);

        $estados = collect(EstadoMantenimiento::cases())->map(fn (EstadoMantenimiento $e) => [
            'value' => $e->value,
            'label' => $e->etiqueta(),
            'color' => $e->color(),
        ]);

        return Inertia::render('mantenimientos/ver', [
            'mantenimiento' => $mantenimiento,
            'estados' => $estados,
        ]);
    }

    public function update(UpdateMantenimientoRequest $request, Mantenimiento $mantenimiento): RedirectResponse
    {
        $this->authorize('update', $mantenimiento);

        $data = $request->validated();
        $nuevoEstado = EstadoMantenimiento::from($data['estado']);

        if ($nuevoEstado === EstadoMantenimiento::EnProceso && $mantenimiento->fecha_inicio_at === null) {
            $data['fecha_inicio_at'] = now();
        }

        if ($nuevoEstado === EstadoMantenimiento::Completado) {
            $data['fecha_fin_at'] = now();
            $data['resuelto_por'] = $request->user()?->id;
        }

        $mantenimiento->update($data);

        return back()->with('success', 'Mantenimiento actualizado.');
    }
}
