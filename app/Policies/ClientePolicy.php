<?php

namespace App\Policies;

use App\Models\Cliente;
use App\Models\User;

class ClientePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('clientes.viewAny');
    }

    public function view(User $user, Cliente $cliente): bool
    {
        return $user->can('clientes.view');
    }

    public function create(User $user): bool
    {
        return $user->can('clientes.create');
    }

    public function update(User $user, Cliente $cliente): bool
    {
        return $user->can('clientes.update');
    }

    public function delete(User $user, Cliente $cliente): bool
    {
        return $user->can('clientes.delete');
    }

    public function restore(User $user, Cliente $cliente): bool
    {
        return $user->can('clientes.update');
    }

    public function forceDelete(User $user, Cliente $cliente): bool
    {
        return $user->can('clientes.delete');
    }
}
