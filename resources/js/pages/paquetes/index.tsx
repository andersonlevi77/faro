import { Head, Link, router } from '@inertiajs/react';
import { Boxes, Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { create, destroy, edit, index, show } from '@/routes/paquetes';
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
    descripcion: string | null;
    precio_alquiler: string;
    activo: boolean;
    stock_disponible: string;
    productos_count: number;
    alquiler_lineas_count: number;
}

interface PaginatedPaquetes {
    data: Paquete[];
    links: { url: string | null; label: string; active: boolean }[];
}

function truncar(texto: string | null, max = 40): string {
    if (!texto) {
        return '—';
    }

    return texto.length > max ? `${texto.slice(0, max)}…` : texto;
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
                        <div className="faro-table-wrap overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/40 bg-muted/30">
                                        <th className="px-4 py-3 text-left font-medium">Código</th>
                                        <th className="px-4 py-3 text-left font-medium">Nombre</th>
                                        <th className="px-4 py-3 text-left font-medium">Descripción</th>
                                        <th className="px-4 py-3 text-center font-medium">Productos</th>
                                        <th className="px-4 py-3 text-right font-medium">Disp. paquetes</th>
                                        <th className="px-4 py-3 text-right font-medium">Precio / día</th>
                                        <th className="px-4 py-3 text-center font-medium">Estado</th>
                                        <th className="px-4 py-3 text-center font-medium">En alquileres</th>
                                        <th className="w-[130px] px-4 py-3 text-right font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paquetes.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                                                No hay paquetes. Crea el primero desde «Nuevo paquete».
                                            </td>
                                        </tr>
                                    ) : (
                                        paquetes.data.map((p) => {
                                            const disp = parseInt(p.stock_disponible, 10) || 0;

                                            return (
                                                <tr
                                                    key={p.id}
                                                    className="border-b border-border/30 last:border-0 transition-colors hover:bg-muted/25"
                                                >
                                                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                                        {p.codigo}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">
                                                        <Link
                                                            href={show.url({ paquete: p.id })}
                                                            className="text-primary hover:underline"
                                                        >
                                                            {p.nombre}
                                                        </Link>
                                                    </td>
                                                    <td className="max-w-[200px] px-4 py-3 text-muted-foreground">
                                                        {truncar(p.descripcion)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center tabular-nums">
                                                        {p.productos_count}
                                                    </td>
                                                    <td className="px-4 py-3 text-right tabular-nums">
                                                        <span
                                                            className={
                                                                disp <= 0
                                                                    ? 'font-medium text-destructive'
                                                                    : 'font-medium text-primary'
                                                            }
                                                        >
                                                            {p.stock_disponible}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right tabular-nums">
                                                        {fmtQ(p.precio_alquiler)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span
                                                            className={
                                                                p.activo
                                                                    ? 'font-medium text-primary'
                                                                    : 'text-muted-foreground'
                                                            }
                                                        >
                                                            {p.activo ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center tabular-nums text-muted-foreground">
                                                        {p.alquiler_lineas_count}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-1">
                                                            <IconActionTooltip label="Ver detalle">
                                                                <Button variant="ghost" size="icon" className="size-8" asChild>
                                                                    <Link href={show.url({ paquete: p.id })}>
                                                                        <Eye className="size-4" />
                                                                    </Link>
                                                                </Button>
                                                            </IconActionTooltip>
                                                            <IconActionTooltip label="Editar">
                                                                <Button variant="ghost" size="icon" className="size-8" asChild>
                                                                    <Link href={edit.url({ paquete: p.id })}>
                                                                        <Pencil className="size-4" />
                                                                    </Link>
                                                                </Button>
                                                            </IconActionTooltip>
                                                            <IconActionTooltip label="Eliminar">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="size-8 text-destructive hover:bg-destructive/10"
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
                                            );
                                        })
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
