<?php

namespace App\Http\Controllers;

use App\Http\Concerns\SortsPaginatedIndex;
use App\Http\Requests\StorePaqueteRequest;
use App\Http\Requests\UpdatePaqueteRequest;
use App\Models\Paquete;
use App\Models\Producto;
use App\Services\VerificadorDisponibilidadAlquiler;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PaqueteController extends Controller
{
    use SortsPaginatedIndex;

    public function index(Request $request, VerificadorDisponibilidadAlquiler $verificador): Response
    {
        $this->authorize('viewAny', Paquete::class);

        $query = Paquete::query()
            ->with('productos:id,nombre,codigo')
            ->withCount(['productos', 'alquilerLineas'])
            ->when($request->filled('buscar'), fn ($q) => $q->where(function ($inner) use ($request): void {
                $b = '%'.$request->string('buscar').'%';
                $inner->where('nombre', 'like', $b)->orWhere('codigo', 'like', $b);
            }));

        $this->applyIndexSort($query, $request, [
            'codigo' => 'codigo',
            'nombre' => 'nombre',
            'descripcion' => 'descripcion',
            'productos' => 'productos_count',
            'precio_alquiler' => 'precio_alquiler',
            'activo' => 'activo',
            'alquileres' => 'alquiler_lineas_count',
        ], 'nombre', 'asc');

        $paquetes = $query->paginate(15)->withQueryString();

        $paquetes->through(function (Paquete $paquete) use ($verificador): Paquete {
            $paquete->setAttribute(
                'stock_disponible',
                $verificador->cantidadDisponiblePaqueteActiva($paquete),
            );

            return $paquete;
        });

        return Inertia::render('paquetes/index', [
            'paquetes' => $paquetes,
            'filters' => array_merge(
                $request->only(['buscar']),
                $this->indexSortFilters($request),
            ),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Paquete::class);

        return Inertia::render('paquetes/crear', [
            'productos' => $this->productosParaPaquete(),
        ]);
    }

    public function store(StorePaqueteRequest $request): RedirectResponse
    {
        $this->authorize('create', Paquete::class);

        $paquete = DB::transaction(function () use ($request): Paquete {
            $paquete = Paquete::create([
                'nombre' => $request->validated('nombre'),
                'codigo' => $request->validated('codigo'),
                'descripcion' => $request->validated('descripcion'),
                'precio_alquiler' => $request->string('precio_alquiler'),
                'activo' => $request->boolean('activo', true),
            ]);

            $this->syncItems($paquete, $request->validated('items'));

            return $paquete;
        });

        return to_route('paquetes.index')->with('success', 'Paquete creado correctamente.');
    }

    public function show(Paquete $paquete, VerificadorDisponibilidadAlquiler $verificador): Response
    {
        $this->authorize('view', $paquete);

        $paquete->load('productos');

        return Inertia::render('paquetes/ver', [
            'paquete' => [
                'id' => $paquete->id,
                'nombre' => $paquete->nombre,
                'codigo' => $paquete->codigo,
                'descripcion' => $paquete->descripcion,
                'precio_alquiler' => (string) $paquete->precio_alquiler,
                'activo' => $paquete->activo,
                'created_at' => $paquete->created_at?->toIso8601String(),
                'updated_at' => $paquete->updated_at?->toIso8601String(),
                'stock_disponible' => $verificador->cantidadDisponiblePaqueteActiva($paquete),
                'alquileres_count' => $paquete->alquilerLineas()->count(),
                'productos' => $paquete->productos->map(fn (Producto $p) => [
                    'id' => $p->id,
                    'nombre' => $p->nombre,
                    'codigo' => $p->codigo,
                    'cantidad' => (string) (int) (float) $p->pivot->cantidad,
                    'stock_disponible' => $verificador->cantidadDisponibleActiva($p),
                ])->values(),
            ],
        ]);
    }

    public function edit(Paquete $paquete): Response
    {
        $this->authorize('update', $paquete);

        $paquete->load('productos');

        return Inertia::render('paquetes/editar', [
            'paquete' => [
                'id' => $paquete->id,
                'nombre' => $paquete->nombre,
                'codigo' => $paquete->codigo,
                'descripcion' => $paquete->descripcion,
                'precio_alquiler' => (string) $paquete->precio_alquiler,
                'activo' => $paquete->activo,
                'items' => $paquete->productos->map(fn (Producto $p) => [
                    'producto_id' => $p->id,
                    'cantidad' => (string) $p->pivot->cantidad,
                    'nombre' => $p->nombre,
                    'codigo' => $p->codigo,
                ])->values(),
            ],
            'productos' => $this->productosParaPaquete(),
        ]);
    }

    public function update(UpdatePaqueteRequest $request, Paquete $paquete): RedirectResponse
    {
        $this->authorize('update', $paquete);

        DB::transaction(function () use ($request, $paquete): void {
            $paquete->update([
                'nombre' => $request->validated('nombre'),
                'codigo' => $request->validated('codigo'),
                'descripcion' => $request->validated('descripcion'),
                'precio_alquiler' => $request->string('precio_alquiler'),
                'activo' => $request->boolean('activo', true),
            ]);

            $this->syncItems($paquete, $request->validated('items'));
        });

        return to_route('paquetes.index')->with('success', 'Paquete actualizado.');
    }

    public function destroy(Paquete $paquete): RedirectResponse
    {
        $this->authorize('delete', $paquete);

        if ($paquete->alquilerLineas()->exists()) {
            return back()->with('error', 'No se puede eliminar un paquete usado en alquileres.');
        }

        $paquete->delete();

        return to_route('paquetes.index')->with('success', 'Paquete eliminado.');
    }

    /**
     * @param  array<int, array{producto_id: int|string, cantidad: float|int|string}>  $items
     */
    private function syncItems(Paquete $paquete, array $items): void
    {
        $sync = [];
        foreach ($items as $item) {
            $sync[(int) $item['producto_id']] = ['cantidad' => (string) $item['cantidad']];
        }

        $paquete->productos()->sync($sync);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function productosParaPaquete()
    {
        return Producto::query()
            ->where('activo', true)
            ->where('es_alquilable', true)
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'codigo', 'stock_alquiler'])
            ->map(fn (Producto $p) => [
                'id' => $p->id,
                'nombre' => $p->nombre,
                'codigo' => $p->codigo,
                'stock_alquiler' => (string) $p->stock_alquiler,
            ])
            ->values();
    }
}
