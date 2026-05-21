import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Shield } from 'lucide-react';
import { RolePermissionsMatrix, type MatrizPermisos } from '@/components/role-permissions-matrix';
import AppLayout from '@/layouts/app-layout';
import { index, show } from '@/routes/roles';
import type { BreadcrumbItem } from '@/types';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RolVer {
    id: number;
    name: string;
    users_count: number;
    permissions: string[];
}

export default function RolesVer({ rol, matrizPermisos }: { rol: RolVer; matrizPermisos: MatrizPermisos }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Roles', href: index.url() },
        { title: rol.name, href: show.url({ role: rol.id }) },
    ];

    const totalPermisos = rol.permissions.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Rol: ${rol.name}`} />
            <div className="faro-page">
                <div className="flex flex-wrap items-center gap-3">
                    <IconActionTooltip label="Volver a la lista de roles">
                        <Button variant="ghost" size="icon" className="size-9 rounded-xl hover:bg-muted" asChild>
                            <Link href={index.url()}>
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                    </IconActionTooltip>
                    <div>
                        <h1 className="text-xl font-semibold capitalize tracking-tight text-foreground">{rol.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            {rol.users_count} usuario(s) con este rol · {totalPermisos} permiso(s) en total.
                        </p>
                    </div>
                </div>
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Shield className="size-4 text-primary" />
                            Permisos asignados a este rol
                        </CardTitle>
                        <CardDescription>
                            Vista por módulos. Para modificar permisos, abre <span className="font-medium text-foreground">Editar</span> desde el listado de roles.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RolePermissionsMatrix matriz={matrizPermisos} selected={rol.permissions} readOnly />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
