import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Perfil',
        href: edit(),
        icon: null,
    },
    {
        title: 'Seguridad',
        href: editSecurity(),
        icon: null,
    },
    {
        title: 'Apariencia',
        href: editAppearance(),
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div className="faro-page max-w-5xl">
            <Heading
                title="Configuración"
                description="Gestiona la configuración de tu perfil y cuenta"
            />

            <div className="flex flex-col lg:flex-row lg:gap-10">
                <aside className="w-full lg:w-52">
                    <nav
                        className="flex flex-col gap-1 rounded-2xl border border-border/50 bg-card p-2 shadow-card"
                        aria-label="Configuración"
                    >
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${toUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start rounded-xl', {
                                    'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground':
                                        isCurrentOrParentUrl(item.href),
                                })}
                            >
                                <Link href={item.href}>
                                    {item.icon && (
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="min-w-0 flex-1">
                    <section className="space-y-8 rounded-2xl border border-border/50 bg-card p-6 shadow-card md:p-8">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
