import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { edit, index, update } from '@/routes/usuarios';
import type { BreadcrumbItem } from '@/types';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Role {
    id: number;
    name: string;
}

interface Usuario {
    id: number;
    name: string;
    email: string;
    roles: Role[];
}

export default function UsuariosEditar({ usuario, roles }: { usuario: Usuario; roles: Role[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Usuarios', href: index.url() },
        { title: usuario.name, href: edit.url({ user: usuario.id }) },
    ];

    const initialRoles = usuario.roles.map((r) => r.name);

    const { data, setData, put, processing } = useForm({
        roles: initialRoles as string[],
    });

    const toggleRole = (name: string) => {
        if (data.roles.includes(name)) {
            setData(
                'roles',
                data.roles.filter((r) => r !== name),
            );
        } else {
            setData('roles', [...data.roles, name]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(update.url({ user: usuario.id }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Roles: ${usuario.name}`} />
            <div className="flex h-full flex-1 flex-col gap-5 p-4 md:p-5">
                <div className="flex items-center gap-3">
                    <IconActionTooltip label="Volver a la lista de usuarios">
                        <Button variant="ghost" size="icon" className="size-9 rounded-lg hover:bg-accent" asChild>
                            <Link href={index.url()}>
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                    </IconActionTooltip>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">Roles de {usuario.name}</h1>
                        <p className="text-sm text-muted-foreground">{usuario.email}</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="w-full space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Roles disponibles</CardTitle>
                            <CardDescription>Un usuario puede tener varios roles; los permisos se combinan.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {roles.map((r) => (
                                <label
                                    key={r.id}
                                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 px-3 py-2 hover:bg-muted/30"
                                >
                                    <input
                                        type="checkbox"
                                        className="size-4 rounded border-input"
                                        checked={data.roles.includes(r.name)}
                                        onChange={() => toggleRole(r.name)}
                                    />
                                    <span className="text-sm font-medium capitalize">{r.name}</span>
                                </label>
                            ))}
                            <div className="flex gap-2 pt-4">
                                <Button type="submit" disabled={processing}>
                                    Guardar
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={index.url()}>Cancelar</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
