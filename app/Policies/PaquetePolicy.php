<?php

namespace App\Policies;

use App\Models\Paquete;
use App\Models\User;

class PaquetePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('paquetes.viewAny');
    }

    public function view(User $user, Paquete $paquete): bool
    {
        return $user->can('paquetes.view');
    }

    public function create(User $user): bool
    {
        return $user->can('paquetes.create');
    }

    public function update(User $user, Paquete $paquete): bool
    {
        return $user->can('paquetes.update');
    }

    public function delete(User $user, Paquete $paquete): bool
    {
        return $user->can('paquetes.delete');
    }
}
