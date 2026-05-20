<?php

namespace App\Policies;

use App\Models\Mantenimiento;
use App\Models\User;

class MantenimientoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('productos.viewAny');
    }

    public function view(User $user, Mantenimiento $mantenimiento): bool
    {
        return $user->can('productos.view');
    }

    public function create(User $user): bool
    {
        return $user->can('productos.update');
    }

    public function update(User $user, Mantenimiento $mantenimiento): bool
    {
        return $user->can('productos.update');
    }
}
