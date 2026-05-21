import { Head, router } from '@inertiajs/react';
import { BarChart3, Package, Wrench } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { reportes } from '@/routes';
import { fmtQ } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface MesData {
    mes: number;
    nombre: string;
    total: string;
}

interface EstadoData {
    estado: string;
    label: string;
    total: number;
}

interface TopProducto {
    producto_id: number;
    total_cantidad: string;
    veces: number;
    producto?: { id: number; nombre: string; codigo: string } | null;
}

interface Resumen {
    totalIngresos: string;
    totalMantenimiento: string;
    totalAlquileres: number;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Reportes', href: reportes.url() }];

const MAX_BAR_HEIGHT = 120;

function BarGroup({ data, label }: { data: MesData[]; label: string }) {
    const maxVal = Math.max(...data.map((d) => parseFloat(d.total)), 1);
    return (
        <div>
            <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
            <div className="flex items-end gap-1">
                {data.map((d) => {
                    const h = Math.round((parseFloat(d.total) / maxVal) * MAX_BAR_HEIGHT);
                    return (
                        <div key={d.mes} className="flex flex-1 flex-col items-center gap-1">
                            <span className="text-[9px] text-muted-foreground tabular-nums leading-none">
                                {parseFloat(d.total) > 0 ? fmtQ(d.total) : ''}
                            </span>
                            <div
                                className="w-full rounded-t bg-primary/70 hover:bg-primary transition-colors"
                                style={{ height: `${Math.max(h, 2)}px` }}
                                title={`${d.nombre}: ${fmtQ(d.total)}`}
                            />
                            <span className="text-[9px] text-muted-foreground">{d.nombre}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function Reportes({
    anio,
    anioActual,
    ingresosPorMes,
    alquileresPorEstado,
    topProductos,
    mantenimientoPorMes,
    resumen,
}: {
    anio: number;
    anioActual: number;
    ingresosPorMes: MesData[];
    alquileresPorEstado: EstadoData[];
    topProductos: TopProducto[];
    mantenimientoPorMes: MesData[];
    resumen: Resumen;
}) {
    const cambiarAnio = (delta: number) => {
        router.get(reportes.url({ query: { anio: anio + delta } }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reportes" />
            <div className="faro-page">
                {/* Selector año */}
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-semibold tracking-tight">Reportes {anio}</h1>
                    <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => cambiarAnio(-1)}>← {anio - 1}</Button>
                        {anio !== anioActual && (
                            <Button variant="outline" size="sm" onClick={() => router.get(reportes.url())}>Hoy</Button>
                        )}
                        {anio < anioActual && (
                            <Button variant="outline" size="sm" onClick={() => cambiarAnio(1)}>{anio + 1} →</Button>
                        )}
                    </div>
                </div>

                {/* Resumen cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Ingresos cobrados</CardDescription>
                            <CardTitle className="text-2xl tabular-nums text-green-700 dark:text-green-400">
                                {fmtQ(resumen.totalIngresos)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Total de pagos recibidos en {anio}.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Costo de mantenimiento</CardDescription>
                            <CardTitle className="flex items-center gap-2 text-2xl tabular-nums">
                                <Wrench className="size-5 text-yellow-600" />
                                {fmtQ(resumen.totalMantenimiento)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Suma de mantenimientos completados en {anio}.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Alquileres creados</CardDescription>
                            <CardTitle className="flex items-center gap-2 text-2xl tabular-nums">
                                <BarChart3 className="size-5 text-primary" />
                                {resumen.totalAlquileres}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Contratos registrados en {anio}.</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Gráficos de barras */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Ingresos mensuales</CardTitle>
                            <CardDescription>Pagos cobrados por mes en {anio}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BarGroup data={ingresosPorMes} label="Ingresos" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Costos de mantenimiento mensuales</CardTitle>
                            <CardDescription>Gastos en mantenimiento completado por mes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BarGroup data={mantenimientoPorMes} label="Mantenimiento" />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Alquileres por estado */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Alquileres por estado</CardTitle>
                            <CardDescription>Distribución de contratos creados en {anio}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {alquileresPorEstado.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Sin datos para el período.</p>
                            ) : (
                                <div className="space-y-2">
                                    {alquileresPorEstado.map((e) => {
                                        const maxE = Math.max(...alquileresPorEstado.map((x) => x.total), 1);
                                        const pct = Math.round((e.total / maxE) * 100);
                                        return (
                                            <div key={e.estado} className="space-y-1">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="capitalize">{e.label}</span>
                                                    <span className="tabular-nums font-medium">{e.total}</span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                                    <div className="h-full rounded-full bg-primary/60" style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top productos */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Package className="size-4 text-primary" />
                                Top productos alquilados
                            </CardTitle>
                            <CardDescription>Ordenado por unidades totales en {anio}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topProductos.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Sin datos para el período.</p>
                            ) : (
                                <div className="faro-table-wrap">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border/40 bg-muted/30">
                                                <th className="px-4 py-2 text-left font-medium">#</th>
                                                <th className="px-4 py-2 text-left font-medium">Producto</th>
                                                <th className="px-4 py-2 text-right font-medium">Cant. total</th>
                                                <th className="px-4 py-2 text-right font-medium">Veces</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topProductos.map((p, i) => (
                                                <tr key={p.producto_id} className="border-b border-border/30">
                                                    <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                                                    <td className="px-4 py-2">
                                                        <p className="font-medium">{p.producto?.nombre ?? '—'}</p>
                                                        <p className="text-xs text-muted-foreground">{p.producto?.codigo}</p>
                                                    </td>
                                                    <td className="px-4 py-2 text-right tabular-nums font-medium">{p.total_cantidad}</td>
                                                    <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{p.veces}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
