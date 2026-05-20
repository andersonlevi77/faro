<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductoUnidadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'codigo' => ['nullable', 'string', 'max:50', 'unique:producto_unidades,codigo'],
            'cantidad_generar' => ['nullable', 'integer', 'min:1', 'max:500'],
            'notas' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            $tieneCodigo = ! empty($this->input('codigo'));
            $tieneCantidad = ! empty($this->input('cantidad_generar'));

            if (! $tieneCodigo && ! $tieneCantidad) {
                $v->errors()->add('codigo', 'Debes ingresar un código o una cantidad a generar.');
            }
            if ($tieneCodigo && $tieneCantidad) {
                $v->errors()->add('codigo', 'Ingresa solo un código o solo una cantidad, no ambos.');
            }
        });
    }
}
