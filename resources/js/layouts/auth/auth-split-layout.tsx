import { AppBrandLogo } from '@/components/app-brand-logo';
import AuthThemeToggle from '@/components/auth-theme-toggle';
import { TooltipProvider } from '@/components/ui/tooltip';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <TooltipProvider delayDuration={400}>
            <div className="faro-auth-shell">
                <div className="absolute top-4 right-4 md:top-6 md:right-6">
                    <AuthThemeToggle />
                </div>

                <div className="flex w-full max-w-[22rem] flex-col items-center text-center">
                    <AppBrandLogo variant="auth" href={home()} className="mb-8" showAppText={false} />

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
