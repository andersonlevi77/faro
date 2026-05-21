import { Head, Link, usePage } from '@inertiajs/react';
import { AlertTriangle, CalendarClock, ClipboardList, Package, TrendingUp, Users, Wrench } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { fmtFecha } from '@/lib/dates';
import { fmtQ } from '@/lib/utils';
import { index as alquileresIndex, show as alquilerShow } from '@/routes/alquileres';
import { index as clientesIndex } from '@/routes/clientes';
import { dashboard } from '@/routes';
import { index as mantenimientosIndex, show as mantenimientoShow } from '@/routes/mantenimientos';
import { index as productosIndex } from '@/routes/productos';
import type { BreadcrumbItem } from '@/types';
import { StatKpiCard } from '@/components/stat-kpi-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
interface AlquilerResumen {
    id: number;
    codigo: string;
    estado: string;
    fecha_fin_prevista: string;
    total: string;
    cliente?: { id: number; nombre: string } | null;
}

interface ProductoStock {
    id: number;
    nombre: string;
    codigo: string;
    stock_alquiler: string;
    stock_minimo: number;
}

interface MantenimientoResumen {
    id: number;
    titulo: string;
    estado: string;
    fecha_programada: string | null;
    unidad?: { codigo: string; producto?: { nombre: string } | null } | null;
    producto?: { nombre: string } | null;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Inicio', href: dashboard() }];

export default function Dashboard({
    saludo,
    stats,
    proximasDevoluciones,
    atrasados,
    productosStockBajo,
    mantenimientosPendientes,
}: {
    saludo: string;
    stats: {
        clientes: number;
        productosActivos: number;
        alquileresActivos: number;
        alquileresMes: number;
        ingresosEseMes: string;
        saldoPendienteTotal: string;
        mantenimientosActivos: number;
    };
    proximasDevoluciones: AlquilerResumen[];
    atrasados: AlquilerResumen[];
    productosStockBajo: ProductoStock[];
    mantenimientosPendientes: MantenimientoResumen[];
}) {
    const { auth } = usePage().props as { auth: { user?: { name: string } } };
    const firstName = auth.user?.name?.split(' ')[0] ?? 'Usuario';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inicio" />
            <div className="faro-page">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-primary md:text-3xl">
                        {saludo}, {firstName}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Resumen de tu operación de alquileres.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatKpiCard label="Clientes" value={stats.clientes} icon={Users} hint="Registrados en el sistema" />
                    <StatKpiCard label="Alquileres activos" value={stats.alquileresActivos} icon={ClipboardList} hint="Contratos en curso" />
                    <StatKpiCard label="Ingresos del mes" value={fmtQ(stats.ingresosEseMes)} icon={TrendingUp} iconClassName="text-success" iconBgClassName="bg-success/10" hint="Pagos cobrados este mes" />
                    <StatKpiCard label="Saldo por cobrar" value={fmtQ(stats.saldoPendienteTotal)} icon={AlertTriangle} iconClassName="text-destructive" iconBgClassName="bg-destructive/10" valueClassName="text-destructive" hint="Pendiente en activos" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <StatKpiCard label="Productos activos" value={stats.productosActivos} icon={Package} iconBgClassName="bg-chart-3/15" iconClassName="text-chart-3" />
                    <StatKpiCard label="Alquileres del mes" value={stats.alquileresMes} icon={ClipboardList} hint="Creados este mes" />
                    <StatKpiCard label="Mantenimientos" value={stats.mantenimientosActivos} icon={Wrench} iconClassName={stats.mantenimientosActivos > 0 ? 'text-orange' : 'text-muted-foreground'} iconBgClassName={stats.mantenimientosActivos > 0 ? 'bg-orange/10' : 'bg-muted'} hint={stats.mantenimientosActivos > 0 ? 'Requieren atención' : 'Sin pendientes'} />
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="rounded-full" asChild><Link href={clientesIndex.url()}>Ver clientes</Link></Button>
                    <Button variant="outline" size="sm" className="rounded-full" asChild><Link href={alquileresIndex.url()}>Ver alquileres</Link></Button>
                    <Button variant="outline" size="sm" className="rounded-full" asChild><Link href={productosIndex.url()}>Ver inventario</Link></Button>
                    <Button variant="outline" size="sm" className="rounded-full" asChild><Link href={mantenimientosIndex.url()}>Ver mantenimientos</Link></Button>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Próximas devoluciones */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CalendarClock className="size-4 text-primary" />
                                Próximas devoluciones (7 días)
                            </CardTitle>
                            <CardDescription>Contratos activos con fin previsto cercano.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {proximasDevoluciones.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No hay devoluciones en la ventana.</p>
                            ) : (
                                <ul className="space-y-2 text-sm">
                                    {proximasDevoluciones.map((a) => (
                                        <li
                                            key={a.id}
                                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/50 bg-card px-4 py-3 shadow-sm"
                                        >
                                            <span className="font-medium text-foreground">{a.codigo}</span>
                                            <span className="text-muted-foreground">{a.cliente?.nombre}</span>
                                            <span className="tabular-nums text-muted-foreground">{fmtFecha(a.fecha_fin_prevista)}</span>
                                            <Link
                                                href={alquilerShow.url({ alquiler: a.id })}
                                                className="text-xs text-primary underline-offset-4 hover:underline"
                                            >
                                                Ver
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    {/* Atrasados */}
                    <Card className="border border-destructive/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base text-destructive">
                                <AlertTriangle className="size-4" />
                                Atrasados
                            </CardTitle>
                            <CardDescription>Activos con fecha de fin ya superada.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {atrasados.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Sin atrasos registrados.</p>
                            ) : (
                                <ul className="space-y-2 text-sm">
                                    {atrasados.map((a) => (
                                        <li
                                            key={a.id}
                                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3"
                                        >
                                            <span className="font-medium">{a.codigo}</span>
                                            <span className="text-muted-foreground">{a.cliente?.nombre}</span>
                                            <span className="tabular-nums">{fmtFecha(a.fecha_fin_prevista)}</span>
                                            <Link
                                                href={alquilerShow.url({ alquiler: a.id })}
                                                className="text-xs text-primary underline-offset-4 hover:underline"
                                            >
                                                Ver
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Stock bajo */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Stock de alquiler bajo</CardTitle>
                            <CardDescription>Productos con stock al o por debajo del mínimo.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {productosStockBajo.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No hay alertas de stock.</p>
                            ) : (
                                <div className="overflow-x-auto rounded-xl bg-muted/30">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border/40 bg-muted/30">
                                                <th className="px-4 py-2 text-left font-medium">Código</th>
                                                <th className="px-4 py-2 text-left font-medium">Nombre</th>
                                                <th className="px-4 py-2 text-right font-medium">Stock</th>
                                                <th className="px-4 py-2 text-right font-medium">Mín.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productosStockBajo.map((p) => (
                                                <tr key={p.id} className="border-b border-border/30">
                                                    <td className="px-4 py-2 font-mono text-xs">{p.codigo}</td>
                                                    <td className="px-4 py-2">{p.nombre}</td>
                                                    <td className="px-4 py-2 text-right tabular-nums text-destructive font-medium">{p.stock_alquiler}</td>
                                                    <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{p.stock_minimo}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Mantenimientos activos */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Wrench className="size-4 text-yellow-600" />
                                Mantenimientos en curso
                            </CardTitle>
                            <CardDescription>Pendientes y en proceso.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {mantenimientosPendientes.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No hay mantenimientos activos.</p>
                            ) : (
                                <ul className="space-y-2 text-sm">
                                    {mantenimientosPendientes.map((m) => (
                                        <li
                                            key={m.id}
                                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/50 bg-card px-4 py-3 shadow-sm"
                                        >
                                            <span className="font-medium">{m.titulo}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {m.unidad
                                                    ? `${m.unidad.codigo} — ${m.unidad.producto?.nombre ?? ''}`
                                                    : (m.producto?.nombre ?? '—')}
                                            </span>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${m.estado === 'en_proceso' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                                                {m.estado === 'en_proceso' ? 'En proceso' : 'Pendiente'}
                                            </span>
                                            <Link
                                                href={mantenimientoShow.url({ mantenimiento: m.id })}
                                                className="text-xs text-primary underline-offset-4 hover:underline"
                                            >
                                                Ver
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
