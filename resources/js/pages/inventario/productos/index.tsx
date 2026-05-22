import { Head, Link, router } from '@inertiajs/react';
import { Eye, Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { create, destroy, edit, index, show } from '@/routes/productos';
import type { BreadcrumbItem } from '@/types';
import { FaroDataTable, type FaroColumnDef } from '@/components/faro-data-table';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fmtQ } from '@/lib/utils';
import type { LaravelPaginator, TableSortState } from '@/types/pagination';

interface Producto {
    id: number;
    nombre: string;
    codigo: string;
    precio_alquiler_diario: string | null;
    stock_alquiler: string;
    disponibilidad_actual?: string;
    activo: boolean;
    categoria?: { id: number; nombre: string } | null;
    marca?: { id: number; nombre: string } | null;
    presentacion?: { id: number; nombre: string } | null;
}

export default function ProductosIndex({
    productos,
    filters,
}: {
    productos: LaravelPaginator<Producto>;
    filters: { buscar?: string } & TableSortState;
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inventario', href: index.url() },
        { title: 'Productos', href: index.url() },
    ];
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

    const columns: FaroColumnDef<Producto>[] = [
        {
            id: 'codigo',
            label: 'Código',
            tooltip: 'Identificador interno del producto.',
            sortable: true,
            sortKey: 'codigo',
            cell: (p) => <span className="font-mono text-xs text-muted-foreground">{p.codigo}</span>,
        },
        {
            id: 'nombre',
            label: 'Nombre',
            tooltip: 'Nombre del artículo en el catálogo.',
            sortable: true,
            sortKey: 'nombre',
            cell: (p) => (
                <Link href={show.url({ producto: p.id })} className="font-medium text-primary hover:underline">
                    {p.nombre}
                </Link>
            ),
        },
        {
            id: 'categoria',
            label: 'Categoría',
            tooltip: 'Clasificación del producto.',
            sortable: true,
            sortKey: 'categoria',
            cell: (p) => <span className="text-muted-foreground">{p.categoria?.nombre ?? '—'}</span>,
        },
        {
            id: 'marca',
            label: 'Marca',
            tooltip: 'Marca o fabricante.',
            sortable: true,
            sortKey: 'marca',
            cell: (p) => <span className="text-muted-foreground">{p.marca?.nombre ?? '—'}</span>,
        },
        {
            id: 'precio_alquiler_diario',
            label: 'Precio / día',
            tooltip: 'Tarifa de alquiler por día para una unidad.',
            sortable: true,
            sortKey: 'precio_alquiler_diario',
            align: 'right',
            cell: (p) => (
                <span className="tabular-nums">{p.precio_alquiler_diario ? fmtQ(p.precio_alquiler_diario) : '—'}</span>
            ),
        },
        {
            id: 'stock_alquiler',
            label: 'Stock total',
            tooltip: 'Unidades registradas en inventario para alquiler.',
            sortable: true,
            sortKey: 'stock_alquiler',
            align: 'right',
            cell: (p) => (
                <span className="tabular-nums text-muted-foreground">
                    {parseInt(String(p.stock_alquiler), 10) || p.stock_alquiler}
                </span>
            ),
        },
        {
            id: 'disponibilidad_actual',
            label: 'Disponible ahora',
            tooltip:
                'Unidades libres hoy: stock total menos lo comprometido en alquileres activos (entregados y no devueltos).',
            align: 'right',
            cell: (p) => {
                const disp = parseInt(String(p.disponibilidad_actual ?? p.stock_alquiler), 10) || 0;

                return (
                    <span
                        className={
                            disp <= 0
                                ? 'font-medium text-destructive tabular-nums'
                                : 'font-medium text-primary tabular-nums'
                        }
                    >
                        {disp || p.disponibilidad_actual}
                    </span>
                );
            },
        },
        {
            id: 'activo',
            label: 'Estado',
            tooltip: 'Solo los productos activos aparecen al crear alquileres.',
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
            id: 'acciones',
            label: 'Acciones',
            hideable: false,
            align: 'right',
            cell: (p) => (
                <div className="flex justify-end gap-1">
                    <IconActionTooltip label="Ver detalle">
                        <Button variant="ghost" size="icon" className="size-8" asChild>
                            <Link href={show.url({ producto: p.id })}>
                                <Eye className="size-4" />
                            </Link>
                        </Button>
                    </IconActionTooltip>
                    <IconActionTooltip label="Editar">
                        <Button variant="ghost" size="icon" className="size-8" asChild>
                            <Link href={edit.url({ producto: p.id })}>
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
                                    title: '¿Eliminar producto?',
                                    description: 'Se eliminará del inventario.',
                                    confirmLabel: 'Eliminar',
                                    variant: 'destructive',
                                    onConfirm: () => router.delete(destroy.url({ producto: p.id })),
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
            {dialog}
            <Head title="Productos" />
            <div className="faro-page">
                <Card>
                    <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0 pb-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <span className="faro-page-icon">
                                    <Package className="size-4" />
                                </span>
                                Productos
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Catálogo de artículos disponibles para alquiler
                            </CardDescription>
                        </div>
                        <Button asChild className="shrink-0">
                            <Link href={create.url()}>
                                <Plus className="mr-2 size-4" />
                                Nuevo producto
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
                            <div className="relative min-w-0 flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    name="buscar"
                                    defaultValue={filters?.buscar}
                                    placeholder="Buscar por nombre o código…"
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Buscar
                            </Button>
                        </form>
                        <FaroDataTable
                            tableId="productos"
                            columns={columns}
                            paginator={productos}
                            indexUrl={index.url()}
                            query={filters}
                            sort={filters.sort}
                            direction={filters.direction ?? undefined}
                            rowKey={(p) => p.id}
                            emptyMessage="No hay productos. Crea el primero desde «Nuevo producto»."
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
