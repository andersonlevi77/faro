<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLoteRequest extends FormRequest
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
        $lote = $this->route('lote');
        $productoId = $lote?->producto_id ?? $this->input('producto_id');

        return [
            'producto_id' => ['required', 'exists:productos,id'],
            'numero_lote' => [
                'required',
                'string',
                'max:100',
                Rule::unique('lotes')->where('producto_id', $productoId)->ignore($lote),
            ],
            'fecha_vencimiento' => ['required', 'date'],
            'cantidad' => ['required', 'numeric', 'min:0'],
            'cantidad_inicial' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
