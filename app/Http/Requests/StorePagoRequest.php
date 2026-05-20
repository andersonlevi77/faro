<?php

namespace App\Http\Requests;

use App\Enums\MetodoPago;
use App\Enums\TipoPago;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePagoRequest extends FormRequest
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
            'tipo' => ['required', 'string', Rule::enum(TipoPago::class)],
            'monto' => ['required', 'numeric', 'min:0.01'],
            'metodo_pago' => ['required', 'string', Rule::enum(MetodoPago::class)],
            'notas' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
