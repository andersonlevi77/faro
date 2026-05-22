import { Link, router, usePage } from '@inertiajs/react';
import {
    BarChart3,
    CalendarDays,
    ClipboardList,
    LayoutGrid,
    LogOut,
    Boxes,
    Package,
    Shield,
    UserCog,
    Users,
    Wrench,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { calendario, dashboard, reportes } from '@/routes';
import { index as alquileresIndex } from '@/routes/alquileres';
import { index as clientesIndex } from '@/routes/clientes';
import { index as mantenimientosIndex } from '@/routes/mantenimientos';
import { index as paquetesIndex } from '@/routes/paquetes';
import { index as productosIndex } from '@/routes/productos';
import { logout } from '@/routes';
import { index as rolesIndex } from '@/routes/roles';
import { index as usuariosIndex } from '@/routes/usuarios';
import type { Auth, NavItem } from '@/types';

function can(permissions: string[] | undefined, ability: string): boolean {
    return (permissions ?? []).includes(ability);
}

export function AppSidebar() {
    const auth = usePage().props.auth as Auth;
    const permissions = auth.permissions;
    const cleanup = useMobileNavigation();

    const mainNavItems: NavItem[] = [
        {
            title: 'Inicio',
            href: dashboard(),
            icon: LayoutGrid,
        },
        ...(can(permissions, 'clientes.viewAny')
            ? [
                  {
                      title: 'Clientes',
                      href: clientesIndex.url(),
                      icon: Users,
                  } satisfies NavItem,
              ]
            : []),
        ...(can(permissions, 'alquileres.viewAny')
            ? [
                  {
                      title: 'Alquileres',
                      href: alquileresIndex.url(),
                      icon: ClipboardList,
                  } satisfies NavItem,
              ]
            : []),
        ...(can(permissions, 'productos.viewAny')
            ? [
                  {
                      title: 'Productos',
                      href: productosIndex.url(),
                      icon: Package,
                  } satisfies NavItem,
              ]
            : []),
        ...(can(permissions, 'paquetes.viewAny')
            ? [
                  {
                      title: 'Paquetes',
                      href: paquetesIndex.url(),
                      icon: Boxes,
                  } satisfies NavItem,
              ]
            : []),
        ...(can(permissions, 'productos.viewAny')
            ? [
                  {
                      title: 'Mantenimientos',
                      href: mantenimientosIndex.url(),
                      icon: Wrench,
                  } satisfies NavItem,
              ]
            : []),
        ...(can(permissions, 'alquileres.viewAny')
            ? [
                  {
                      title: 'Calendario',
                      href: calendario.url(),
                      icon: CalendarDays,
                  } satisfies NavItem,
              ]
            : []),
        ...(can(permissions, 'alquileres.viewAny')
            ? [
                  {
                      title: 'Reportes',
                      href: reportes.url(),
                      icon: BarChart3,
                  } satisfies NavItem,
              ]
            : []),
        ...(can(permissions, 'usuarios.viewAny')
            ? [
                  {
                      title: 'Usuarios',
                      href: usuariosIndex.url(),
                      icon: UserCog,
                  } satisfies NavItem,
              ]
            : []),
        ...(can(permissions, 'roles.viewAny')
            ? [
                  {
                      title: 'Roles',
                      href: rolesIndex.url(),
                      icon: Shield,
                  } satisfies NavItem,
              ]
            : []),
    ];

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-none">
            <SidebarHeader className="border-b border-sidebar-border/60 px-3 py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="h-auto rounded-xl hover:bg-transparent">
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="pt-2">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/60 p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="h-10 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                            <Link
                                href={logout()}
                                as="button"
                                onClick={handleLogout}
                                data-test="sidebar-logout-button"
                            >
                                <LogOut className="size-[18px]" />
                                <span className="font-medium">Cerrar sesión</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
