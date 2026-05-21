import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { RolePermissionsMatrix, type MatrizPermisos } from '@/components/role-permissions-matrix';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { create, index, store } from '@/routes/roles';
import type { BreadcrumbItem } from '@/types';

export default function RolesCrear({ matrizPermisos }: { matrizPermisos: MatrizPermisos }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Roles', href: index.url() },
        { title: 'Nuevo', href: create.url() },
    ];

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: [] as string[],
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
        post(store.url());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo rol" />
            <div className="faro-page">
                <div className="flex items-center gap-3">
                    <IconActionTooltip label="Volver a la lista de roles">
                        <Button variant="ghost" size="icon" className="size-9 rounded-xl hover:bg-muted" asChild>
                            <Link href={index.url()}>
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                    </IconActionTooltip>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">Nuevo rol</h1>
                        <p className="text-sm text-muted-foreground">Define el nombre y el conjunto de permisos del rol.</p>
                    </div>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="faro-form-card"
                >
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del rol *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            placeholder="ej. supervisor"
                            className="w-full"
                        />
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
                        <Button type="submit" variant="success" disabled={processing} className="faro-btn-primary">
                            Guardar rol
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
