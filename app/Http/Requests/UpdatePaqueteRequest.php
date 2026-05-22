<?php

namespace App\Http\Requests;

use App\Models\Paquete;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePaqueteRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Paquete $paquete */
        $paquete = $this->route('paquete');

        return $this->user()?->can('update', $paquete) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Paquete $paquete */
        $paquete = $this->route('paquete');

        return [
            'nombre' => ['required', 'string', 'max:255'],
            'codigo' => ['required', 'string', 'max:100', Rule::unique('paquetes', 'codigo')->ignore($paquete->id)],
            'descripcion' => ['nullable', 'string', 'max:2000'],
            'precio_alquiler' => ['required', 'numeric', 'min:0'],
            'activo' => ['boolean'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.producto_id' => ['required', 'exists:productos,id'],
            'items.*.cantidad' => ['required', 'numeric', 'min:0.001'],
        ];
    }
}
