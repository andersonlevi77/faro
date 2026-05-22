import { Head, Link, router } from '@inertiajs/react';
import { Boxes, Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { create, destroy, edit, index, show } from '@/routes/paquetes';
import type { BreadcrumbItem } from '@/types';
import { FaroDataTable, type FaroColumnDef } from '@/components/faro-data-table';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fmtQ } from '@/lib/utils';
import type { LaravelPaginator, TableSortState } from '@/types/pagination';

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
    paquetes: LaravelPaginator<Paquete>;
    filters: { buscar?: string } & TableSortState;
}) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Paquetes', href: index.url() }];
    const { confirm, dialog } = useConfirmDialog();

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const buscar = (form.elements.namedItem('buscar') as HTMLInputElement).value;
        router.get(
            index.url(),
            { buscar: buscar || undefined, sort: filters.sort, direction: filters.direction },
            { preserveState: true },
        );
    };

    const columns: FaroColumnDef<Paquete>[] = [
        {
            id: 'codigo',
            label: 'Código',
            tooltip: 'Identificador único del paquete en el catálogo.',
            sortable: true,
            sortKey: 'codigo',
            cell: (p) => (
                <span className="font-mono text-xs text-muted-foreground">{p.codigo}</span>
            ),
        },
        {
            id: 'nombre',
            label: 'Nombre',
            tooltip: 'Nombre comercial del paquete de alquiler.',
            sortable: true,
            sortKey: 'nombre',
            cell: (p) => (
                <Link href={show.url({ paquete: p.id })} className="font-medium text-primary hover:underline">
                    {p.nombre}
                </Link>
            ),
        },
        {
            id: 'descripcion',
            label: 'Descripción',
            tooltip: 'Detalle opcional de lo que incluye el paquete.',
            sortable: true,
            sortKey: 'descripcion',
            cell: (p) => (
                <span className="max-w-[200px] text-muted-foreground">{truncar(p.descripcion)}</span>
            ),
        },
        {
            id: 'productos',
            label: 'Productos',
            tooltip: 'Cantidad de productos distintos que forman este paquete.',
            sortable: true,
            sortKey: 'productos',
            align: 'center',
            cell: (p) => <span className="tabular-nums">{p.productos_count}</span>,
        },
        {
            id: 'stock_disponible',
            label: 'Disp. paquetes',
            tooltip:
                'Cuántos paquetes completos puedes alquilar ahora. Se calcula según el stock disponible de cada producto del kit (el producto que menos permita limita el total).',
            align: 'right',
            hideable: true,
            cell: (p) => {
                const disp = parseInt(p.stock_disponible, 10) || 0;

                return (
                    <span
                        className={
                            disp <= 0
                                ? 'font-medium text-destructive tabular-nums'
                                : 'font-medium text-primary tabular-nums'
                        }
                    >
                        {p.stock_disponible}
                    </span>
                );
            },
        },
        {
            id: 'precio_alquiler',
            label: 'Precio / día',
            tooltip: 'Precio de alquiler del paquete completo por día.',
            sortable: true,
            sortKey: 'precio_alquiler',
            align: 'right',
            cell: (p) => <span className="tabular-nums">{fmtQ(p.precio_alquiler)}</span>,
        },
        {
            id: 'activo',
            label: 'Estado',
            tooltip: 'Si está activo, el paquete aparece al crear alquileres.',
            sortable: true,
            sortKey: 'activo',
            align: 'center',
            cell: (p) => (
                <span className={p.activo ? 'font-medium text-primary' : 'text-muted-foreground'}>
                    {p.activo ? 'Activo' : 'Inactivo'}
                </span>
            ),
        },
        {
            id: 'alquileres',
            label: 'En alquileres',
            tooltip: 'Veces que este paquete se ha usado en líneas de alquiler.',
            sortable: true,
            sortKey: 'alquileres',
            align: 'center',
            cell: (p) => (
                <span className="tabular-nums text-muted-foreground">{p.alquiler_lineas_count}</span>
            ),
        },
        {
            id: 'acciones',
            label: 'Acciones',
            hideable: false,
            align: 'right',
            cell: (p) => (
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
                                    onConfirm: () => router.delete(destroy.url({ paquete: p.id })),
                                })
                            }
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </IconActionTooltip>
                </div>
            ),
        },
    ];

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
                        <FaroDataTable
                            tableId="paquetes"
                            columns={columns}
                            paginator={paquetes}
                            indexUrl={index.url()}
                            query={filters}
                            sort={filters.sort}
                            direction={filters.direction ?? undefined}
                            rowKey={(p) => p.id}
                            emptyMessage="No hay paquetes. Crea el primero desde «Nuevo paquete»."
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
