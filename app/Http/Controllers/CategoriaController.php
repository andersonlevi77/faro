<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoriaRequest;
use App\Models\Categoria;
use App\Models\Producto;
use Illuminate\Http\JsonResponse;

class CategoriaController extends Controller
{
    public function store(StoreCategoriaRequest $request): JsonResponse
    {
        abort_unless(
            $request->user()->can('create', Producto::class) || $request->user()->can('update', Producto::class),
            403,
        );

        $categoria = Categoria::create([
            'nombre' => $request->validated('nombre'),
            'descripcion' => $request->validated('descripcion'),
            'creado_por' => $request->user()->id,
        ]);

        return response()->json([
            'id' => $categoria->id,
            'nombre' => $categoria->nombre,
        ], 201);
    }
}
