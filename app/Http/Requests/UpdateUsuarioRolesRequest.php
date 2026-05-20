<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UpdateUsuarioRolesRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var User $usuario */
        $usuario = $this->route('user');

        return $this->user()?->can('update', $usuario) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $roles = Role::query()->where('guard_name', 'web')->pluck('name')->all();

        return [
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', Rule::in($roles)],
        ];
    }
}
