<?php

namespace App\Http\Requests;

use App\Models\Alquiler;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreAlquilerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Alquiler::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'cliente_id' => ['required', 'exists:clientes,id'],
            'fecha_inicio_prevista' => ['required', 'date'],
            'fecha_fin_prevista' => ['required', 'date', 'after_or_equal:fecha_inicio_prevista'],
            'deposito_monto' => ['nullable', 'numeric', 'min:0'],
            'notas' => ['nullable', 'string', 'max:5000'],
            'lineas' => ['required', 'array', 'min:1'],
            'lineas.*.producto_id' => ['required', 'exists:productos,id'],
            'lineas.*.cantidad' => ['required', 'numeric', 'min:0.001'],
            'lineas.*.precio_diario' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }
            $inicio = $this->date('fecha_inicio_prevista');
            $fin = $this->date('fecha_fin_prevista');
            if ($inicio === null || $fin === null) {
                return;
            }
            if ($fin->lt($inicio)) {
                $validator->errors()->add('fecha_fin_prevista', 'La fecha de fin debe ser posterior o igual al inicio.');
            }
        });
    }
}
