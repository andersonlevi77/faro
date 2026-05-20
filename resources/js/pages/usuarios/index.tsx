import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Search, UserCog } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { create, edit, index } from '@/routes/usuarios';
import type { Auth, BreadcrumbItem } from '@/types';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Role {
    id: number;
    name: string;
}

interface UsuarioRow {
    id: number;
    name: string;
    email: string;
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
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Usuarios', href: index.url() }];

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const buscar = (form.elements.namedItem('buscar') as HTMLInputElement)?.value;
        router.get(index.url(), { buscar: buscar || undefined }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />
            <div className="flex h-full flex-1 flex-col gap-5 p-4 md:p-5">
                <Card className="shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                    <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0 pb-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <UserCog className="size-4" />
                                </span>
                                Usuarios y roles
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Crea cuentas para colaboradores (contraseña y roles) o edita roles desde la lista. La
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
                        <div className="overflow-x-auto rounded-lg bg-muted/20">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/40 bg-muted/30">
                                        <th className="px-4 py-3 text-left font-medium">Usuario</th>
                                        <th className="px-4 py-3 text-left font-medium">Roles</th>
                                        <th className="w-[80px] px-4 py-3 text-left font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.data.map((u) => (
                                        <tr key={u.id} className="border-b border-border/30">
                                            <td className="px-4 py-3">
                                                <p className="font-medium">{u.name}</p>
                                                <p className="text-muted-foreground">{u.email}</p>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {u.roles.length ? u.roles.map((r) => r.name).join(', ') : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <IconActionTooltip label="Asignar roles al usuario">
                                                    <Button variant="ghost" size="icon" className="size-8" asChild>
                                                        <Link href={edit.url({ user: u.id })}>
                                                            <Pencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                </IconActionTooltip>
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
