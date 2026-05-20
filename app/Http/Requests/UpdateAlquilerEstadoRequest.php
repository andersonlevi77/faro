<?php

namespace App\Http\Requests;

use App\Enums\EstadoAlquiler;
use App\Models\Alquiler;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAlquilerEstadoRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Alquiler $alquiler */
        $alquiler = $this->route('alquiler');

        return $this->user()?->can('cambiarEstado', $alquiler) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'estado' => ['required', 'string', Rule::in(array_column(EstadoAlquiler::cases(), 'value'))],
            'danio_descripcion' => ['nullable', 'string', 'max:2000'],
            'danio_monto' => ['nullable', 'numeric', 'min:0'],
            'deposito_devuelto' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
