import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Wrench } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { create, index, show } from '@/routes/mantenimientos';
import type { BreadcrumbItem } from '@/types';
import { FaroDataTable, type FaroColumnDef } from '@/components/faro-data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fmtQ } from '@/lib/utils';
import type { LaravelPaginator, TableSortState } from '@/types/pagination';

interface MantenimientoRow {
    id: number;
    titulo: string;
    estado: string;
    costo: string;
    fecha_programada: string | null;
    unidad?: { id: number; codigo: string; producto?: { nombre: string } | null } | null;
    producto?: { id: number; nombre: string } | null;
}

interface EstadoOpcion {
    value: string;
    label: string;
    color: string;
}

const colorMap: Record<string, string> = {
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    gray: 'bg-muted text-muted-foreground',
};

export default function MantenimientosIndex({
    mantenimientos,
    filters,
    estados,
}: {
    mantenimientos: LaravelPaginator<MantenimientoRow>;
    filters: { buscar?: string; estado?: string } & TableSortState;
    estados: EstadoOpcion[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Mantenimientos', href: index.url() }];

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const buscar = (form.elements.namedItem('buscar') as HTMLInputElement)?.value;
        const estadoEl = form.elements.namedItem('estado') as HTMLSelectElement | null;
        const estado = estadoEl?.value;
        router.get(
            index.url(),
            {
                buscar: buscar || undefined,
                estado: estado || undefined,
                sort: filters.sort,
                direction: filters.direction,
            },
            { preserveState: true },
        );
    };

    const columns: FaroColumnDef<MantenimientoRow>[] = [
        {
            id: 'titulo',
            label: 'Título',
            tooltip: 'Descripción breve del trabajo de mantenimiento.',
            sortable: true,
            sortKey: 'titulo',
            cell: (m) => (
                <Link href={show.url({ mantenimiento: m.id })} className="font-medium text-primary hover:underline">
                    {m.titulo}
                </Link>
            ),
        },
        {
            id: 'equipo',
            label: 'Unidad / Producto',
            tooltip: 'Unidad serializada o producto asociado al mantenimiento.',
            cell: (m) => (
                <span className="text-muted-foreground">
                    {m.unidad ? (
                        <>
                            {m.unidad.codigo}{' '}
                            <span className="text-xs">({m.unidad.producto?.nombre})</span>
                        </>
                    ) : (
                        (m.producto?.nombre ?? '—')
                    )}
                </span>
            ),
        },
        {
            id: 'estado',
            label: 'Estado',
            tooltip: 'Pendiente, en proceso o finalizado.',
            sortable: true,
            sortKey: 'estado',
            cell: (m) => {
                const estadoInfo = estados.find((e) => e.value === m.estado);

                return (
                    <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorMap[estadoInfo?.color ?? 'gray'] ?? colorMap.gray}`}
                    >
                        {estadoInfo?.label ?? m.estado}
                    </span>
                );
            },
        },
        {
            id: 'costo',
            label: 'Costo',
            tooltip: 'Costo estimado o real del mantenimiento.',
            sortable: true,
            sortKey: 'costo',
            align: 'right',
            cell: (m) => <span className="tabular-nums">{fmtQ(m.costo)}</span>,
        },
        {
            id: 'fecha_programada',
            label: 'Programado',
            tooltip: 'Fecha planificada para realizar el mantenimiento.',
            sortable: true,
            sortKey: 'fecha_programada',
            cell: (m) => <span className="text-muted-foreground">{m.fecha_programada ?? '—'}</span>,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mantenimientos" />
            <div className="faro-page">
                <Card>
                    <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0 pb-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <span className="faro-page-icon">
                                    <Wrench className="size-4" />
                                </span>
                                Mantenimientos
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Registro de mantenimiento de unidades y equipos.
                            </CardDescription>
                        </div>
                        <Button asChild className="shrink-0">
                            <Link href={create.url()}>
                                <Plus className="mr-2 size-4" />
                                Nuevo mantenimiento
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <div className="relative min-w-0 flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    name="buscar"
                                    defaultValue={filters?.buscar}
                                    placeholder="Título, código de unidad o producto..."
                                    className="pl-9"
                                />
                            </div>
                            <select
                                name="estado"
                                defaultValue={filters?.estado ?? ''}
                                className="faro-native-select flex h-10 w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-[200px]"
                            >
                                <option value="">Todos los estados</option>
                                {estados.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                            <Button type="submit" variant="secondary">
                                Filtrar
                            </Button>
                        </form>
                        <FaroDataTable
                            tableId="mantenimientos"
                            columns={columns}
                            paginator={mantenimientos}
                            indexUrl={index.url()}
                            query={filters}
                            sort={filters.sort}
                            direction={filters.direction ?? undefined}
                            rowKey={(m) => m.id}
                            emptyMessage="No hay mantenimientos registrados."
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
