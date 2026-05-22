import { Head, Link, router } from '@inertiajs/react';
import { Boxes, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { create, destroy, edit, index } from '@/routes/paquetes';
import type { BreadcrumbItem } from '@/types';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fmtQ } from '@/lib/utils';

interface Paquete {
    id: number;
    nombre: string;
    codigo: string;
    precio_alquiler: string;
    activo: boolean;
    productos_count: number;
}

interface PaginatedPaquetes {
    data: Paquete[];
    links: { url: string | null; label: string; active: boolean }[];
}

export default function PaquetesIndex({
    paquetes,
    filters,
}: {
    paquetes: PaginatedPaquetes;
    filters: { buscar?: string };
}) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Paquetes', href: index.url() }];
    const { confirm, dialog } = useConfirmDialog();

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const buscar = (form.elements.namedItem('buscar') as HTMLInputElement).value;
        router.get(index.url(), { buscar: buscar || undefined }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Paquetes" />
            {dialog}
            <div className="faro-page">
                <Card>
                    <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Boxes className="size-5" />
                                Paquetes de alquiler
                            </CardTitle>
                            <CardDescription>
                                Combina varios productos con un precio fijo para alquilar juntos.
                            </CardDescription>
                        </div>
                        <Button variant="success" asChild>
                            <Link href={create.url()}>
                                <Plus className="mr-1 size-4" />
                                Nuevo paquete
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                name="buscar"
                                defaultValue={filters.buscar ?? ''}
                                placeholder="Buscar por nombre o código…"
                                className="max-w-sm"
                            />
                            <Button type="submit" variant="outline">
                                <Search className="size-4" />
                            </Button>
                        </form>
                        <div className="faro-table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Código</th>
                                        <th>Productos</th>
                                        <th className="text-right">Precio / día</th>
                                        <th className="text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paquetes.data.map((p) => (
                                        <tr key={p.id}>
                                            <td className="font-medium">{p.nombre}</td>
                                            <td className="text-muted-foreground">{p.codigo}</td>
                                            <td>{p.productos_count}</td>
                                            <td className="text-right">{fmtQ(p.precio_alquiler)}</td>
                                            <td className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <IconActionTooltip label="Editar">
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={edit.url({ paquete: p.id })}>
                                                                <Pencil className="size-4" />
                                                            </Link>
                                                        </Button>
                                                    </IconActionTooltip>
                                                    <IconActionTooltip label="Eliminar">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive"
                                                            onClick={() =>
                                                                confirm({
                                                                    title: '¿Eliminar paquete?',
                                                                    description: `Se eliminará «${p.nombre}».`,
                                                                    confirmLabel: 'Eliminar',
                                                                    variant: 'destructive',
                                                                    onConfirm: () =>
                                                                        router.delete(
                                                                            destroy.url({ paquete: p.id }),
                                                                        ),
                                                                })
                                                            }
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </IconActionTooltip>
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
