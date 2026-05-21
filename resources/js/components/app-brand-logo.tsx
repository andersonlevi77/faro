import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export const APP_LOGO_SRC = '/logo.jpeg';

type AppBrandLogoVariant = 'auth' | 'sidebar' | 'header' | 'mark';

type AppBrandLogoProps = {
    variant?: AppBrandLogoVariant;
    href?: string;
    className?: string;
    /** Muestra nombre de la app y subtítulo junto al logo (sidebar/header). */
    showAppText?: boolean;
};

const imageClass: Record<AppBrandLogoVariant, string> = {
    auth: 'h-24 w-auto max-w-[min(100%,280px)]',
    sidebar: 'h-10 w-auto max-w-[9.5rem]',
    header: 'h-9 w-auto max-w-[8.5rem]',
    mark: 'h-8 w-8',
};

export function AppBrandLogo({
    variant = 'sidebar',
    href,
    className,
    showAppText = variant !== 'auth',
}: AppBrandLogoProps) {
    const { name } = usePage().props as { name?: string };
    const appName = name ?? 'Faro';

    const inner = (
        <span
            className={cn(
                'inline-flex items-center gap-2.5',
                variant === 'auth' && 'flex-col gap-3 text-center',
                className,
            )}
        >
            <img
                src={APP_LOGO_SRC}
                alt="Construnor — laboratorio de suelos y concreto"
                className={cn('object-contain object-center', imageClass[variant], variant === 'sidebar' && 'object-left')}
            />
            {showAppText && (
                <span
                    className={cn(
                        'grid text-left leading-tight',
                        variant === 'sidebar' && 'group-data-[collapsible=icon]:hidden',
                    )}
                >
                    <span className="truncate text-base font-bold text-primary">{appName}</span>
                    <span className="truncate text-[11px] text-muted-foreground">Gestión de alquileres</span>
                </span>
            )}
            {variant === 'auth' && (
                <span className="text-xs text-muted-foreground">Gestión de alquileres</span>
            )}
        </span>
    );

    if (href) {
        return (
            <Link href={href} className="rounded-lg outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                {inner}
            </Link>
        );
    }

    return inner;
}
