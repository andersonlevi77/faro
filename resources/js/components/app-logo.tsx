import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name } = usePage().props as { name?: string };
    const appName = name ?? 'Faro';

    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-sm">
                <AppLogoIcon className="size-5 fill-current text-white" />
            </div>
            <div className="ml-2 grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-base font-bold text-primary">
                    {appName}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                    Gestión de alquileres
                </span>
            </div>
        </>
    );
}
