<?php

namespace App\Http\Controllers;

use App\Enums\EstadoUnidad;
use App\Http\Requests\StoreProductoUnidadRequest;
use App\Http\Requests\UpdateProductoUnidadRequest;
use App\Models\Producto;
use App\Models\ProductoUnidad;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProductoUnidadController extends Controller
{
    public function index(Producto $producto): Response
    {
        $this->authorize('viewAny', ProductoUnidad::class);

        $unidades = $producto->unidades()
            ->orderBy('codigo')
            ->get();

        return Inertia::render('inventario/productos/unidades/index', [
            'producto' => $producto->load(['categoria', 'marca']),
            'unidades' => $unidades,
            'estados' => collect(EstadoUnidad::cases())->map(fn (EstadoUnidad $e) => [
                'value' => $e->value,
                'label' => $e->etiqueta(),
                'color' => $e->color(),
            ]),
        ]);
    }

    public function store(StoreProductoUnidadRequest $request, Producto $producto): RedirectResponse
    {
        $this->authorize('create', ProductoUnidad::class);

        $data = $request->validated();

        if (! empty($data['cantidad_generar'])) {
            $this->generarUnidades($producto, (int) $data['cantidad_generar']);
        } else {
            ProductoUnidad::create([
                'producto_id' => $producto->id,
                'codigo' => $data['codigo'],
                'estado' => EstadoUnidad::Disponible,
                'notas' => $data['notas'] ?? null,
                'creado_por' => $request->user()?->id,
                'actualizado_por' => $request->user()?->id,
            ]);
        }

        return back()->with('success', 'Unidad(es) registrada(s) correctamente.');
    }

    public function update(UpdateProductoUnidadRequest $request, ProductoUnidad $unidade): RedirectResponse
    {
        $this->authorize('update', $unidade);

        $unidade->update([
            ...$request->validated(),
            'actualizado_por' => $request->user()?->id,
        ]);

        return back()->with('success', 'Unidad actualizada.');
    }

    public function destroy(ProductoUnidad $unidade): RedirectResponse
    {
        $this->authorize('delete', $unidade);

        if ($unidade->estado !== EstadoUnidad::Disponible) {
            return back()->with('error', 'Solo se pueden eliminar unidades disponibles.');
        }

        $unidade->delete();

        return back()->with('success', 'Unidad eliminada.');
    }

    private function generarUnidades(Producto $producto, int $cantidad): void
    {
        $prefijo = strtoupper(substr(preg_replace('/[^A-Z0-9]/i', '', $producto->codigo) ?? $producto->id, 0, 4));

        $codigos = ProductoUnidad::query()
            ->where('producto_id', $producto->id)
            ->where('codigo', 'like', $prefijo.'-%')
            ->pluck('codigo');

        $siguiente = 1;
        foreach ($codigos as $codigo) {
            $partes = explode('-', $codigo);
            $num = (int) end($partes);
            if ($num >= $siguiente) {
                $siguiente = $num + 1;
            }
        }

        for ($i = 0; $i < $cantidad; $i++) {
            ProductoUnidad::create([
                'producto_id' => $producto->id,
                'codigo' => $prefijo.'-'.str_pad((string) ($siguiente + $i), 3, '0', STR_PAD_LEFT),
                'estado' => EstadoUnidad::Disponible,
                'creado_por' => auth()->id(),
                'actualizado_por' => auth()->id(),
            ]);
        }
    }
}
