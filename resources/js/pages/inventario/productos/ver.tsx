import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Layers, Package } from 'lucide-react';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { fmtQ } from '@/lib/utils';
import { edit, index } from '@/routes/productos';
import { index as unidadesIndex } from '@/routes/productos/unidades';
import type { BreadcrumbItem } from '@/types';

interface Lote {
    id: number;
    numero_lote: string;
    fecha_vencimiento: string;
    cantidad: string;
    cantidad_inicial: string;
}

interface Unidad {
    id: number;
    codigo: string;
    estado: string;
    notas: string | null;
}

interface EstadoOption {
    value: string;
    label: string;
    color: string;
}

interface Producto {
    id: number;
    nombre: string;
    codigo: string;
    descripcion: string | null;
    codigo_barras: string | null;
    precio_compra: string;
    precio_venta: string;
    stock_minimo: number;
    stock_maximo: number | null;
    activo: boolean;
    es_alquilable: boolean;
    tracking_mode: string;
    stock_alquiler: string;
    precio_alquiler_diario: string | null;
    deposito_unitario: string | null;
    categoria?: { id: number; nombre: string } | null;
    marca?: { id: number; nombre: string } | null;
    presentacion?: { id: number; nombre: string } | null;
    lotes?: Lote[];
}

const colorMap: Record<string, string> = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export default function ProductosVer({
    producto,
    unidades = [],
    estadosUnidad = [],
}: {
    producto: Producto;
    unidades: Unidad[];
    estadosUnidad: EstadoOption[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inventario', href: index.url() },
        { title: 'Productos', href: index.url() },
        { title: producto.nombre, href: undefined },
    ];

    const disponibles = unidades.filter((u) => u.estado === 'disponible').length;
    const alquiladas = unidades.filter((u) => u.estado === 'alquilado').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={producto.nombre} />
            <div className="flex h-full flex-1 flex-col gap-5 p-4 md:p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <IconActionTooltip label="Volver al listado de productos">
                            <Button variant="ghost" size="icon" className="size-9 rounded-lg hover:bg-accent" asChild>
                                <Link href={index.url()}>
                                    <ArrowLeft className="size-4" />
                                </Link>
                            </Button>
                        </IconActionTooltip>
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">{producto.nombre}</h1>
                    </div>
                    <div className="flex gap-2">
                        {producto.tracking_mode === 'individual' && (
                            <Button variant="outline" asChild>
                                <Link href={unidadesIndex.url({ producto: producto.id })}>
                                    <Layers className="mr-1.5 size-4" />
                                    Gestionar unidades
                                </Link>
                            </Button>
                        )}
                        <Button asChild>
                            <Link href={edit.url({ producto: producto.id })}>Editar</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Package className="size-4" />
                                </span>
                                Datos del producto
                            </CardTitle>
                            <CardDescription>Código: {producto.codigo}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p><span className="font-medium">Categoría:</span> {producto.categoria?.nombre ?? '—'}</p>
                            <p><span className="font-medium">Marca:</span> {producto.marca?.nombre ?? '—'}</p>
                            <p><span className="font-medium">Presentación:</span> {producto.presentacion?.nombre ?? '—'}</p>
                            <p><span className="font-medium">Precio compra:</span> {producto.precio_compra}</p>
                            <p><span className="font-medium">Precio venta:</span> {producto.precio_venta}</p>
                            <p><span className="font-medium">Estado:</span> {producto.activo ? 'Activo' : 'Inactivo'}</p>
                            {producto.descripcion && (
                                <p><span className="font-medium">Descripción:</span> {producto.descripcion}</p>
                            )}
                        </CardContent>
                    </Card>

                    {producto.es_alquilable && (
                        <Card className="shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-foreground">
                                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Layers className="size-4" />
                                    </span>
                                    Alquiler
                                </CardTitle>
                                <CardDescription>
                                    {producto.tracking_mode === 'individual' ? 'Seguimiento por unidad individual' : 'Seguimiento por cantidad'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p><span className="font-medium">Precio / día:</span> {producto.precio_alquiler_diario ? fmtQ(producto.precio_alquiler_diario) : '—'}</p>
                                <p><span className="font-medium">Depósito / garantía:</span> {producto.deposito_unitario ? fmtQ(producto.deposito_unitario) : '—'}</p>

                                {producto.tracking_mode === 'individual' ? (
                                    <div className="mt-3 space-y-1.5 rounded-lg border border-border/60 bg-muted/20 p-3">
                                        <p className="font-medium">Estado del inventario</p>
                                        <p>Total de unidades: <strong>{unidades.length}</strong></p>
                                        <p>Disponibles: <strong className="text-green-700 dark:text-green-400">{disponibles}</strong></p>
                                        <p>Alquiladas: <strong className="text-blue-700 dark:text-blue-400">{alquiladas}</strong></p>
                                        {unidades.filter((u) => !['disponible', 'alquilado', 'reservado'].includes(u.estado)).length > 0 && (
                                            <p>Fuera de servicio: <strong className="text-orange-700 dark:text-orange-400">
                                                {unidades.filter((u) => !['disponible', 'alquilado', 'reservado'].includes(u.estado)).length}
                                            </strong></p>
                                        )}
                                    </div>
                                ) : (
                                    <p><span className="font-medium">Stock alquiler:</span> {producto.stock_alquiler}</p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {!producto.es_alquilable && (
                        <Card className="shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-foreground">
                                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Calendar className="size-4" />
                                    </span>
                                    Lotes y vencimientos
                                </CardTitle>
                                <CardDescription>Control por lote y fecha de vencimiento</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {producto.lotes && producto.lotes.length > 0 ? (
                                    <div className="space-y-2">
                                        {producto.lotes.map((lote) => (
                                            <div key={lote.id} className="flex justify-between rounded border px-3 py-2 text-sm">
                                                <span className="font-mono">{lote.numero_lote}</span>
                                                <span>Vence: {lote.fecha_vencimiento}</span>
                                                <span>Cantidad: {lote.cantidad}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No hay lotes registrados.</p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
