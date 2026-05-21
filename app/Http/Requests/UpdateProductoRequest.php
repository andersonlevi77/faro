<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ProductoAlquilerRules;
use App\Models\Producto;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProductoRequest extends FormRequest
{
    use ProductoAlquilerRules;

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $this->prepareProductoCatalogIds();
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Producto $producto */
        $producto = $this->route('producto');

        return $this->productoBaseRules($producto->id);
    }
}
