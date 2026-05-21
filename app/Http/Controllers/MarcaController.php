<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMarcaRequest;
use App\Models\Marca;
use App\Models\Producto;
use Illuminate\Http\JsonResponse;

class MarcaController extends Controller
{
    public function store(StoreMarcaRequest $request): JsonResponse
    {
        abort_unless(
            $request->user()->can('create', Producto::class) || $request->user()->can('update', Producto::class),
            403,
        );

        $marca = Marca::create([
            'nombre' => $request->validated('nombre'),
            'creado_por' => $request->user()->id,
        ]);

        return response()->json([
            'id' => $marca->id,
            'nombre' => $marca->nombre,
        ], 201);
    }
}
