<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Role::class);

        $roles = Role::query()
            ->where('guard_name', 'web')
            ->withCount('users')
            ->withCount('permissions')
            ->when($request->filled('buscar'), function ($q) use ($request): void {
                $b = '%'.$request->string('buscar').'%';
                $q->where('name', 'like', $b);
            })
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('roles/index', [
            'roles' => $roles,
            'filters' => $request->only(['buscar']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Role::class);

        return Inertia::render('roles/crear', [
            'matrizPermisos' => RolePermissionSeeder::matrizPermisos(),
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $guard = 'web';
        $nombre = $request->validated('name');
        if ($nombre === 'administrador') {
            return back()->withErrors(['name' => 'No se puede crear un rol con el nombre reservado «administrador».'])->withInput();
        }

        $role = Role::query()->create([
            'name' => $nombre,
            'guard_name' => $guard,
        ]);

        $permisos = $request->validated('permissions') ?? [];
        $role->syncPermissions($this->permisosExistentes($permisos, $guard));

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return to_route('roles.index')->with('success', 'Rol creado correctamente.');
    }

    public function show(Role $role): Response
    {
        $this->authorize('view', $role);

        $role->load(['permissions' => fn ($q) => $q->orderBy('name')]);
        $role->loadCount('users');

        return Inertia::render('roles/ver', [
            'rol' => [
                'id' => $role->id,
                'name' => $role->name,
                'users_count' => $role->users_count,
                'permissions' => $role->permissions->pluck('name')->values()->all(),
            ],
            'matrizPermisos' => RolePermissionSeeder::matrizPermisos(),
        ]);
    }

    public function edit(Role $role): Response
    {
        $this->authorize('update', $role);

        $role->load(['permissions' => fn ($q) => $q->orderBy('name')]);

        return Inertia::render('roles/editar', [
            'rol' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->values()->all(),
            ],
            'matrizPermisos' => RolePermissionSeeder::matrizPermisos(),
        ]);
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        $role->update(['name' => $request->validated('name')]);

        $guard = 'web';
        $permisos = $request->validated('permissions') ?? [];
        $role->syncPermissions($this->permisosExistentes($permisos, $guard));

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return to_route('roles.index')->with('success', 'Rol actualizado correctamente.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        $this->authorize('delete', $role);

        if ($role->name === 'administrador') {
            return back()->with('error', 'No se puede eliminar el rol administrador.');
        }

        if ($role->users()->exists()) {
            return back()->with('error', 'No se puede eliminar un rol asignado a usuarios.');
        }

        $role->delete();

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return to_route('roles.index')->with('success', 'Rol eliminado.');
    }

    /**
     * @param  list<string>  $nombres
     * @return Collection<int, Permission>
     */
    private function permisosExistentes(array $nombres, string $guard): Collection
    {
        if ($nombres === []) {
            return collect();
        }

        return Permission::query()
            ->where('guard_name', $guard)
            ->whereIn('name', $nombres)
            ->get();
    }
}
