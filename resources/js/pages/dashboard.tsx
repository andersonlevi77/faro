import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, CalendarClock, ClipboardList, Package, TrendingUp, Users, Wrench } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { fmtQ } from '@/lib/utils';
import { index as alquileresIndex, show as alquilerShow } from '@/routes/alquileres';
import { index as clientesIndex } from '@/routes/clientes';
import { dashboard } from '@/routes';
import { index as mantenimientosIndex, show as mantenimientoShow } from '@/routes/mantenimientos';
import { index as productosIndex } from '@/routes/productos';
import type { BreadcrumbItem } from '@/types';
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
    stats,
    proximasDevoluciones,
    atrasados,
    productosStockBajo,
    mantenimientosPendientes,
}: {
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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inicio" />
            <div className="flex h-full flex-1 flex-col gap-5 overflow-x-auto p-4 md:p-5">
                {/* Stats grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                        <CardHeader className="pb-2">
                            <CardDescription>Clientes</CardDescription>
                            <CardTitle className="flex items-center gap-2 text-2xl tabular-nums">
                                <Users className="size-5 text-primary" />
                                {stats.clientes}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" size="sm" className="w-full" asChild>
                                <Link href={clientesIndex.url()}>Ver clientes</Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card className="shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                        <CardHeader className="pb-2">
                            <CardDescription>Alquileres activos</CardDescription>
                            <CardTitle className="flex items-center gap-2 text-2xl tabular-nums">
                                <ClipboardList className="size-5 text-primary" />
                                {stats.alquileresActivos}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" size="sm" className="w-full" asChild>
                                <Link href={alquileresIndex.url()}>Ver alquileres</Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card className="shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                        <CardHeader className="pb-2">
                            <CardDescription>Ingresos este mes</CardDescription>
                            <CardTitle className="flex items-center gap-2 text-2xl tabular-nums">
                                <TrendingUp className="size-5 text-green-600" />
                                {fmtQ(stats.ingresosEseMes)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Pagos cobrados en el mes actual.</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                        <CardHeader className="pb-2">
                            <CardDescription>Saldo por cobrar</CardDescription>
                            <CardTitle className="text-2xl tabular-nums text-destructive">
                                {fmtQ(stats.saldoPendienteTotal)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Total pendiente en alquileres activos.</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Segunda fila stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                        <CardHeader className="pb-2">
                            <CardDescription>Productos activos</CardDescription>
                            <CardTitle className="flex items-center gap-2 text-2xl tabular-nums">
                                <Package className="size-5 text-primary" />
                                {stats.productosActivos}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" size="sm" className="w-full" asChild>
                                <Link href={productosIndex.url()}>Ver inventario</Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card className="shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                        <CardHeader className="pb-2">
                            <CardDescription>Alquileres este mes</CardDescription>
                            <CardTitle className="text-2xl tabular-nums">{stats.alquileresMes}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Registros creados en el mes actual.</p>
                        </CardContent>
                    </Card>
                    <Card className={`shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] ${stats.mantenimientosActivos > 0 ? 'border-yellow-300 dark:border-yellow-700' : ''}`}>
                        <CardHeader className="pb-2">
                            <CardDescription>Mantenimientos activos</CardDescription>
                            <CardTitle className="flex items-center gap-2 text-2xl tabular-nums">
                                <Wrench className={`size-5 ${stats.mantenimientosActivos > 0 ? 'text-yellow-600' : 'text-muted-foreground'}`} />
                                {stats.mantenimientosActivos}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" size="sm" className="w-full" asChild>
                                <Link href={mantenimientosIndex.url()}>Ver mantenimientos</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Próximas devoluciones */}
                    <Card className="shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
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
                                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
                                        >
                                            <span className="font-medium text-foreground">{a.codigo}</span>
                                            <span className="text-muted-foreground">{a.cliente?.nombre}</span>
                                            <span className="tabular-nums text-muted-foreground">{a.fecha_fin_prevista}</span>
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
                    <Card className="border-destructive/20 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
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
                                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2"
                                        >
                                            <span className="font-medium">{a.codigo}</span>
                                            <span className="text-muted-foreground">{a.cliente?.nombre}</span>
                                            <span className="tabular-nums">{a.fecha_fin_prevista}</span>
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
                    <Card className="shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                        <CardHeader>
                            <CardTitle className="text-base">Stock de alquiler bajo</CardTitle>
                            <CardDescription>Productos con stock al o por debajo del mínimo.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {productosStockBajo.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No hay alertas de stock.</p>
                            ) : (
                                <div className="overflow-x-auto rounded-lg bg-muted/20">
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
                    <Card className="shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
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
                                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
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
