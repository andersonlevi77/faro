import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Search, Shield, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { create, destroy, edit, index } from '@/routes/roles';
import type { Auth, BreadcrumbItem } from '@/types';
import { FaroDataTable, type FaroColumnDef } from '@/components/faro-data-table';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { LaravelPaginator, TableSortState } from '@/types/pagination';

interface RoleRow {
    id: number;
    name: string;
    users_count: number;
    permissions_count: number;
}

function puede(permissions: string[] | undefined, ability: string): boolean {
    return (permissions ?? []).includes(ability);
}

export default function RolesIndex({
    roles,
    filters,
}: {
    roles: LaravelPaginator<RoleRow>;
    filters: { buscar?: string } & TableSortState;
}) {
    const { auth } = usePage().props as { auth: Auth };
    const perms = auth.permissions;
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Roles', href: index.url() }];
    const { confirm, dialog } = useConfirmDialog();

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const buscar = (form.elements.namedItem('buscar') as HTMLInputElement)?.value;
        router.get(
            index.url(),
            { buscar: buscar || undefined, sort: filters.sort, direction: filters.direction },
            { preserveState: true },
        );
    };

    const columns: FaroColumnDef<RoleRow>[] = [
        {
            id: 'name',
            label: 'Nombre',
            tooltip: 'Identificador del rol (p. ej. administrador, vendedor).',
            sortable: true,
            sortKey: 'name',
            cell: (r) => <span className="font-medium capitalize text-foreground">{r.name}</span>,
        },
        {
            id: 'usuarios',
            label: 'Usuarios',
            tooltip: 'Cantidad de usuarios con este rol asignado.',
            sortable: true,
            sortKey: 'usuarios',
            align: 'right',
            cell: (r) => <span className="tabular-nums text-muted-foreground">{r.users_count}</span>,
        },
        {
            id: 'permisos',
            label: 'Permisos',
            tooltip: 'Número de permisos incluidos en el rol.',
            sortable: true,
            sortKey: 'permisos',
            align: 'right',
            cell: (r) => <span className="tabular-nums text-muted-foreground">{r.permissions_count}</span>,
        },
        {
            id: 'acciones',
            label: 'Acciones',
            hideable: false,
            align: 'right',
            cell: (r) => (
                <div className="flex justify-end gap-1">
                    {puede(perms, 'roles.update') && (
                        <IconActionTooltip label="Editar rol y permisos">
                            <Button variant="ghost" size="icon" className="size-8" asChild>
                                <Link href={edit.url({ role: r.id })}>
                                    <Pencil className="size-4" />
                                </Link>
                            </Button>
                        </IconActionTooltip>
                    )}
                    {puede(perms, 'roles.delete') && (
                        <IconActionTooltip label="Eliminar rol">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-destructive hover:text-destructive"
                                type="button"
                                onClick={() =>
                                    confirm({
                                        title: '¿Eliminar rol?',
                                        description: 'No debe tener usuarios asignados.',
                                        confirmLabel: 'Eliminar',
                                        variant: 'destructive',
                                        onConfirm: () => router.delete(destroy.url({ role: r.id })),
                                    })
                                }
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </IconActionTooltip>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {dialog}
            <Head title="Roles" />
            <div className="faro-page">
                <Card>
                    <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0 pb-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <span className="faro-page-icon">
                                    <Shield className="size-4" />
                                </span>
                                Roles
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Grupos de permisos (Spatie). Asigna roles a usuarios en Usuarios.
                            </CardDescription>
                        </div>
                        {puede(perms, 'roles.create') && (
                            <Button asChild className="shrink-0">
                                <Link href={create.url()}>
                                    <Plus className="mr-2 size-4" />
                                    Nuevo rol
                                </Link>
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
                            <div className="relative min-w-0 flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    name="buscar"
                                    defaultValue={filters?.buscar}
                                    placeholder="Buscar por nombre..."
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Buscar
                            </Button>
                        </form>
                        <FaroDataTable
                            tableId="roles"
                            columns={columns}
                            paginator={roles}
                            indexUrl={index.url()}
                            query={filters}
                            sort={filters.sort}
                            direction={filters.direction ?? undefined}
                            rowKey={(r) => r.id}
                            emptyMessage="No hay roles. Crea uno nuevo."
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
