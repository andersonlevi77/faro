import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2, UserCog, UserMinus, UserPlus } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import activo from '@/routes/usuarios/activo';
import { create, destroy, edit, index } from '@/routes/usuarios';
import type { Auth, BreadcrumbItem } from '@/types';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Role {
    id: number;
    name: string;
}

interface UsuarioRow {
    id: number;
    name: string;
    email: string;
    activo: boolean;
    roles: Role[];
}

interface Paginated {
    data: UsuarioRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

function puede(permissions: string[] | undefined, ability: string): boolean {
    return (permissions ?? []).includes(ability);
}

export default function UsuariosIndex({ usuarios, filters }: { usuarios: Paginated; filters: { buscar?: string } }) {
    const { auth } = usePage().props as { auth: Auth };
    const perms = auth.permissions;
    const currentUserId = auth.user?.id;
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Usuarios', href: index.url() }];
    const { confirm, dialog } = useConfirmDialog();

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const buscar = (form.elements.namedItem('buscar') as HTMLInputElement)?.value;
        router.get(index.url(), { buscar: buscar || undefined }, { preserveState: true });
    };

    const toggleActivo = (usuario: UsuarioRow) => {
        const habilitar = !usuario.activo;
        confirm({
            title: habilitar ? `¿Habilitar a ${usuario.name}?` : `¿Deshabilitar a ${usuario.name}?`,
            description: habilitar
                ? 'Podrá volver a iniciar sesión en el sistema.'
                : 'No podrá iniciar sesión. Sus sesiones activas se cerrarán de inmediato.',
            confirmLabel: habilitar ? 'Habilitar usuario' : 'Deshabilitar usuario',
            variant: habilitar ? 'default' : 'destructive',
            onConfirm: () =>
                router.patch(activo.update.url({ user: usuario.id }), { activo: habilitar }, { preserveScroll: true }),
        });
    };

    const eliminarUsuario = (usuario: UsuarioRow) => {
        confirm({
            title: `¿Eliminar a ${usuario.name}?`,
            description:
                'Se borrará la cuenta de forma permanente. Esta acción no se puede deshacer. Si solo quieres impedir el acceso, usa deshabilitar.',
            confirmLabel: 'Eliminar usuario',
            variant: 'destructive',
            onConfirm: () => router.delete(destroy.url({ user: usuario.id })),
        });
    };

    const esPropio = (id: number) => currentUserId === id;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {dialog}
            <Head title="Usuarios" />
            <div className="faro-page">
                <Card>
                    <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0 pb-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <span className="faro-page-icon">
                                    <UserCog className="size-4" />
                                </span>
                                Usuarios y roles
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Crea cuentas para colaboradores (contraseña y roles) o edita roles desde la lista. Puedes
                                deshabilitar el acceso sin borrar la cuenta, o eliminar usuarios que ya no necesites. La
                                matriz de permisos de cada rol se configura en{' '}
                                <span className="font-medium text-foreground">Roles</span>.
                            </CardDescription>
                        </div>
                        {puede(perms, 'usuarios.create') && (
                            <Button asChild className="shrink-0">
                                <Link href={create.url()}>
                                    <Plus className="mr-2 size-4" />
                                    Nuevo usuario
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
                                    placeholder="Nombre o email..."
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
                                        <th className="px-4 py-3 text-left font-medium">Usuario</th>
                                        <th className="px-4 py-3 text-left font-medium">Estado</th>
                                        <th className="px-4 py-3 text-left font-medium">Roles</th>
                                        <th className="w-[120px] px-4 py-3 text-left font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.data.map((u) => (
                                        <tr
                                            key={u.id}
                                            className={cn(
                                                'border-b border-border/30',
                                                !u.activo && 'bg-muted/20 opacity-75',
                                            )}
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-medium">{u.name}</p>
                                                <p className="text-muted-foreground">{u.email}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                                        u.activo
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
                                                    )}
                                                >
                                                    {u.activo ? 'Activo' : 'Deshabilitado'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {u.roles.length ? u.roles.map((r) => r.name).join(', ') : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1">
                                                    {puede(perms, 'usuarios.update') && (
                                                        <IconActionTooltip label="Asignar roles al usuario">
                                                            <Button variant="ghost" size="icon" className="size-8" asChild>
                                                                <Link href={edit.url({ user: u.id })}>
                                                                    <Pencil className="size-4" />
                                                                </Link>
                                                            </Button>
                                                        </IconActionTooltip>
                                                    )}
                                                    {puede(perms, 'usuarios.update') && !esPropio(u.id) && (
                                                        <IconActionTooltip
                                                            label={u.activo ? 'Deshabilitar usuario' : 'Habilitar usuario'}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={cn(
                                                                    'size-8',
                                                                    u.activo
                                                                        ? 'text-orange-600 hover:text-orange-600'
                                                                        : 'text-green-600 hover:text-green-600',
                                                                )}
                                                                type="button"
                                                                onClick={() => toggleActivo(u)}
                                                            >
                                                                {u.activo ? (
                                                                    <UserMinus className="size-4" />
                                                                ) : (
                                                                    <UserPlus className="size-4" />
                                                                )}
                                                            </Button>
                                                        </IconActionTooltip>
                                                    )}
                                                    {puede(perms, 'usuarios.delete') && !esPropio(u.id) && (
                                                        <IconActionTooltip label="Eliminar usuario">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-8 text-destructive hover:text-destructive"
                                                                type="button"
                                                                onClick={() => eliminarUsuario(u)}
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </IconActionTooltip>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
