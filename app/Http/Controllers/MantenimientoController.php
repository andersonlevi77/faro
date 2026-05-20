<?php

namespace App\Http\Controllers;

use App\Enums\EstadoMantenimiento;
use App\Http\Requests\StoreMantenimientoRequest;
use App\Http\Requests\UpdateMantenimientoRequest;
use App\Models\Mantenimiento;
use App\Models\ProductoUnidad;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MantenimientoController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Mantenimiento::class);

        $mantenimientos = Mantenimiento::query()
            ->with(['unidad.producto', 'producto', 'creadoPor'])
            ->when($request->filled('estado'), fn ($q) => $q->where('estado', $request->string('estado')))
            ->when($request->filled('buscar'), function ($q) use ($request): void {
                $b = '%'.$request->string('buscar').'%';
                $q->where('titulo', 'like', $b)
                    ->orWhereHas('unidad', fn ($u) => $u->where('codigo', 'like', $b))
                    ->orWhereHas('producto', fn ($p) => $p->where('nombre', 'like', $b));
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('mantenimientos/index', [
            'mantenimientos' => $mantenimientos,
            'filters' => $request->only(['buscar', 'estado']),
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
