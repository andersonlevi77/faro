<?php

namespace App\Policies;

use App\Models\Categoria;
use App\Models\User;

class CategoriaPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Categoria $categoria): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Categoria $categoria): bool
    {
        return true;
    }

    public function delete(User $user, Categoria $categoria): bool
    {
        return true;
    }

    public function restore(User $user, Categoria $categoria): bool
    {
        return true;
    }

    public function forceDelete(User $user, Categoria $categoria): bool
    {
        return true;
    }
}
