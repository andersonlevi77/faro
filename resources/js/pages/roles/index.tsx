import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Search, Shield, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { create, destroy, edit, index } from '@/routes/roles';
import type { Auth, BreadcrumbItem } from '@/types';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RoleRow {
    id: number;
    name: string;
    users_count: number;
    permissions_count: number;
}

interface Paginated {
    data: RoleRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

function puede(permissions: string[] | undefined, ability: string): boolean {
    return (permissions ?? []).includes(ability);
}

export default function RolesIndex({ roles, filters }: { roles: Paginated; filters: { buscar?: string } }) {
    const { auth } = usePage().props as { auth: Auth };
    const perms = auth.permissions;
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Roles', href: index.url() }];
    const { confirm, dialog } = useConfirmDialog();

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const buscar = (form.elements.namedItem('buscar') as HTMLInputElement)?.value;
        router.get(index.url(), { buscar: buscar || undefined }, { preserveState: true });
    };

    const handleDestroy = (id: number) => {
        confirm({
            title: '¿Eliminar este rol?',
            description: 'Esta acción no se puede deshacer. El rol no debe tener usuarios asignados.',
            confirmLabel: 'Eliminar rol',
            onConfirm: () => router.delete(destroy.url({ role: id })),
        });
    };

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
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
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
                        <div className="faro-table-wrap">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/40 bg-muted/30">
                                        <th className="px-4 py-3 text-left font-medium">Nombre</th>
                                        <th className="px-4 py-3 text-right font-medium">Usuarios</th>
                                        <th className="px-4 py-3 text-right font-medium">Permisos</th>
                                        <th className="w-[88px] px-4 py-3 text-left font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                                                No hay roles. Crea uno nuevo.
                                            </td>
                                        </tr>
                                    ) : (
                                        roles.data.map((r) => (
                                            <tr key={r.id} className="border-b border-border/30">
                                                <td className="px-4 py-3 font-medium capitalize text-foreground">{r.name}</td>
                                                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                                                    {r.users_count}
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                                                    {r.permissions_count}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1">
                                                        {puede(perms, 'roles.update') && (
                                                            <IconActionTooltip label="Editar rol y permisos">
                                                                <Button variant="ghost" size="icon" className="size-8" asChild>
                                                                    <Link href={edit.url({ role: r.id })}>
                                                                        <span className="sr-only">Editar</span>
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
                                                                    onClick={() => handleDestroy(r.id)}
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                </Button>
                                                            </IconActionTooltip>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
