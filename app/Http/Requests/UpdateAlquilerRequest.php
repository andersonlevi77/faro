<?php

namespace App\Http\Requests;

use App\Enums\EstadoAlquiler;
use App\Models\Alquiler;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateAlquilerRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Alquiler $alquiler */
        $alquiler = $this->route('alquiler');

        return $this->user()?->can('update', $alquiler) ?? false;
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
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            /** @var Alquiler|null $alquiler */
            $alquiler = $this->route('alquiler');
            if (! $alquiler instanceof Alquiler) {
                return;
            }
            if ($alquiler->estadoEnum() !== EstadoAlquiler::Borrador) {
                $validator->errors()->add('alquiler', 'Solo se puede editar un alquiler en estado borrador.');
            }
        });
    }
}
