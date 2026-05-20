<?php

namespace App\Policies;

use App\Models\Alquiler;
use App\Models\User;

class AlquilerPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('alquileres.viewAny');
    }

    public function view(User $user, Alquiler $alquiler): bool
    {
        return $user->can('alquileres.view');
    }

    public function create(User $user): bool
    {
        return $user->can('alquileres.create');
    }

    public function update(User $user, Alquiler $alquiler): bool
    {
        return $user->can('alquileres.update');
    }

    public function delete(User $user, Alquiler $alquiler): bool
    {
        return $user->can('alquileres.delete');
    }

    public function cambiarEstado(User $user, Alquiler $alquiler): bool
    {
        return $user->can('alquileres.cambiarEstado');
    }

    public function restore(User $user, Alquiler $alquiler): bool
    {
        return $user->can('alquileres.update');
    }

    public function forceDelete(User $user, Alquiler $alquiler): bool
    {
        return $user->can('alquileres.delete');
    }
}
