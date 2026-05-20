<?php

namespace App\Http\Controllers;

use App\Enums\EstadoUnidad;
use App\Enums\TrackingMode;
use App\Http\Requests\StoreProductoRequest;
use App\Http\Requests\UpdateProductoRequest;
use App\Models\Categoria;
use App\Models\Marca;
use App\Models\Presentacion;
use App\Models\Producto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductoController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Producto::class);

        $productos = Producto::query()
            ->with(['categoria', 'marca', 'presentacion'])
            ->when($request->filled('buscar'), fn ($q) => $q->where('nombre', 'like', '%'.$request->buscar.'%')
                ->orWhere('codigo', 'like', '%'.$request->buscar.'%')
                ->orWhere('codigo_barras', 'like', '%'.$request->buscar.'%'))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('inventario/productos/index', [
            'productos' => $productos,
            'filters' => $request->only(['buscar']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Producto::class);

        return Inertia::render('inventario/productos/crear', [
            'categorias' => Categoria::orderBy('nombre')->get(['id', 'nombre']),
            'marcas' => Marca::orderBy('nombre')->get(['id', 'nombre']),
            'presentaciones' => Presentacion::orderBy('nombre')->get(['id', 'nombre']),
            'trackingModes' => collect(TrackingMode::cases())->map(fn (TrackingMode $t) => [
                'value' => $t->value,
                'label' => $t->etiqueta(),
            ]),
        ]);
    }

    public function store(StoreProductoRequest $request): RedirectResponse
    {
        $this->authorize('create', Producto::class);

        $data = $request->validated();
        $data['creado_por'] = $request->user()->id;
        $data['activo'] = $request->boolean('activo', true);
        $data['es_alquilable'] = $request->boolean('es_alquilable', false);
        $data['stock_minimo'] = $request->filled('stock_minimo') ? (int) $request->stock_minimo : 0;
        $data['stock_maximo'] = $request->filled('stock_maximo') ? (int) $request->stock_maximo : null;
        $data['tracking_mode'] = $request->input('tracking_mode', TrackingMode::Bulk->value);
        $data['stock_alquiler'] = $request->filled('stock_alquiler') ? $request->string('stock_alquiler') : '0';
        $data['precio_alquiler_diario'] = $request->filled('precio_alquiler_diario') ? $request->string('precio_alquiler_diario') : null;
        $data['deposito_unitario'] = $request->filled('deposito_unitario') ? $request->string('deposito_unitario') : null;

        Producto::create($data);

        return to_route('productos.index')->with('success', 'Producto registrado correctamente.');
    }

    public function show(Producto $producto): Response
    {
        $this->authorize('view', $producto);

        $producto->load(['categoria', 'marca', 'presentacion', 'lotes' => fn ($q) => $q->orderBy('fecha_vencimiento')]);

        $estadosUnidad = collect(EstadoUnidad::cases())->map(fn (EstadoUnidad $e) => [
            'value' => $e->value,
            'label' => $e->etiqueta(),
            'color' => $e->color(),
        ]);

        return Inertia::render('inventario/productos/ver', [
            'producto' => $producto,
            'unidades' => $producto->esIndividual()
                ? $producto->unidades()->orderBy('codigo')->get()
                : [],
            'estadosUnidad' => $estadosUnidad,
        ]);
    }

    public function edit(Producto $producto): Response
    {
        $this->authorize('update', $producto);

        $producto->load(['lotes' => fn ($q) => $q->orderBy('fecha_vencimiento')]);

        return Inertia::render('inventario/productos/editar', [
            'producto' => $producto,
            'categorias' => Categoria::orderBy('nombre')->get(['id', 'nombre']),
            'marcas' => Marca::orderBy('nombre')->get(['id', 'nombre']),
            'presentaciones' => Presentacion::orderBy('nombre')->get(['id', 'nombre']),
            'trackingModes' => collect(TrackingMode::cases())->map(fn (TrackingMode $t) => [
                'value' => $t->value,
                'label' => $t->etiqueta(),
            ]),
        ]);
    }

    public function update(UpdateProductoRequest $request, Producto $producto): RedirectResponse
    {
        $this->authorize('update', $producto);

        $data = $request->validated();
        $data['actualizado_por'] = $request->user()->id;
        $data['activo'] = $request->boolean('activo', true);
        $data['es_alquilable'] = $request->boolean('es_alquilable', false);
        $data['stock_minimo'] = $request->filled('stock_minimo') ? (int) $request->stock_minimo : 0;
        $data['stock_maximo'] = $request->filled('stock_maximo') ? (int) $request->stock_maximo : null;
        $data['tracking_mode'] = $request->input('tracking_mode', TrackingMode::Bulk->value);
        $data['stock_alquiler'] = $request->filled('stock_alquiler') ? $request->string('stock_alquiler') : '0';
        $data['precio_alquiler_diario'] = $request->filled('precio_alquiler_diario') ? $request->string('precio_alquiler_diario') : null;
        $data['deposito_unitario'] = $request->filled('deposito_unitario') ? $request->string('deposito_unitario') : null;

        $producto->update($data);

        return to_route('productos.index')->with('success', 'Producto actualizado correctamente.');
    }

    public function destroy(Producto $producto): RedirectResponse
    {
        $this->authorize('delete', $producto);

        $producto->eliminado_por = request()->user()?->id;
        $producto->save();
        $producto->delete();

        return to_route('productos.index')->with('success', 'Producto eliminado.');
    }
}
