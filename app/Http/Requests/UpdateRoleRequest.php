<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Role $rol */
        $rol = $this->route('role');

        return $this->user()?->can('update', $rol) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $guard = 'web';

        /** @var Role $rol */
        $rol = $this->route('role');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name')
                    ->where('guard_name', $guard)
                    ->ignore($rol->id),
                function (string $attribute, mixed $value, \Closure $fail): void {
                    /** @var Role $rol */
                    $rol = $this->route('role');
                    if ($rol->name === 'administrador' && $value !== 'administrador') {
                        $fail('No se puede renombrar el rol administrador.');
                    }
                },
            ],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')->where('guard_name', $guard)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del rol es obligatorio.',
            'name.unique' => 'Ya existe un rol con ese nombre.',
            'permissions.*.exists' => 'Hay permisos no válidos en la lista.',
        ];
    }
}
