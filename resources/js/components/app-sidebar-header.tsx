import { usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { AlquilerNotifications } from '@/components/alquiler-notifications';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import type { AlquilerNotificaciones, Auth, BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth, alquilerNotificaciones } = usePage().props as {
        auth: Auth;
        alquilerNotificaciones: AlquilerNotificaciones | null;
    };
    const getInitials = useInitials();
    const pageTitle = breadcrumbs.at(-1)?.title ?? 'Inicio';
    const userRole = auth.roles?.[0] ?? 'Usuario';

    return (
        <header className="sticky top-0 z-20 flex h-[4.25rem] shrink-0 items-center gap-3 border-b border-sidebar-border/80 bg-card px-4 md:gap-4 md:px-6">
            <IconActionTooltip label="Mostrar u ocultar menú lateral">
                <SidebarTrigger className="-ml-1 size-9 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground md:hidden" />
            </IconActionTooltip>

            <h1 className="shrink-0 text-lg font-semibold tracking-tight text-foreground md:text-xl">
                {pageTitle}
            </h1>

            <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-3">
                {alquilerNotificaciones && (
                    <AlquilerNotifications notificaciones={alquilerNotificaciones} />
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-auto gap-2 rounded-xl px-2 py-1.5 hover:bg-muted"
                        >
                            <Avatar className="size-9 overflow-hidden rounded-full ring-2 ring-border/50">
                                <AvatarImage
                                    src={auth.user?.avatar}
                                    alt={auth.user?.name}
                                />
                                <AvatarFallback className="rounded-full bg-primary/10 text-sm font-medium text-primary">
                                    {auth.user ? getInitials(auth.user.name) : '?'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden min-w-0 text-left lg:block">
                                <p className="truncate text-sm font-semibold leading-tight text-foreground">
                                    {auth.user?.name}
                                </p>
                                <p className="truncate text-xs capitalize text-muted-foreground">
                                    {userRole.replace(/_/g, ' ')}
                                </p>
                            </div>
                            <ChevronDown className="hidden size-4 shrink-0 text-muted-foreground lg:block" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 rounded-xl" align="end">
                        {auth.user && <UserMenuContent user={auth.user} />}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
