import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Boxes, Package } from 'lucide-react';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { fmtFechaHora } from '@/lib/dates';
import { fmtQ } from '@/lib/utils';
import { edit, index } from '@/routes/paquetes';
import type { BreadcrumbItem } from '@/types';

interface ProductoPaquete {
    id: number;
    nombre: string;
    codigo: string;
    cantidad: string;
    stock_disponible: string;
}

interface PaqueteDetalle {
    id: number;
    nombre: string;
    codigo: string;
    descripcion: string | null;
    precio_alquiler: string;
    activo: boolean;
    stock_disponible: string;
    alquileres_count: number;
    created_at: string | null;
    updated_at: string | null;
    productos: ProductoPaquete[];
}

export default function PaquetesVer({ paquete }: { paquete: PaqueteDetalle }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Paquetes', href: index.url() },
        { title: paquete.nombre, href: undefined },
    ];

    const disp = parseInt(paquete.stock_disponible, 10) || 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={paquete.nombre} />
            <div className="faro-page">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <IconActionTooltip label="Volver al listado de paquetes">
                            <Button variant="ghost" size="icon" className="size-9 rounded-xl hover:bg-muted" asChild>
                                <Link href={index.url()}>
                                    <ArrowLeft className="size-4" />
                                </Link>
                            </Button>
                        </IconActionTooltip>
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-foreground">{paquete.nombre}</h1>
                            <p className="text-sm text-muted-foreground font-mono">{paquete.codigo}</p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={edit.url({ paquete: paquete.id })}>Editar paquete</Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <span className="faro-page-icon">
                                    <Boxes className="size-4" />
                                </span>
                                Datos del paquete
                            </CardTitle>
                            <CardDescription>Información general y precio de alquiler</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p>
                                <span className="font-medium">Estado:</span>{' '}
                                {paquete.activo ? (
                                    <span className="font-medium text-primary">Activo</span>
                                ) : (
                                    <span className="text-muted-foreground">Inactivo</span>
                                )}
                            </p>
                            <p>
                                <span className="font-medium">Precio / día:</span> {fmtQ(paquete.precio_alquiler)}
                            </p>
                            <p>
                                <span className="font-medium">Paquetes disponibles ahora:</span>{' '}
                                <span
                                    className={
                                        disp <= 0
                                            ? 'font-medium text-destructive'
                                            : 'font-medium text-primary tabular-nums'
                                    }
                                >
                                    {paquete.stock_disponible}
                                </span>
                            </p>
                            <p>
                                <span className="font-medium">Usos en alquileres:</span>{' '}
                                <span className="tabular-nums">{paquete.alquileres_count}</span>
                            </p>
                            {paquete.descripcion && (
                                <p className="pt-1">
                                    <span className="font-medium">Descripción:</span>
                                    <span className="mt-1 block whitespace-pre-wrap text-muted-foreground">
                                        {paquete.descripcion}
                                    </span>
                                </p>
                            )}
                            {paquete.created_at && (
                                <p className="text-xs text-muted-foreground pt-2">
                                    Creado: {fmtFechaHora(paquete.created_at)}
                                    {paquete.updated_at && paquete.updated_at !== paquete.created_at && (
                                        <> · Actualizado: {fmtFechaHora(paquete.updated_at)}</>
                                    )}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <span className="faro-page-icon">
                                    <Package className="size-4" />
                                </span>
                                Composición
                            </CardTitle>
                            <CardDescription>
                                {paquete.productos.length}{' '}
                                {paquete.productos.length === 1 ? 'producto incluido' : 'productos incluidos'} por
                                paquete
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {paquete.productos.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Este paquete no tiene productos.</p>
                            ) : (
                                <div className="faro-table-wrap">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border/40 bg-muted/30">
                                                <th className="px-3 py-2 text-left font-medium">Código</th>
                                                <th className="px-3 py-2 text-left font-medium">Producto</th>
                                                <th className="px-3 py-2 text-right font-medium">Cant. / paquete</th>
                                                <th className="px-3 py-2 text-right font-medium">Disp. ahora</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paquete.productos.map((p) => (
                                                <tr key={p.id} className="border-b border-border/30 last:border-0">
                                                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                                                        {p.codigo}
                                                    </td>
                                                    <td className="px-3 py-2 font-medium">{p.nombre}</td>
                                                    <td className="px-3 py-2 text-right tabular-nums">{p.cantidad}</td>
                                                    <td className="px-3 py-2 text-right tabular-nums">
                                                        <span
                                                            className={
                                                                parseInt(p.stock_disponible, 10) <= 0
                                                                    ? 'font-medium text-destructive'
                                                                    : 'font-medium text-primary'
                                                            }
                                                        >
                                                            {p.stock_disponible}
                                                        </span>
                                                    </td>
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
