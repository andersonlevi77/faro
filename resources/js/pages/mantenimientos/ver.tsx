import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { index, show, update } from '@/routes/mantenimientos';
import { show as showProducto } from '@/routes/productos';
import type { BreadcrumbItem } from '@/types';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fmtFecha, fmtFechaHora } from '@/lib/dates';
import { fmtQ } from '@/lib/utils';

interface Mantenimiento {
    id: number;
    titulo: string;
    descripcion: string | null;
    costo: string;
    estado: string;
    notas: string | null;
    fecha_programada: string | null;
    fecha_inicio_at: string | null;
    fecha_fin_at: string | null;
    created_at: string;
    unidad?: {
        id: number;
        codigo: string;
        producto?: { id: number; nombre: string } | null;
    } | null;
    producto?: { id: number; nombre: string } | null;
    creado_por?: { name: string } | null;
    resuelto_por?: { name: string } | null;
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

export default function MantenimientosVer({
    mantenimiento,
    estados,
}: {
    mantenimiento: Mantenimiento;
    estados: EstadoOpcion[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mantenimientos', href: index.url() },
        { title: mantenimiento.titulo, href: show.url({ mantenimiento: mantenimiento.id }) },
    ];

    const estadoInfo = estados.find((e) => e.value === mantenimiento.estado);

    const { data, setData, put, processing, errors } = useForm({
        estado: mantenimiento.estado,
        costo: mantenimiento.costo,
        notas: mantenimiento.notas ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(update.url({ mantenimiento: mantenimiento.id }));
    };

    const isCompleted = mantenimiento.estado === 'completado';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={mantenimiento.titulo} />
            <div className="faro-page">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <IconActionTooltip label="Volver a la lista">
                            <Button variant="ghost" size="icon" className="size-9 rounded-xl hover:bg-muted" asChild>
                                <Link href={index.url()}>
                                    <ArrowLeft className="size-4" />
                                </Link>
                            </Button>
                        </IconActionTooltip>
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight">{mantenimiento.titulo}</h1>
                            <div className="mt-1 flex items-center gap-2">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorMap[estadoInfo?.color ?? 'gray'] ?? colorMap.gray}`}>
                                    {estadoInfo?.label ?? mantenimiento.estado}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid w-full gap-4 xl:grid-cols-3">
                    <Card className="xl:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">Información</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {mantenimiento.unidad && (
                                <div>
                                    <p className="text-muted-foreground">Unidad</p>
                                    <p className="font-medium">
                                        {mantenimiento.unidad.codigo}
                                        {mantenimiento.unidad.producto && (
                                            <span className="ml-1 text-muted-foreground">
                                                — <Link
                                                    href={showProducto.url({ producto: mantenimiento.unidad.producto.id })}
                                                    className="hover:underline"
                                                >
                                                    {mantenimiento.unidad.producto.nombre}
                                                </Link>
                                            </span>
                                        )}
                                    </p>
                                </div>
                            )}
                            {mantenimiento.producto && !mantenimiento.unidad && (
                                <div>
                                    <p className="text-muted-foreground">Producto</p>
                                    <p className="font-medium">
                                        <Link
                                            href={showProducto.url({ producto: mantenimiento.producto.id })}
                                            className="hover:underline"
                                        >
                                            {mantenimiento.producto.nombre}
                                        </Link>
                                    </p>
                                </div>
                            )}
                            {mantenimiento.descripcion && (
                                <div>
                                    <p className="text-muted-foreground">Descripción</p>
                                    <p className="whitespace-pre-wrap">{mantenimiento.descripcion}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-muted-foreground">Costo registrado</p>
                                    <p className="font-medium tabular-nums">{fmtQ(mantenimiento.costo)}</p>
                                </div>
                                {mantenimiento.fecha_programada && (
                                    <div>
                                        <p className="text-muted-foreground">Fecha programada</p>
                                        <p>{fmtFecha(mantenimiento.fecha_programada)}</p>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {mantenimiento.fecha_inicio_at && (
                                    <div>
                                        <p className="text-muted-foreground">Inicio</p>
                                        <p>{fmtFechaHora(mantenimiento.fecha_inicio_at)}</p>
                                    </div>
                                )}
                                {mantenimiento.fecha_fin_at && (
                                    <div>
                                        <p className="text-muted-foreground">Fin</p>
                                        <p>{fmtFechaHora(mantenimiento.fecha_fin_at)}</p>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {mantenimiento.creado_por && (
                                    <div>
                                        <p className="text-muted-foreground">Creado por</p>
                                        <p>{mantenimiento.creado_por.name}</p>
                                    </div>
                                )}
                                {mantenimiento.resuelto_por && (
                                    <div>
                                        <p className="text-muted-foreground">Resuelto por</p>
                                        <p>{mantenimiento.resuelto_por.name}</p>
                                    </div>
                                )}
                            </div>
                            {mantenimiento.notas && !isCompleted && (
                                <div>
                                    <p className="text-muted-foreground">Notas</p>
                                    <p className="whitespace-pre-wrap">{mantenimiento.notas}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actualizar estado */}
                    {!isCompleted && (
                        <Card className="xl:col-span-1">
                            <CardHeader>
                                <CardTitle className="text-base">Actualizar</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="faro-form-grid sm:grid-cols-2">
                                        <div className="faro-field sm:col-span-2">
                                            <Label htmlFor="estado">Estado</Label>
                                            <Select value={data.estado} onValueChange={(v) => setData('estado', v)}>
                                                <SelectTrigger id="estado" className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {estados.map((e) => (
                                                        <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.estado && <p className="text-xs text-destructive">{errors.estado}</p>}
                                        </div>
                                        <div className="faro-field">
                                            <Label htmlFor="costo">Costo final</Label>
                                            <Input
                                                id="costo"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                                value={data.costo}
                                                onChange={(e) => setData('costo', e.target.value)}
                                            />
                                            {errors.costo && <p className="text-xs text-destructive">{errors.costo}</p>}
                                        </div>
                                        <div className="faro-field sm:col-span-2">
                                            <Label htmlFor="notas">Notas</Label>
                                            <textarea
                                                id="notas"
                                                rows={3}
                                                placeholder="Observaciones o resultados"
                                                className="faro-textarea"
                                                value={data.notas}
                                                onChange={(e) => setData('notas', e.target.value)}
                                            />
                                            {errors.notas && <p className="text-xs text-destructive">{errors.notas}</p>}
                                        </div>
                                    </div>
                                    <div className="faro-form-actions">
                                        <Button type="submit" variant="success" disabled={processing} className="faro-btn-primary">
                                            {processing ? 'Guardando…' : 'Guardar cambios'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {isCompleted && mantenimiento.notas && (
                        <Card className="xl:col-span-1">
                            <CardHeader>
                                <CardTitle className="text-base">Notas finales</CardTitle>
                            </CardHeader>
                            <CardContent className="whitespace-pre-wrap text-sm">{mantenimiento.notas}</CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
