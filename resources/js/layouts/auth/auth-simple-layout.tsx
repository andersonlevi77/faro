import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import AuthThemeToggle from '@/components/auth-theme-toggle';
import { TooltipProvider } from '@/components/ui/tooltip';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <TooltipProvider delayDuration={400}>
            <div className="relative flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
            <div className="absolute right-4 top-4 md:right-6 md:top-6">
                <AuthThemeToggle />
            </div>

            <div className="w-full max-w-sm">
                <div className="rounded-xl border border-border/70 bg-white/80 px-6 py-8 dark:border-white/10 dark:bg-white/[0.06]">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col items-center gap-4">
                            <Link
                                href={home()}
                                className="flex flex-col items-center gap-2 font-medium text-foreground"
                            >
                                <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg">
                                    <AppLogoIcon className="size-10 fill-current opacity-90" />
                                </div>
                                <span className="sr-only">{title}</span>
                            </Link>

                            <div className="space-y-1.5 text-center">
                                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                                    {title}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {description}
                                </p>
                            </div>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
            </div>
        </TooltipProvider>
    );
}
