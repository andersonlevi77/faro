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
            'lineas.*.producto_id' => ['nullable', 'exists:productos,id'],
            'lineas.*.paquete_id' => ['nullable', 'exists:paquetes,id'],
            'lineas.*.cantidad' => ['required', 'integer', 'min:1'],
            'lineas.*.precio_diario' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            foreach ($this->input('lineas', []) as $index => $linea) {
                $tieneProducto = ! empty($linea['producto_id']);
                $tienePaquete = ! empty($linea['paquete_id']);

                if ($tieneProducto === $tienePaquete) {
                    $validator->errors()->add(
                        "lineas.{$index}",
                        'Cada línea debe ser un producto o un paquete, no ambos ni ninguno.',
                    );
                }
            }
        });
    }
}
