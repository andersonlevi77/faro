<?php

namespace App\Policies;

use App\Models\Pago;
use App\Models\User;

class PagoPolicy
{
    public function create(User $user): bool
    {
        return $user->can('alquileres.update');
    }

    public function delete(User $user, Pago $pago): bool
    {
        return $user->can('alquileres.update');
    }
}
