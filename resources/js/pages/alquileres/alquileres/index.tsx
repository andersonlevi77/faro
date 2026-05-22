import { Head, Link, router } from '@inertiajs/react';
import { ClipboardList, Pencil, Plus, Search } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { create, edit, index, show } from '@/routes/alquileres';
import type { BreadcrumbItem } from '@/types';
import { FaroDataTable, type FaroColumnDef } from '@/components/faro-data-table';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fmtRangoFechas } from '@/lib/dates';
import { fmtQ } from '@/lib/utils';
import type { LaravelPaginator, TableSortState } from '@/types/pagination';

interface ClienteMini {
    id: number;
    nombre: string;
}

interface AlquilerRow {
    id: number;
    codigo: string;
    estado: string;
    fecha_inicio_prevista: string;
    fecha_fin_prevista: string;
    total: string;
    cliente?: ClienteMini | null;
    lineas_count: number;
}

const ESTADO_COLOR: Record<string, string> = {
    creado: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    entregado: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    devuelto: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

export default function AlquileresIndex({
    alquileres,
    filters,
    estados,
    saldos,
}: {
    alquileres: LaravelPaginator<AlquilerRow>;
    filters: { buscar?: string; estado?: string } & TableSortState;
    estados: { value: string; label: string }[];
    saldos: Record<number, string>;
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Alquileres', href: index.url() },
        { title: 'Contratos', href: index.url() },
    ];

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

    const columns: FaroColumnDef<AlquilerRow>[] = [
        {
            id: 'codigo',
            label: 'Código',
            tooltip: 'Número de contrato de alquiler.',
            sortable: true,
            sortKey: 'codigo',
            cell: (a) => (
                <Link href={show.url({ alquiler: a.id })} className="font-mono text-xs font-medium text-primary hover:underline">
                    {a.codigo}
                </Link>
            ),
        },
        {
            id: 'cliente',
            label: 'Cliente',
            tooltip: 'Persona u organización que alquila.',
            sortable: true,
            sortKey: 'cliente',
            cell: (a) => a.cliente?.nombre ?? '—',
        },
        {
            id: 'estado',
            label: 'Estado',
            tooltip: 'Creado: pendiente de entrega. Entregado: en curso. Devuelto: cerrado.',
            sortable: true,
            sortKey: 'estado',
            cell: (a) => (
                <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${ESTADO_COLOR[a.estado] ?? ''}`}
                >
                    {a.estado.replace('_', ' ')}
                </span>
            ),
        },
        {
            id: 'periodo',
            label: 'Período',
            tooltip: 'Fechas previstas de inicio y fin del alquiler.',
            sortable: true,
            sortKey: 'fecha_inicio',
            cell: (a) => (
                <span className="text-muted-foreground">{fmtRangoFechas(a.fecha_inicio_prevista, a.fecha_fin_prevista)}</span>
            ),
        },
        {
            id: 'lineas',
            label: 'Líneas',
            tooltip: 'Cantidad de productos o paquetes en el contrato.',
            sortable: true,
            sortKey: 'lineas',
            align: 'center',
            cell: (a) => <span className="tabular-nums text-muted-foreground">{a.lineas_count}</span>,
        },
        {
            id: 'total',
            label: 'Total',
            tooltip: 'Monto total del contrato según días y tarifas.',
            sortable: true,
            sortKey: 'total',
            align: 'right',
            cell: (a) => <span className="tabular-nums">{fmtQ(a.total)}</span>,
        },
        {
            id: 'saldo',
            label: 'Saldo',
            tooltip: 'Monto pendiente de cobro (total menos pagos registrados).',
            align: 'right',
            cell: (a) => {
                const saldo = parseFloat(saldos[a.id] ?? '0');

                return saldo > 0 ? (
                    <span className="font-medium text-destructive tabular-nums">{fmtQ(saldos[a.id] ?? '0')}</span>
                ) : (
                    <span className="text-green-600 dark:text-green-400">—</span>
                );
            },
        },
        {
            id: 'acciones',
            label: 'Acciones',
            hideable: false,
            align: 'right',
            cell: (a) => (
                <div className="flex justify-end gap-1">
                    <IconActionTooltip label="Ver detalle">
                        <Button variant="ghost" size="icon" className="size-8" asChild>
                            <Link href={show.url({ alquiler: a.id })}>
                                <ClipboardList className="size-4" />
                            </Link>
                        </Button>
                    </IconActionTooltip>
                    {a.estado === 'creado' && (
                        <IconActionTooltip label="Editar">
                            <Button variant="ghost" size="icon" className="size-8" asChild>
                                <Link href={edit.url({ alquiler: a.id })}>
                                    <Pencil className="size-4" />
                                </Link>
                            </Button>
                        </IconActionTooltip>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Alquileres" />
            <div className="faro-page">
                <Card>
                    <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0 pb-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <span className="faro-page-icon">
                                    <ClipboardList className="size-4" />
                                </span>
                                Alquileres
                            </CardTitle>
                            <CardDescription className="mt-1">Contratos de alquiler con fechas y totales.</CardDescription>
                        </div>
                        <Button asChild className="shrink-0">
                            <Link href={create.url()}>
                                <Plus className="mr-2 size-4" />
                                Nuevo alquiler
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
                                    placeholder="Código o cliente..."
                                    className="pl-9"
                                />
                            </div>
                            <select
                                name="estado"
                                defaultValue={filters?.estado ?? ''}
                                className="faro-native-select flex h-10 w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-[220px]"
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
                            tableId="alquileres"
                            columns={columns}
                            paginator={alquileres}
                            indexUrl={index.url()}
                            query={filters}
                            sort={filters.sort}
                            direction={filters.direction ?? undefined}
                            rowKey={(a) => a.id}
                            emptyMessage="No hay alquileres. Crea uno nuevo."
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
