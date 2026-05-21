<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePresentacionRequest;
use App\Models\Presentacion;
use App\Models\Producto;
use Illuminate\Http\JsonResponse;

class PresentacionController extends Controller
{
    public function store(StorePresentacionRequest $request): JsonResponse
    {
        abort_unless(
            $request->user()->can('create', Producto::class) || $request->user()->can('update', Producto::class),
            403,
        );

        $presentacion = Presentacion::create([
            'nombre' => $request->validated('nombre'),
            'creado_por' => $request->user()->id,
        ]);

        return response()->json([
            'id' => $presentacion->id,
            'nombre' => $presentacion->nombre,
        ], 201);
    }
}
