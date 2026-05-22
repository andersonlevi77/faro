<?php

namespace App\Http\Middleware;

use App\Services\ConsultaAlquileresNotificaciones;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Middleware;
use Symfony\Component\HttpFoundation\Response;

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
     * Handle Inertia version changes using the URL generator so that
     * behind a reverse proxy the redirect always uses APP_URL, not the
     * internal host seen by php -S / php-fpm.
     */
    public function onVersionChange(Request $request, Response $response): Response
    {
        if ($request->hasSession()) {
            $request->session()->reflash();
        }

        $path = $request->getPathInfo();
        $query = $request->getQueryString();
        $url = url($path.($query ? '?'.$query : ''));

        return Inertia::location($url);
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
                'permissions' => fn () => $this->userPermissions($request),
                'roles' => $request->user()
                    ? $request->user()->getRoleNames()->values()->all()
                    : [],
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'alquilerNotificaciones' => fn () => $this->alquilerNotificaciones($request),
        ];
    }

    /**
     * @return list<string>
     */
    private function userPermissions(Request $request): array
    {
        $user = $request->user();

        if ($user === null) {
            return [];
        }

        return Cache::remember(
            'user-permissions:'.$user->id,
            now()->addMinutes(10),
            fn () => $user->getAllPermissions()->pluck('name')->values()->all(),
        );
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

        return Cache::remember(
            'alquiler-notificaciones:'.$user->id,
            now()->addSeconds(90),
            fn () => app(ConsultaAlquileresNotificaciones::class)->paraCompartir(),
        );
    }
}
