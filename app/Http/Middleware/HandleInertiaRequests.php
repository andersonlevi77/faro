<?php

namespace App\Http\Middleware;

use App\Services\ConsultaAlquileresNotificaciones;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
                'permissions' => $request->user()
                    ? $request->user()->getAllPermissions()->pluck('name')->values()->all()
                    : [],
                'roles' => $request->user()
                    ? $request->user()->getRoleNames()->values()->all()
                    : [],
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'alquilerNotificaciones' => fn () => $this->alquilerNotificaciones($request),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function alquilerNotificaciones(Request $request): ?array
    {
        $user = $request->user();

        if ($user === null || ! $user->can('alquileres.viewAny')) {
            return null;
        }

        return (new ConsultaAlquileresNotificaciones)->paraCompartir();
    }
}
