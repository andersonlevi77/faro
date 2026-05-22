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
use App\Services\VerificadorDisponibilidadAlquiler;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductoController extends Controller
{
    public function index(Request $request, VerificadorDisponibilidadAlquiler $verificador): Response
    {
        $this->authorize('viewAny', Producto::class);

        $productos = Producto::query()
            ->with(['categoria', 'marca', 'presentacion'])
            ->when($request->filled('buscar'), fn ($q) => $q->where('nombre', 'like', '%'.$request->buscar.'%')
                ->orWhere('codigo', 'like', '%'.$request->buscar.'%'))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $productos->through(function (Producto $producto) use ($verificador): Producto {
            $producto->setAttribute('disponibilidad_actual', $verificador->cantidadDisponibleActiva($producto));
            $producto->setAttribute('stock_alquiler', (string) (int) (float) $producto->stock_alquiler);

            return $producto;
        });

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
        ]);
    }

    public function store(StoreProductoRequest $request): RedirectResponse
    {
        $this->authorize('create', Producto::class);

        $data = array_merge($request->validated(), [
            'es_alquilable' => true,
            'tracking_mode' => TrackingMode::Bulk->value,
            'deposito_unitario' => '0',
        ]);
        $data['creado_por'] = $request->user()->id;
        $data['precio_compra'] = 0;
        $data['precio_venta'] = 0;
        $data['stock_maximo'] = null;
        $data['activo'] = $request->boolean('activo', true);
        $data['stock_minimo'] = $request->filled('stock_minimo') ? (int) $request->stock_minimo : 0;
        $data['stock_alquiler'] = $request->string('stock_alquiler');
        $data['precio_alquiler_diario'] = $request->string('precio_alquiler_diario');

        Producto::create($data);

        return to_route('productos.index')->with('success', 'Producto registrado correctamente.');
    }

    public function show(Producto $producto): Response
    {
        $this->authorize('view', $producto);

        $producto->load(['categoria', 'marca', 'presentacion']);

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

        return Inertia::render('inventario/productos/editar', [
            'producto' => $producto,
            'categorias' => Categoria::orderBy('nombre')->get(['id', 'nombre']),
            'marcas' => Marca::orderBy('nombre')->get(['id', 'nombre']),
            'presentaciones' => Presentacion::orderBy('nombre')->get(['id', 'nombre']),
        ]);
    }

    public function update(UpdateProductoRequest $request, Producto $producto): RedirectResponse
    {
        $this->authorize('update', $producto);

        $data = array_merge($request->validated(), [
            'es_alquilable' => true,
            'tracking_mode' => TrackingMode::Bulk->value,
            'deposito_unitario' => '0',
        ]);
        $data['actualizado_por'] = $request->user()->id;
        $data['precio_compra'] = 0;
        $data['precio_venta'] = 0;
        $data['stock_maximo'] = null;
        $data['activo'] = $request->boolean('activo', true);
        $data['stock_minimo'] = $request->filled('stock_minimo') ? (int) $request->stock_minimo : 0;
        $data['stock_alquiler'] = $request->string('stock_alquiler');
        $data['precio_alquiler_diario'] = $request->string('precio_alquiler_diario');

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
