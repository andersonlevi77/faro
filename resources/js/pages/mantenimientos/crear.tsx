import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { create, index, store } from '@/routes/mantenimientos';
import type { BreadcrumbItem } from '@/types';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import {
    MantenimientoAsociacionFields,
    type ProductoOption,
    type UnidadOption,
} from '@/components/mantenimiento-asociacion-fields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UnidadInicial {
    id: number;
    codigo: string;
    producto?: { id: number; nombre: string } | null;
}

export default function MantenimientosCrear({
    unidadInicial,
    productos,
    unidades,
}: {
    unidadInicial?: UnidadInicial | null;
    productos: ProductoOption[];
    unidades: UnidadOption[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mantenimientos', href: index.url() },
        { title: 'Nuevo', href: create.url() },
    ];

    const { data, setData, post, processing, errors } = useForm({
        producto_unidad_id: unidadInicial?.id?.toString() ?? '',
        producto_id: '',
        titulo: '',
        descripcion: '',
        costo: '',
        fecha_programada: '',
        notas: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo mantenimiento" />
            <div className="faro-page">
                <div className="flex items-center gap-3">
                    <IconActionTooltip label="Volver a la lista">
                        <Button variant="ghost" size="icon" className="size-9 rounded-xl hover:bg-muted" asChild>
                            <Link href={index.url()}>
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                    </IconActionTooltip>
                    <h1 className="text-xl font-semibold tracking-tight">Nuevo mantenimiento</h1>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    {unidadInicial && (
                        <Card className="border-primary/20 bg-primary/5">
                            <CardContent className="py-3 text-sm">
                                <span className="text-muted-foreground">Unidad: </span>
                                <span className="font-medium">{unidadInicial.codigo}</span>
                                {unidadInicial.producto && (
                                    <span className="text-muted-foreground"> — {unidadInicial.producto.nombre}</span>
                                )}
                                <input type="hidden" name="producto_unidad_id" value={unidadInicial.id} />
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid w-full gap-4 lg:grid-cols-12">
                    {!unidadInicial && (
                        <Card className="lg:col-span-4">
                            <CardHeader>
                                <CardTitle className="text-base">Equipo (opcional)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <MantenimientoAsociacionFields
                                    productoUnidadId={data.producto_unidad_id}
                                    productoId={data.producto_id}
                                    onProductoUnidadIdChange={(value) => setData('producto_unidad_id', value)}
                                    onProductoIdChange={(value) => setData('producto_id', value)}
                                    productos={productos}
                                    unidades={unidades}
                                    errors={{
                                        producto_unidad_id: errors.producto_unidad_id,
                                        producto_id: errors.producto_id,
                                    }}
                                />
                            </CardContent>
                        </Card>
                    )}

                    <Card className={unidadInicial ? 'lg:col-span-12' : 'lg:col-span-8'}>
                        <CardHeader>
                            <CardTitle className="text-base">Detalles</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="faro-field">
                                <Label htmlFor="titulo">Título <span className="text-destructive">*</span></Label>
                                <Input
                                    id="titulo"
                                    placeholder="Ej. Revisión de estructura, limpieza general…"
                                    value={data.titulo}
                                    onChange={(e) => setData('titulo', e.target.value)}
                                />
                                {errors.titulo && <p className="text-xs text-destructive">{errors.titulo}</p>}
                            </div>

                            <div className="faro-field">
                                <Label htmlFor="descripcion">Descripción</Label>
                                <textarea
                                    id="descripcion"
                                    rows={3}
                                    placeholder="Descripción detallada del trabajo a realizar"
                                    className="faro-textarea w-full border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={data.descripcion}
                                    onChange={(e) => setData('descripcion', e.target.value)}
                                />
                                {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion}</p>}
                            </div>

                            <div className="faro-form-grid sm:grid-cols-2">
                                <div className="faro-field">
                                    <Label htmlFor="costo">Costo estimado</Label>
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
                                <div className="faro-field">
                                    <Label htmlFor="fecha_programada">Fecha programada</Label>
                                    <Input
                                        id="fecha_programada"
                                        type="date"
                                        value={data.fecha_programada}
                                        onChange={(e) => setData('fecha_programada', e.target.value)}
                                    />
                                    {errors.fecha_programada && <p className="text-xs text-destructive">{errors.fecha_programada}</p>}
                                </div>
                            </div>

                            <div className="faro-field">
                                <Label htmlFor="notas">Notas internas</Label>
                                <textarea
                                    id="notas"
                                    rows={2}
                                    placeholder="Notas adicionales"
                                    className="faro-textarea w-full border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={data.notas}
                                    onChange={(e) => setData('notas', e.target.value)}
                                />
                                {errors.notas && <p className="text-xs text-destructive">{errors.notas}</p>}
                            </div>
                        </CardContent>
                    </Card>
                    </div>

                    <div className="faro-form-actions">
                        <Button type="submit" variant="success" disabled={processing} className="faro-btn-primary">
                            {processing ? 'Guardando…' : 'Crear mantenimiento'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={index.url()}>Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
