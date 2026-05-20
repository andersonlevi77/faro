import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { create, index, store } from '@/routes/mantenimientos';
import type { BreadcrumbItem } from '@/types';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
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
}: {
    unidadInicial?: UnidadInicial | null;
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
            <div className="flex h-full flex-1 flex-col gap-5 p-4 md:p-5">
                <div className="flex items-center gap-3">
                    <IconActionTooltip label="Volver a la lista">
                        <Button variant="ghost" size="icon" className="size-9 rounded-lg hover:bg-accent" asChild>
                            <Link href={index.url()}>
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                    </IconActionTooltip>
                    <h1 className="text-xl font-semibold tracking-tight">Nuevo mantenimiento</h1>
                </div>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
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

                    {!unidadInicial && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Asociación (opcional)</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <Label htmlFor="producto_unidad_id">ID de unidad</Label>
                                    <Input
                                        id="producto_unidad_id"
                                        type="number"
                                        min="1"
                                        placeholder="ID de unidad individual"
                                        value={data.producto_unidad_id}
                                        onChange={(e) => setData('producto_unidad_id', e.target.value)}
                                    />
                                    {errors.producto_unidad_id && (
                                        <p className="text-xs text-destructive">{errors.producto_unidad_id}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="producto_id">ID de producto (si es general)</Label>
                                    <Input
                                        id="producto_id"
                                        type="number"
                                        min="1"
                                        placeholder="ID del producto"
                                        value={data.producto_id}
                                        onChange={(e) => setData('producto_id', e.target.value)}
                                    />
                                    {errors.producto_id && (
                                        <p className="text-xs text-destructive">{errors.producto_id}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Detalles</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="titulo">Título <span className="text-destructive">*</span></Label>
                                <Input
                                    id="titulo"
                                    placeholder="Ej. Revisión de estructura, limpieza general…"
                                    value={data.titulo}
                                    onChange={(e) => setData('titulo', e.target.value)}
                                />
                                {errors.titulo && <p className="text-xs text-destructive">{errors.titulo}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="descripcion">Descripción</Label>
                                <textarea
                                    id="descripcion"
                                    rows={3}
                                    placeholder="Descripción detallada del trabajo a realizar"
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={data.descripcion}
                                    onChange={(e) => setData('descripcion', e.target.value)}
                                />
                                {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion}</p>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
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
                                <div className="space-y-1">
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

                            <div className="space-y-1">
                                <Label htmlFor="notas">Notas internas</Label>
                                <textarea
                                    id="notas"
                                    rows={2}
                                    placeholder="Notas adicionales"
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={data.notas}
                                    onChange={(e) => setData('notas', e.target.value)}
                                />
                                {errors.notas && <p className="text-xs text-destructive">{errors.notas}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
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
