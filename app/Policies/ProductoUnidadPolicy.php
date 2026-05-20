<?php

namespace App\Policies;

use App\Models\ProductoUnidad;
use App\Models\User;

class ProductoUnidadPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('productos.viewAny');
    }

    public function view(User $user, ProductoUnidad $unidad): bool
    {
        return $user->can('productos.view');
    }

    public function create(User $user): bool
    {
        return $user->can('productos.create');
    }

    public function update(User $user, ProductoUnidad $unidad): bool
    {
        return $user->can('productos.update');
    }

    public function delete(User $user, ProductoUnidad $unidad): bool
    {
        return $user->can('productos.delete');
    }
}
