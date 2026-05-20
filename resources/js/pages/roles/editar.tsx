import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { RolePermissionsMatrix, type MatrizPermisos } from '@/components/role-permissions-matrix';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { edit, index, update } from '@/routes/roles';
import type { BreadcrumbItem } from '@/types';

interface RolEdit {
    id: number;
    name: string;
    permissions: string[];
}

export default function RolesEditar({
    rol,
    matrizPermisos,
}: {
    rol: RolEdit;
    matrizPermisos: MatrizPermisos;
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Roles', href: index.url() },
        { title: rol.name, href: edit.url({ role: rol.id }) },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: rol.name,
        permissions: [...rol.permissions],
    });

    const togglePermiso = (name: string) => {
        if (data.permissions.includes(name)) {
            setData(
                'permissions',
                data.permissions.filter((p) => p !== name),
            );
        } else {
            setData('permissions', [...data.permissions, name]);
        }
    };

    const handleToggleRow = (names: string[], allSelected: boolean) => {
        if (allSelected) {
            setData(
                'permissions',
                data.permissions.filter((p) => !names.includes(p)),
            );
        } else {
            setData('permissions', [...new Set([...data.permissions, ...names])]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(update.url({ role: rol.id }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar rol: ${rol.name}`} />
            <div className="flex h-full flex-1 flex-col gap-5 p-4 md:p-5">
                <div className="flex items-center gap-3">
                    <IconActionTooltip label="Volver a la lista de roles">
                        <Button variant="ghost" size="icon" className="size-9 rounded-lg hover:bg-accent" asChild>
                            <Link href={index.url()}>
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                    </IconActionTooltip>
                    <div>
                        <h1 className="text-xl font-semibold capitalize tracking-tight text-foreground">Editar rol</h1>
                        <p className="text-sm text-muted-foreground">
                            Ajusta el nombre y la matriz de permisos. Los usuarios heredan estos permisos al tener asignado este rol.
                        </p>
                    </div>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="w-full space-y-6 rounded-xl bg-card p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]"
                >
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del rol *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            disabled={rol.name === 'administrador'}
                            className={`w-full ${rol.name === 'administrador' ? 'opacity-80' : ''}`}
                        />
                        {rol.name === 'administrador' && (
                            <p className="text-xs text-muted-foreground">El nombre del rol administrador no se puede cambiar.</p>
                        )}
                        <InputError message={errors.name} />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-base font-medium text-foreground">Permisos del rol</h2>
                        <RolePermissionsMatrix
                            matriz={matrizPermisos}
                            selected={data.permissions}
                            onToggle={togglePermiso}
                            onToggleRow={handleToggleRow}
                        />
                        <InputError message={errors.permissions} />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>
                            Guardar cambios
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href={index.url()}>Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
