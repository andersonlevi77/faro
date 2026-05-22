import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import InputError from '@/components/input-error';
import { SearchableCombobox } from '@/components/searchable-combobox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { edit, index, show, update } from '@/routes/paquetes';
import type { BreadcrumbItem } from '@/types';

type ProductoOption = { id: number; nombre: string; codigo: string; stock_alquiler: string };

type ItemForm = { producto_id: number | ''; cantidad: string };

type PaquetePayload = {
    id: number;
    nombre: string;
    codigo: string;
    descripcion: string | null;
    precio_alquiler: string;
    activo: boolean;
    items: { producto_id: number; cantidad: string }[];
};

export default function PaquetesEditar({
    paquete,
    productos,
}: {
    paquete: PaquetePayload;
    productos: ProductoOption[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Paquetes', href: index.url() },
        { title: paquete.nombre, href: show.url({ paquete: paquete.id }) },
    ];

    const productoOptions = productos.map((p) => ({
        value: p.id,
        label: `${p.nombre} · ${p.codigo}`,
        searchText: `${p.nombre} ${p.codigo}`,
    }));

    const { data, setData, put, processing, errors } = useForm({
        nombre: paquete.nombre,
        codigo: paquete.codigo,
        descripcion: paquete.descripcion ?? '',
        precio_alquiler: paquete.precio_alquiler,
        activo: paquete.activo,
        items:
            paquete.items.length > 0
                ? paquete.items.map((i) => ({
                      producto_id: i.producto_id as number | '',
                      cantidad: i.cantidad,
                  }))
                : ([{ producto_id: '' as number | '', cantidad: '1' }] as ItemForm[]),
    });

    const updateItem = (idx: number, patch: Partial<ItemForm>) => {
        setData(
            'items',
            data.items.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(update.url({ paquete: paquete.id }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${paquete.nombre}`} />
            <div className="faro-page">
                <div className="mb-4 flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={index.url()}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-semibold">Editar paquete</h1>
                </div>
                <form onSubmit={handleSubmit} className="faro-form-card space-y-6">
                    <div className="faro-form-grid sm:grid-cols-2">
                        <div className="faro-field">
                            <Label htmlFor="nombre">Nombre *</Label>
                            <Input
                                id="nombre"
                                value={data.nombre}
                                onChange={(e) => setData('nombre', e.target.value)}
                                required
                            />
                            <InputError message={errors.nombre} />
                        </div>
                        <div className="faro-field">
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
                    <div className="faro-field">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Input
                            id="descripcion"
                            value={data.descripcion}
                            onChange={(e) => setData('descripcion', e.target.value)}
                        />
                    </div>
                    <div className="faro-field sm:max-w-xs">
                        <Label htmlFor="precio_alquiler">Precio de alquiler por día *</Label>
                        <Input
                            id="precio_alquiler"
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.precio_alquiler}
                            onChange={(e) => setData('precio_alquiler', e.target.value)}
                            required
                        />
                        <InputError message={errors.precio_alquiler} />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-base">Productos del paquete *</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setData('items', [...data.items, { producto_id: '', cantidad: '1' }])
                                }
                            >
                                <Plus className="mr-1 size-4" />
                                Añadir producto
                            </Button>
                        </div>
                        <InputError message={errors.items} />
                        {data.items.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/20 p-4 sm:flex-row sm:items-end"
                            >
                                <div className="min-w-0 flex-1 space-y-2">
                                    <Label>Producto</Label>
                                    <SearchableCombobox
                                        value={item.producto_id}
                                        onValueChange={(id) => updateItem(idx, { producto_id: id })}
                                        options={productoOptions}
                                        placeholder="Buscar producto…"
                                    />
                                </div>
                                <div className="w-full space-y-2 sm:w-28">
                                    <Label>Cantidad</Label>
                                    <Input
                                        type="number"
                                        step="0.001"
                                        min="0.001"
                                        value={item.cantidad}
                                        onChange={(e) => updateItem(idx, { cantidad: e.target.value })}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    disabled={data.items.length <= 1}
                                    onClick={() =>
                                        setData(
                                            'items',
                                            data.items.filter((_, i) => i !== idx),
                                        )
                                    }
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="faro-form-actions">
                        <Button type="submit" variant="success" disabled={processing}>
                            Guardar cambios
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href={index.url()}>Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
