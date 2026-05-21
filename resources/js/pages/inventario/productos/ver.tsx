import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Layers, Package } from 'lucide-react';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { fmtQ } from '@/lib/utils';
import { edit, index } from '@/routes/productos';
import { index as unidadesIndex } from '@/routes/productos/unidades';
import type { BreadcrumbItem } from '@/types';

interface Unidad {
    id: number;
    codigo: string;
    estado: string;
    notas: string | null;
}

interface Producto {
    id: number;
    nombre: string;
    codigo: string;
    descripcion: string | null;
    stock_minimo: number;
    activo: boolean;
    es_alquilable: boolean;
    tracking_mode: string;
    stock_alquiler: string;
    precio_alquiler_diario: string | null;
    deposito_unitario: string | null;
    categoria?: { id: number; nombre: string } | null;
    marca?: { id: number; nombre: string } | null;
    presentacion?: { id: number; nombre: string } | null;
}

export default function ProductosVer({
    producto,
    unidades = [],
}: {
    producto: Producto;
    unidades: Unidad[];
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
            <div className="faro-page">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <IconActionTooltip label="Volver al listado de productos">
                            <Button variant="ghost" size="icon" className="size-9 rounded-xl hover:bg-muted" asChild>
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
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <span className="faro-page-icon">
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
                            <p><span className="font-medium">Estado:</span> {producto.activo ? 'Activo' : 'Inactivo'}</p>
                            <p><span className="font-medium">Para alquiler:</span> {producto.es_alquilable ? 'Sí' : 'No'}</p>
                            {producto.descripcion && (
                                <p><span className="font-medium">Descripción:</span> {producto.descripcion}</p>
                            )}
                        </CardContent>
                    </Card>

                    {producto.es_alquilable && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-foreground">
                                    <span className="faro-page-icon">
                                        <Layers className="size-4" />
                                    </span>
                                    Alquiler
                                </CardTitle>
                                <CardDescription>
                                    {producto.tracking_mode === 'individual'
                                        ? 'Seguimiento por unidad individual'
                                        : 'Seguimiento por cantidad'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p>
                                    <span className="font-medium">Precio / día:</span>{' '}
                                    {producto.precio_alquiler_diario ? fmtQ(producto.precio_alquiler_diario) : '—'}
                                </p>
                                <p>
                                    <span className="font-medium">Depósito / garantía:</span>{' '}
                                    {producto.deposito_unitario ? fmtQ(producto.deposito_unitario) : '—'}
                                </p>

                                {producto.tracking_mode === 'individual' ? (
                                    <div className="mt-3 space-y-1.5 rounded-lg border border-border/60 bg-muted/20 p-3">
                                        <p className="font-medium">Estado del inventario</p>
                                        <p>Total de unidades: <strong>{unidades.length}</strong></p>
                                        <p>Disponibles: <strong className="text-green-700 dark:text-green-400">{disponibles}</strong></p>
                                        <p>Alquiladas: <strong className="text-blue-700 dark:text-blue-400">{alquiladas}</strong></p>
                                        {unidades.filter((u) => !['disponible', 'alquilado', 'reservado'].includes(u.estado)).length > 0 && (
                                            <p>
                                                Fuera de servicio:{' '}
                                                <strong className="text-orange-700 dark:text-orange-400">
                                                    {unidades.filter((u) => !['disponible', 'alquilado', 'reservado'].includes(u.estado)).length}
                                                </strong>
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <p><span className="font-medium">Stock alquiler:</span> {producto.stock_alquiler}</p>
                                        {producto.stock_minimo > 0 && (
                                            <p><span className="font-medium">Alerta de stock bajo:</span> {producto.stock_minimo} o menos</p>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
