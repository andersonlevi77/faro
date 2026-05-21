import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import AuthThemeToggle from '@/components/auth-theme-toggle';
import { TooltipProvider } from '@/components/ui/tooltip';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props as { name?: string };
    const appName = name ?? 'Faro';

    return (
        <TooltipProvider delayDuration={400}>
            <div className="faro-auth-shell">
                <div className="absolute top-4 right-4 md:top-6 md:right-6">
                    <AuthThemeToggle />
                </div>

                <div className="flex w-full max-w-[20rem] flex-col items-center text-center">
                    <Link href={home()} className="mb-8 flex flex-col items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-brand text-white">
                            <AppLogoIcon className="size-6 fill-current text-white" />
                        </div>
                        <div>
                            <span className="block text-2xl font-bold tracking-tight text-foreground">
                                {appName}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                                Gestión de alquileres
                            </span>
                        </div>
                    </Link>

                    {(title || description) && (
                        <header className="mb-6 w-full text-center">
                            {title && (
                                <h1 className="text-lg font-semibold text-foreground">{title}</h1>
                            )}
                            {description && (
                                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                            )}
                        </header>
                    )}

                    <div className="w-full text-left">{children}</div>
                </div>
            </div>
        </TooltipProvider>
    );
}
