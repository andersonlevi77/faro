<?php

namespace App\Http\Controllers;

use App\Http\Concerns\SortsPaginatedIndex;
use App\Http\Requests\StoreClienteRequest;
use App\Http\Requests\UpdateClienteRequest;
use App\Models\Cliente;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClienteController extends Controller
{
    use SortsPaginatedIndex;

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Cliente::class);

        $query = Cliente::query()
            ->withCount('alquileres')
            ->when($request->filled('buscar'), function ($query) use ($request): void {
                $b = '%'.$request->string('buscar').'%';
                $query->where(function ($q) use ($b): void {
                    $q->where('nombre', 'like', $b)
                        ->orWhere('documento', 'like', $b)
                        ->orWhere('email', 'like', $b)
                        ->orWhere('telefono', 'like', $b);
                });
            });

        $this->applyIndexSort($query, $request, [
            'nombre' => 'nombre',
            'documento' => 'documento',
            'email' => 'email',
            'telefono' => 'telefono',
            'alquileres' => 'alquileres_count',
        ], 'nombre', 'asc');

        $clientes = $query->paginate(15)->withQueryString();

        // Eager-load alquileres + pagos to avoid N+1 on puntuacion()
        $clientes->getCollection()->load(['alquileres.pagos:id,alquiler_id,tipo,monto']);
        $clientes->getCollection()->each(fn (Cliente $c) => $c->append([]));

        $puntajes = $clientes->getCollection()->mapWithKeys(fn (Cliente $c) => [
            $c->id => ['puntuacion' => $c->puntuacion(), 'etiqueta' => $c->etiquetaPuntuacion()],
        ]);

        return Inertia::render('alquileres/clientes/index', [
            'clientes' => $clientes,
            'filters' => array_merge(
                $request->only(['buscar']),
                $this->indexSortFilters($request),
            ),
            'puntajes' => $puntajes,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Cliente::class);

        return Inertia::render('alquileres/clientes/crear');
    }

    public function store(StoreClienteRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['creado_por'] = $request->user()->id;

        Cliente::create($data);

        return to_route('clientes.index')->with('success', 'Cliente registrado correctamente.');
    }

    public function show(Cliente $cliente): Response
    {
        $this->authorize('view', $cliente);

        $cliente->load([
            'alquileres' => fn ($q) => $q->withCount('lineas')->latest()->limit(20),
        ]);

        // Pre-load pagos so puntuacion() doesn't N+1
        $cliente->alquileres->load('pagos:id,alquiler_id,tipo,monto');

        $totalPagado = number_format(
            (float) $cliente->alquileres
                ->flatMap(fn ($a) => $a->pagos)
                ->filter(fn ($p) => $p->tipo->esIngreso())
                ->sum(fn ($p) => (float) $p->monto),
            2, '.', '',
        );

        return Inertia::render('alquileres/clientes/ver', [
            'cliente' => $cliente,
            'puntuacion' => $cliente->puntuacion(),
            'etiquetaPuntuacion' => $cliente->etiquetaPuntuacion(),
            'totalPagado' => $totalPagado,
        ]);
    }

    public function edit(Cliente $cliente): Response
    {
        $this->authorize('update', $cliente);

        return Inertia::render('alquileres/clientes/editar', [
            'cliente' => $cliente,
        ]);
    }

    public function update(UpdateClienteRequest $request, Cliente $cliente): RedirectResponse
    {
        $data = $request->validated();
        $data['actualizado_por'] = $request->user()->id;

        $cliente->update($data);

        return to_route('clientes.index')->with('success', 'Cliente actualizado correctamente.');
    }

    public function destroy(Cliente $cliente): RedirectResponse
    {
        $this->authorize('delete', $cliente);

        if ($cliente->alquileres()->exists()) {
            return back()->with('error', 'No se puede eliminar un cliente con alquileres asociados.');
        }

        $cliente->delete();

        return to_route('clientes.index')->with('success', 'Cliente eliminado.');
    }
}
