import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import {
    ProductCatalogSelect,
    type CatalogOption,
} from '@/components/product-catalog-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductoAlquilerFields } from '@/components/producto-alquiler-fields';
import AppLayout from '@/layouts/app-layout';
import { edit, index, update } from '@/routes/productos';
import type { BreadcrumbItem } from '@/types';

interface Producto {
    id: number;
    nombre: string;
    codigo: string;
    descripcion: string | null;
    marca_id: number | null;
    categoria_id: number | null;
    presentacion_id: number | null;
    stock_minimo: number;
    activo: boolean;
    es_alquilable: boolean;
    tracking_mode: string;
    stock_alquiler: string;
    precio_alquiler_diario: string | null;
    deposito_unitario: string | null;
}

export default function ProductosEditar({
    producto,
    categorias,
    marcas,
    presentaciones,
}: {
    producto: Producto;
    categorias: CatalogOption[];
    marcas: CatalogOption[];
    presentaciones: CatalogOption[];
}) {
    const [categoriasOptions, setCategoriasOptions] = useState(categorias);
    const [marcasOptions, setMarcasOptions] = useState(marcas);
    const [presentacionesOptions, setPresentacionesOptions] = useState(presentaciones);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inventario', href: index.url() },
        { title: 'Productos', href: index.url() },
        { title: producto.nombre, href: edit.url({ producto: producto.id }) },
    ];

    const { data, setData, put, processing, errors } = useForm({
        nombre: producto.nombre,
        codigo: producto.codigo,
        descripcion: producto.descripcion ?? '',
        marca_id: producto.marca_id ?? ('' as number | ''),
        categoria_id: producto.categoria_id ?? ('' as number | ''),
        presentacion_id: producto.presentacion_id ?? ('' as number | ''),
        stock_minimo: String(producto.stock_minimo ?? ''),
        activo: producto.activo,
        stock_alquiler: producto.stock_alquiler ?? '',
        precio_alquiler_diario: producto.precio_alquiler_diario ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(update.url({ producto: producto.id }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar: ${producto.nombre}`} />
            <div className="faro-page">
                <div className="flex items-center gap-3">
                    <IconActionTooltip label="Volver al listado de productos">
                        <Button variant="ghost" size="icon" className="size-9 rounded-xl hover:bg-muted" asChild>
                            <Link href={index.url()}>
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                    </IconActionTooltip>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">Editar producto</h1>
                </div>
                <form onSubmit={handleSubmit} className="faro-form-card">
                    <div className="faro-form-grid sm:grid-cols-2">
                        <div className="faro-field">
                            <Label htmlFor="nombre">Nombre *</Label>
                            <Input id="nombre" value={data.nombre} onChange={(e) => setData('nombre', e.target.value)} required />
                            <InputError message={errors.nombre} />
                        </div>
                        <div className="faro-field">
                            <Label htmlFor="codigo">Código *</Label>
                            <Input id="codigo" value={data.codigo} onChange={(e) => setData('codigo', e.target.value)} required />
                            <InputError message={errors.codigo} />
                        </div>
                    </div>
                    <div className="faro-field">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Input id="descripcion" value={data.descripcion} onChange={(e) => setData('descripcion', e.target.value)} />
                        <InputError message={errors.descripcion} />
                    </div>
                    <div className="faro-form-grid sm:grid-cols-3">
                        <ProductCatalogSelect
                            label="Categoría"
                            kind="categoria"
                            value={data.categoria_id}
                            onValueChange={(id) => setData('categoria_id', id)}
                            options={categoriasOptions}
                            onOptionsChange={setCategoriasOptions}
                            error={errors.categoria_id}
                        />
                        <ProductCatalogSelect
                            label="Marca"
                            kind="marca"
                            value={data.marca_id}
                            onValueChange={(id) => setData('marca_id', id)}
                            options={marcasOptions}
                            onOptionsChange={setMarcasOptions}
                            error={errors.marca_id}
                        />
                        <ProductCatalogSelect
                            label="Presentación"
                            kind="presentacion"
                            value={data.presentacion_id}
                            onValueChange={(id) => setData('presentacion_id', id)}
                            options={presentacionesOptions}
                            onOptionsChange={setPresentacionesOptions}
                            error={errors.presentacion_id}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="activo" checked={data.activo} onChange={(e) => setData('activo', e.target.checked)} className="size-4 rounded border-input" />
                        <Label htmlFor="activo">Producto activo</Label>
                    </div>

                    <ProductoAlquilerFields data={data} setData={setData} errors={errors} />


                    <div className="faro-form-actions">
                        <Button type="submit" variant="success" disabled={processing} className="faro-btn-primary">Actualizar producto</Button>
                        <Button type="button" variant="outline" className="hover:bg-accent hover:text-accent-foreground" asChild>
                            <Link href={index.url()}>Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
