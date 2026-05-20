<?php

namespace App\Http\Requests;

use App\Enums\TrackingMode;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $nullableKeys = ['marca_id', 'categoria_id', 'presentacion_id'];
        foreach ($nullableKeys as $key) {
            if ($this->has($key) && $this->input($key) === '') {
                $this->merge([$key => null]);
            }
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $producto = $this->route('producto');

        return [
            'nombre' => ['required', 'string', 'max:255'],
            'codigo' => ['required', 'string', 'max:100', 'unique:productos,codigo,'.$producto?->id],
            'descripcion' => ['nullable', 'string', 'max:2000'],
            'codigo_barras' => ['nullable', 'string', 'max:50'],
            'marca_id' => ['nullable', 'exists:marcas,id'],
            'categoria_id' => ['nullable', 'exists:categorias,id'],
            'presentacion_id' => ['nullable', 'exists:presentaciones,id'],
            'precio_compra' => ['required', 'numeric', 'min:0'],
            'precio_venta' => ['required', 'numeric', 'min:0'],
            'stock_minimo' => ['nullable', 'integer', 'min:0'],
            'stock_maximo' => ['nullable', 'integer', 'min:0'],
            'activo' => ['boolean'],
            'es_alquilable' => ['boolean'],
            'tracking_mode' => ['nullable', 'string', Rule::enum(TrackingMode::class)],
            'stock_alquiler' => ['nullable', 'numeric', 'min:0'],
            'precio_alquiler_diario' => ['nullable', 'numeric', 'min:0'],
            'deposito_unitario' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
