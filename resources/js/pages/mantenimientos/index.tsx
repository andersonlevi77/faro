import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Wrench } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { create, index, show } from '@/routes/mantenimientos';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fmtQ } from '@/lib/utils';

interface MantenimientoRow {
    id: number;
    titulo: string;
    estado: string;
    costo: string;
    fecha_programada: string | null;
    fecha_inicio_at: string | null;
    fecha_fin_at: string | null;
    unidad?: { id: number; codigo: string; producto?: { nombre: string } | null } | null;
    producto?: { id: number; nombre: string } | null;
    creado_por?: { name: string } | null;
}

interface Paginated {
    data: MantenimientoRow[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
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
    mantenimientos: Paginated;
    filters: { buscar?: string; estado?: string };
    estados: EstadoOpcion[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mantenimientos', href: index.url() },
    ];

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const buscar = (form.elements.namedItem('buscar') as HTMLInputElement)?.value;
        const estadoEl = form.elements.namedItem('estado') as HTMLSelectElement | null;
        const estado = estadoEl?.value;
        router.get(index.url(), { buscar: buscar || undefined, estado: estado || undefined }, { preserveState: true });
    };

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
                            <CardDescription className="mt-1">Registro de mantenimiento de unidades y equipos.</CardDescription>
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
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
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
                                className="flex h-10 w-full faro-native-select border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-[200px]"
                            >
                                <option value="">Todos los estados</option>
                                {estados.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                            <Button type="submit" variant="secondary">Filtrar</Button>
                        </form>

                        <div className="faro-table-wrap">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/40 bg-muted/30">
                                        <th className="px-4 py-3 text-left font-medium">Título</th>
                                        <th className="px-4 py-3 text-left font-medium">Unidad / Producto</th>
                                        <th className="px-4 py-3 text-left font-medium">Estado</th>
                                        <th className="px-4 py-3 text-right font-medium">Costo</th>
                                        <th className="px-4 py-3 text-left font-medium">Programado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mantenimientos.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                                                No hay mantenimientos registrados.
                                            </td>
                                        </tr>
                                    ) : (
                                        mantenimientos.data.map((m) => {
                                            const estadoInfo = estados.find((e) => e.value === m.estado);
                                            return (
                                                <tr
                                                    key={m.id}
                                                    className="border-b border-border/30 hover:bg-muted/20 cursor-pointer"
                                                    onClick={() => router.visit(show.url({ mantenimiento: m.id }))}
                                                >
                                                    <td className="px-4 py-3 font-medium">{m.titulo}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {m.unidad
                                                            ? <>{m.unidad.codigo} <span className="text-xs">({m.unidad.producto?.nombre})</span></>
                                                            : m.producto?.nombre ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorMap[estadoInfo?.color ?? 'gray'] ?? colorMap.gray}`}>
                                                            {estadoInfo?.label ?? m.estado}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right tabular-nums">{fmtQ(m.costo)}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{m.fecha_programada ?? '—'}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {mantenimientos.last_page > 1 && (
                            <div className="flex flex-wrap justify-center gap-1">
                                {mantenimientos.links.map((link, i) => (
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
