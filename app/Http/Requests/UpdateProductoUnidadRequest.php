<?php

namespace App\Http\Requests;

use App\Enums\EstadoUnidad;
use App\Models\ProductoUnidad;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductoUnidadRequest extends FormRequest
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
        $unidadId = $this->route('unidade') instanceof ProductoUnidad
            ? $this->route('unidade')->id
            : $this->route('unidade');

        return [
            'codigo' => ['required', 'string', 'max:50', 'unique:producto_unidades,codigo,'.$unidadId],
            'estado' => ['required', 'string', Rule::enum(EstadoUnidad::class)],
            'notas' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
