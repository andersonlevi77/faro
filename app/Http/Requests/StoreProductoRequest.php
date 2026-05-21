<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ProductoAlquilerRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductoRequest extends FormRequest
{
    use ProductoAlquilerRules;

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $this->prepareProductoCatalogIds();

        $this->merge([
            'es_alquilable' => $this->boolean('es_alquilable', true),
        ]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->productoBaseRules();
    }
}
