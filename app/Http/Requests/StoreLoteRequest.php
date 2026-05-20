<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLoteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $productoId = $this->input('producto_id');

        return [
            'producto_id' => ['required', 'exists:productos,id'],
            'numero_lote' => [
                'required',
                'string',
                'max:100',
                Rule::unique('lotes')->where('producto_id', $productoId),
            ],
            'fecha_vencimiento' => ['required', 'date', 'after_or_equal:today'],
            'cantidad' => ['required', 'numeric', 'min:0'],
            'cantidad_inicial' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
