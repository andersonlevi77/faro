<?php

namespace App\Http\Controllers;

use App\Http\Concerns\SortsPaginatedIndex;
use App\Http\Requests\StoreUsuarioRequest;
use App\Http\Requests\UpdateUsuarioActivoRequest;
use App\Http\Requests\UpdateUsuarioRolesRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class UsuarioController extends Controller
{
    use SortsPaginatedIndex;

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $query = User::query()
            ->with('roles')
            ->when($request->filled('buscar'), function ($q) use ($request): void {
                $b = '%'.$request->string('buscar').'%';
                $q->where(function ($inner) use ($b): void {
                    $inner->where('name', 'like', $b)->orWhere('email', 'like', $b);
                });
            });

        $this->applyIndexSort($query, $request, [
            'name' => 'name',
            'email' => 'email',
            'activo' => 'activo',
        ], 'name', 'asc');

        $usuarios = $query->paginate(15)->withQueryString();

        return Inertia::render('usuarios/index', [
            'usuarios' => $usuarios,
            'filters' => array_merge(
                $request->only(['buscar']),
                $this->indexSortFilters($request),
            ),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', User::class);

        $roles = Role::query()->where('guard_name', 'web')->orderBy('name')->get(['id', 'name']);

        return Inertia::render('usuarios/crear', [
            'roles' => $roles,
        ]);
    }

    public function store(StoreUsuarioRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $roles = $validated['roles'] ?? [];
        unset($validated['roles']);

        $validated['email_verified_at'] = now();
        $validated['activo'] = true;

        $user = User::query()->create($validated);
        $user->syncRoles($roles);

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return to_route('usuarios.index')->with(
            'success',
            'Usuario '.$user->name.' creado. Entrega la contraseña al colaborador por un canal seguro.',
        );
    }

    public function edit(User $user): Response
    {
        $this->authorize('update', $user);

        $roles = Role::query()->where('guard_name', 'web')->orderBy('name')->get(['id', 'name']);

        return Inertia::render('usuarios/editar', [
            'usuario' => $user->load('roles'),
            'roles' => $roles,
        ]);
    }

    public function update(UpdateUsuarioRolesRequest $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $roles = $request->validated('roles') ?? [];
        $user->syncRoles($roles);

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return to_route('usuarios.index')->with('success', 'Roles actualizados para '.$user->name.'.');
    }

    public function updateActivo(UpdateUsuarioActivoRequest $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $activo = $request->boolean('activo');

        if (auth()->id() === $user->id && ! $activo) {
            return back()->with('error', 'No puedes deshabilitar tu propia cuenta.');
        }

        $user->update(['activo' => $activo]);

        if (! $activo) {
            DB::table('sessions')->where('user_id', $user->id)->delete();
        }

        $mensaje = $activo
            ? 'Usuario '.$user->name.' habilitado.'
            : 'Usuario '.$user->name.' deshabilitado. Ya no podrá iniciar sesión.';

        return back()->with('success', $mensaje);
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        $nombre = $user->name;

        DB::table('sessions')->where('user_id', $user->id)->delete();
        $user->delete();

        return to_route('usuarios.index')->with('success', 'Usuario '.$nombre.' eliminado permanentemente.');
    }
}
