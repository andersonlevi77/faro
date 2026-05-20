import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { create, index, store } from '@/routes/productos';
import type { BreadcrumbItem } from '@/types';

interface Option {
    id: number;
    nombre: string;
}

interface TrackingModeOption {
    value: string;
    label: string;
}

export default function ProductosCrear({
    categorias,
    marcas,
    presentaciones,
    trackingModes,
}: {
    categorias: Option[];
    marcas: Option[];
    presentaciones: Option[];
    trackingModes: TrackingModeOption[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inventario', href: index.url() },
        { title: 'Productos', href: index.url() },
        { title: 'Nuevo producto', href: create.url() },
    ];

    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        codigo: '',
        descripcion: '',
        codigo_barras: '',
        marca_id: '' as number | '',
        categoria_id: '' as number | '',
        presentacion_id: '' as number | '',
        precio_compra: '',
        precio_venta: '',
        stock_minimo: '',
        stock_maximo: '',
        activo: true,
        es_alquilable: false,
        tracking_mode: 'bulk',
        stock_alquiler: '',
        precio_alquiler_diario: '',
        deposito_unitario: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo producto" />
            <div className="flex h-full flex-1 flex-col gap-5 p-4 md:p-5">
                <div className="flex items-center gap-3">
                    <IconActionTooltip label="Volver al listado de productos">
                        <Button variant="ghost" size="icon" className="size-9 rounded-lg hover:bg-accent" asChild>
                            <Link href={index.url()}>
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                    </IconActionTooltip>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">Nuevo producto</h1>
                </div>
                <form onSubmit={handleSubmit} className="w-full space-y-6 rounded-xl bg-card p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre *</Label>
                            <Input
                                id="nombre"
                                value={data.nombre}
                                onChange={(e) => setData('nombre', e.target.value)}
                                required
                            />
                            <InputError message={errors.nombre} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="codigo">Código *</Label>
                            <Input
                                id="codigo"
                                value={data.codigo}
                                onChange={(e) => setData('codigo', e.target.value)}
                                required
                            />
                            <InputError message={errors.codigo} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Input
                            id="descripcion"
                            value={data.descripcion}
                            onChange={(e) => setData('descripcion', e.target.value)}
                        />
                        <InputError message={errors.descripcion} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="codigo_barras">Código de barras</Label>
                        <Input
                            id="codigo_barras"
                            value={data.codigo_barras}
                            onChange={(e) => setData('codigo_barras', e.target.value)}
                        />
                        <InputError message={errors.codigo_barras} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Categoría</Label>
                            <Select
                                value={data.categoria_id ? String(data.categoria_id) : ''}
                                onValueChange={(v) => setData('categoria_id', v ? Number(v) : '')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categorias.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.categoria_id} />
                        </div>
                        <div className="space-y-2">
                            <Label>Marca</Label>
                            <Select
                                value={data.marca_id ? String(data.marca_id) : ''}
                                onValueChange={(v) => setData('marca_id', v ? Number(v) : '')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {marcas.map((m) => (
                                        <SelectItem key={m.id} value={String(m.id)}>
                                            {m.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.marca_id} />
                        </div>
                        <div className="space-y-2">
                            <Label>Presentación</Label>
                            <Select
                                value={data.presentacion_id ? String(data.presentacion_id) : ''}
                                onValueChange={(v) => setData('presentacion_id', v ? Number(v) : '')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {presentaciones.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.presentacion_id} />
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="precio_compra">Precio de compra *</Label>
                            <Input
                                id="precio_compra"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.precio_compra}
                                onChange={(e) => setData('precio_compra', e.target.value)}
                                required
                            />
                            <InputError message={errors.precio_compra} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="precio_venta">Precio de venta *</Label>
                            <Input
                                id="precio_venta"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.precio_venta}
                                onChange={(e) => setData('precio_venta', e.target.value)}
                                required
                            />
                            <InputError message={errors.precio_venta} />
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="stock_minimo">Stock mínimo</Label>
                            <Input
                                id="stock_minimo"
                                type="number"
                                min="0"
                                value={data.stock_minimo}
                                onChange={(e) => setData('stock_minimo', e.target.value)}
                            />
                            <InputError message={errors.stock_minimo} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock_maximo">Stock máximo</Label>
                            <Input
                                id="stock_maximo"
                                type="number"
                                min="0"
                                value={data.stock_maximo}
                                onChange={(e) => setData('stock_maximo', e.target.value)}
                            />
                            <InputError message={errors.stock_maximo} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="activo"
                            checked={data.activo}
                            onChange={(e) => setData('activo', e.target.checked)}
                            className="size-4 rounded border-input"
                        />
                        <Label htmlFor="activo">Producto activo</Label>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-muted/10 p-4 space-y-4">
                        <p className="text-sm font-medium text-foreground">Configuración de alquiler</p>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="es_alquilable"
                                checked={data.es_alquilable}
                                onChange={(e) => setData('es_alquilable', e.target.checked)}
                                className="size-4 rounded border-input"
                            />
                            <Label htmlFor="es_alquilable">Disponible para alquiler</Label>
                        </div>

                        {data.es_alquilable && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Modo de seguimiento</Label>
                                    <Select value={data.tracking_mode} onValueChange={(v) => setData('tracking_mode', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {trackingModes.map((t) => (
                                                <SelectItem key={t.value} value={t.value}>
                                                    {t.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        {data.tracking_mode === 'individual'
                                            ? 'Cada unidad física tiene código único, estado propio e historial. Ideal para andamios, toldos, herramientas.'
                                            : 'Se controla por cantidad total. Ideal para sillas, mesas o artículos en volumen.'}
                                    </p>
                                    <InputError message={errors.tracking_mode} />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="precio_alquiler_diario">Precio alquiler / día</Label>
                                        <Input
                                            id="precio_alquiler_diario"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.precio_alquiler_diario}
                                            onChange={(e) => setData('precio_alquiler_diario', e.target.value)}
                                        />
                                        <InputError message={errors.precio_alquiler_diario} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="deposito_unitario">Depósito / garantía</Label>
                                        <Input
                                            id="deposito_unitario"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.deposito_unitario}
                                            onChange={(e) => setData('deposito_unitario', e.target.value)}
                                            placeholder="Monto de garantía por unidad"
                                        />
                                        <InputError message={errors.deposito_unitario} />
                                    </div>
                                </div>

                                {data.tracking_mode === 'bulk' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="stock_alquiler">Stock disponible para alquiler</Label>
                                        <Input
                                            id="stock_alquiler"
                                            type="number"
                                            step="0.001"
                                            min="0"
                                            value={data.stock_alquiler}
                                            onChange={(e) => setData('stock_alquiler', e.target.value)}
                                        />
                                        <InputError message={errors.stock_alquiler} />
                                    </div>
                                )}

                                {data.tracking_mode === 'individual' && (
                                    <p className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                                        Las unidades físicas se registran desde la ficha del producto una vez creado.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                        <Button type="submit" disabled={processing}>
                            Guardar producto
                        </Button>
                        <Button type="button" variant="outline" className="hover:bg-accent hover:text-accent-foreground" asChild>
                            <Link href={index.url()}>Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
