import { Link, usePage } from '@inertiajs/react';
import { BarChart3, CalendarDays, ClipboardList, LayoutGrid, Package, Shield, UserCog, Users, Wrench } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { calendario, dashboard, reportes } from '@/routes';
import { index as alquileresIndex } from '@/routes/alquileres';
import { index as clientesIndex } from '@/routes/clientes';
import { index as mantenimientosIndex } from '@/routes/mantenimientos';
import { index as productosIndex } from '@/routes/productos';
import { index as rolesIndex } from '@/routes/roles';
import { index as usuariosIndex } from '@/routes/usuarios';
import type { Auth, NavItem } from '@/types';

function can(permissions: string[] | undefined, ability: string): boolean {
    return (permissions ?? []).includes(ability);
}

export function AppSidebar() {
    const auth = usePage().props.auth as Auth;
    const permissions = auth.permissions;

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

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
