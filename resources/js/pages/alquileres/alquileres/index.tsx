import { Head, Link, router } from '@inertiajs/react';
import { ClipboardList, Pencil, Plus, Search } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { create, edit, index, show } from '@/routes/alquileres';
import type { BreadcrumbItem } from '@/types';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fmtQ } from '@/lib/utils';

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

interface Paginated {
    data: AlquilerRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

const ESTADO_COLOR: Record<string, string> = {
    borrador: 'bg-muted text-muted-foreground',
    reservado: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    entregado: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    en_uso: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    devuelto: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    cerrado: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export default function AlquileresIndex({
    alquileres,
    filters,
    estados,
    saldos,
}: {
    alquileres: Paginated;
    filters: { buscar?: string; estado?: string };
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
            },
            { preserveState: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Alquileres" />
            <div className="flex h-full flex-1 flex-col gap-5 p-4 md:p-5">
                <Card className="shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                    <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0 pb-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
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
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-[220px]"
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
                        <div className="overflow-x-auto rounded-lg bg-muted/20">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/40 bg-muted/30">
                                        <th className="px-4 py-3 text-left font-medium">Código</th>
                                        <th className="px-4 py-3 text-left font-medium">Cliente</th>
                                        <th className="px-4 py-3 text-left font-medium">Estado</th>
                                        <th className="px-4 py-3 text-left font-medium">Período</th>
                                        <th className="px-4 py-3 text-right font-medium">Total</th>
                                        <th className="px-4 py-3 text-right font-medium">Saldo</th>
                                        <th className="w-[90px] px-4 py-3 text-left font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alquileres.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                                                No hay alquileres. Crea uno en borrador.
                                            </td>
                                        </tr>
                                    ) : (
                                        alquileres.data.map((a) => {
                                            const saldo = parseFloat(saldos[a.id] ?? '0');
                                            return (
                                                <tr key={a.id} className="border-b border-border/30">
                                                    <td className="px-4 py-3 font-mono text-xs font-medium">{a.codigo}</td>
                                                    <td className="px-4 py-3">{a.cliente?.nombre ?? '—'}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${ESTADO_COLOR[a.estado] ?? ''}`}>
                                                            {a.estado.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {a.fecha_inicio_prevista} → {a.fecha_fin_prevista}
                                                    </td>
                                                    <td className="px-4 py-3 text-right tabular-nums">{fmtQ(a.total)}</td>
                                                    <td className="px-4 py-3 text-right tabular-nums">
                                                        {saldo > 0 ? (
                                                            <span className="font-medium text-destructive">{fmtQ(saldos[a.id] ?? '0')}</span>
                                                        ) : (
                                                            <span className="text-green-600 dark:text-green-400">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-1">
                                                            <IconActionTooltip label="Ver detalle del alquiler">
                                                                <Button variant="ghost" size="icon" className="size-8" asChild>
                                                                    <Link href={show.url({ alquiler: a.id })}>
                                                                        <ClipboardList className="size-4" />
                                                                    </Link>
                                                                </Button>
                                                            </IconActionTooltip>
                                                            {a.estado === 'borrador' && (
                                                                <IconActionTooltip label="Editar borrador">
                                                                    <Button variant="ghost" size="icon" className="size-8" asChild>
                                                                        <Link href={edit.url({ alquiler: a.id })}>
                                                                            <Pencil className="size-4" />
                                                                        </Link>
                                                                    </Button>
                                                                </IconActionTooltip>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {alquileres.last_page > 1 && (
                            <div className="flex flex-wrap justify-center gap-1">
                                {alquileres.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className="min-w-[2rem]"
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
