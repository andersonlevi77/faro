import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { create, destroy, edit, index, show } from '@/routes/clientes';
import type { BreadcrumbItem } from '@/types';
import { FaroDataTable, type FaroColumnDef } from '@/components/faro-data-table';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { LaravelPaginator, TableSortState } from '@/types/pagination';

interface ClienteRow {
    id: number;
    codigo: string | null;
    nombre: string;
    documento: string | null;
    email: string | null;
    telefono: string | null;
    ciudad: string | null;
    alquileres_count: number;
}

interface Puntaje {
    puntuacion: number;
    etiqueta: string;
}

const SCORE_COLOR: Record<string, string> = {
    Excelente: 'faro-status-excelente',
    Bueno: 'faro-status-bueno',
    Regular: 'faro-status-regular',
    Bajo: 'faro-status-bajo',
};

export default function ClientesIndex({
    clientes,
    filters,
    puntajes,
}: {
    clientes: LaravelPaginator<ClienteRow>;
    filters: { buscar?: string } & TableSortState;
    puntajes: Record<number, Puntaje>;
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Alquileres', href: index.url() },
        { title: 'Clientes', href: index.url() },
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

    const columns: FaroColumnDef<ClienteRow>[] = [
        {
            id: 'codigo',
            label: 'Código',
            tooltip: 'Identificador interno del cliente.',
            sortable: true,
            sortKey: 'codigo',
            cell: (c) => <span className="font-mono text-xs text-muted-foreground">{c.codigo ?? '—'}</span>,
        },
        {
            id: 'nombre',
            label: 'Nombre',
            tooltip: 'Nombre del cliente o razón social.',
            sortable: true,
            sortKey: 'nombre',
            cell: (c) => <span className="font-medium text-foreground">{c.nombre}</span>,
        },
        {
            id: 'documento',
            label: 'Documento',
            tooltip: 'NIT, DPI u otro identificador.',
            sortable: true,
            sortKey: 'documento',
            cell: (c) => <span className="text-muted-foreground">{c.documento ?? '—'}</span>,
        },
        {
            id: 'contacto',
            label: 'Contacto',
            tooltip: 'Correo y teléfono de contacto.',
            sortable: true,
            sortKey: 'email',
            cell: (c) => (
                <span className="text-muted-foreground">
                    {[c.email, c.telefono].filter(Boolean).join(' · ') || '—'}
                </span>
            ),
        },
        {
            id: 'alquileres',
            label: 'Alquileres',
            tooltip: 'Cantidad de contratos de alquiler registrados.',
            sortable: true,
            sortKey: 'alquileres',
            align: 'right',
            cell: (c) => <span className="tabular-nums">{c.alquileres_count}</span>,
        },
        {
            id: 'puntuacion',
            label: 'Puntuación',
            tooltip:
                'Calificación según historial de pagos y devoluciones: puntualidad, daños y cumplimiento.',
            cell: (c) => {
                const puntaje = puntajes[c.id];

                if (!puntaje) {
                    return null;
                }

                return (
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${SCORE_COLOR[puntaje.etiqueta] ?? ''}`}
                    >
                        {puntaje.puntuacion} — {puntaje.etiqueta}
                    </span>
                );
            },
        },
        {
            id: 'acciones',
            label: 'Acciones',
            hideable: false,
            align: 'right',
            cell: (c) => (
                <div className="flex justify-end gap-1">
                    <IconActionTooltip label="Ver ficha">
                        <Button variant="ghost" size="icon" className="size-8" asChild>
                            <Link href={show.url({ cliente: c.id })}>
                                <Users className="size-4" />
                            </Link>
                        </Button>
                    </IconActionTooltip>
                    <IconActionTooltip label="Editar">
                        <Button variant="ghost" size="icon" className="size-8" asChild>
                            <Link href={edit.url({ cliente: c.id })}>
                                <Pencil className="size-4" />
                            </Link>
                        </Button>
                    </IconActionTooltip>
                    <IconActionTooltip label="Eliminar">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                            onClick={() =>
                                confirm({
                                    title: '¿Eliminar cliente?',
                                    description: 'Esta acción no se puede deshacer.',
                                    confirmLabel: 'Eliminar',
                                    variant: 'destructive',
                                    onConfirm: () => router.delete(destroy.url({ cliente: c.id })),
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
            <Head title="Clientes" />
            <div className="faro-page">
                <Card>
                    <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0 pb-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <span className="faro-page-icon">
                                    <Users className="size-4" />
                                </span>
                                Clientes
                            </CardTitle>
                            <CardDescription className="mt-1">Personas u organizaciones que alquilan equipo.</CardDescription>
                        </div>
                        <Button asChild className="shrink-0">
                            <Link href={create.url()}>
                                <Plus className="mr-2 size-4" />
                                Nuevo cliente
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
                                    placeholder="Buscar por nombre, documento, email..."
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Buscar
                            </Button>
                        </form>
                        <FaroDataTable
                            tableId="clientes"
                            columns={columns}
                            paginator={clientes}
                            indexUrl={index.url()}
                            query={filters}
                            sort={filters.sort}
                            direction={filters.direction ?? undefined}
                            rowKey={(c) => c.id}
                            emptyMessage="No hay clientes. Crea el primero."
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
