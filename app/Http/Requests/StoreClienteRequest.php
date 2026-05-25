<?php

namespace App\Http\Requests;

use App\Models\Cliente;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreClienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Cliente::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'codigo' => ['nullable', 'string', 'max:50', 'unique:clientes,codigo'],
            'nombre' => ['required', 'string', 'max:255'],
            'documento' => ['nullable', 'string', 'max:50', 'unique:clientes,documento'],
            'email' => ['nullable', 'email', 'max:255'],
            'telefono' => ['nullable', 'digits:8'],
            'direccion' => ['nullable', 'string', 'max:500'],
            'ciudad' => ['nullable', 'string', 'max:120'],
            'notas' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
