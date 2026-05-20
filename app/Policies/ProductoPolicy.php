<?php

namespace App\Policies;

use App\Models\Producto;
use App\Models\User;

class ProductoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('productos.viewAny');
    }

    public function view(User $user, Producto $producto): bool
    {
        return $user->can('productos.view');
    }

    public function create(User $user): bool
    {
        return $user->can('productos.create');
    }

    public function update(User $user, Producto $producto): bool
    {
        return $user->can('productos.update');
    }

    public function delete(User $user, Producto $producto): bool
    {
        return $user->can('productos.delete');
    }

    public function restore(User $user, Producto $producto): bool
    {
        return $user->can('productos.update');
    }

    public function forceDelete(User $user, Producto $producto): bool
    {
        return $user->can('productos.delete');
    }
}
