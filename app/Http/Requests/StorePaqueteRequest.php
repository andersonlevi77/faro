<?php

namespace App\Http\Requests;

use App\Models\Paquete;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePaqueteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Paquete::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
            'codigo' => ['required', 'string', 'max:100', 'unique:paquetes,codigo'],
            'descripcion' => ['nullable', 'string', 'max:2000'],
            'precio_alquiler' => ['required', 'numeric', 'min:0'],
            'activo' => ['boolean'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.producto_id' => ['required', 'exists:productos,id'],
            'items.*.cantidad' => ['required', 'numeric', 'min:0.001'],
        ];
    }
}
