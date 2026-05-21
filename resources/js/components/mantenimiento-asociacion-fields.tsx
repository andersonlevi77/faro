import { LayoutGrid, Package, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import {
    ProductCatalogPickerModal,
    type ProductCatalogItem,
} from '@/components/product-catalog-picker-modal';
import {
    UnidadCatalogPickerModal,
    type UnidadCatalogItem,
} from '@/components/unidad-catalog-picker-modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export interface ProductoOption {
    id: number;
    nombre: string;
    codigo: string;
    marca_nombre?: string | null;
    categoria_nombre?: string | null;
}

export interface UnidadOption {
    id: number;
    codigo: string;
    estado: string;
    estado_label: string;
    producto_id: number;
    producto_nombre: string | null;
    producto_codigo: string | null;
}

type MantenimientoAsociacionFieldsProps = {
    productoUnidadId: string;
    productoId: string;
    onProductoUnidadIdChange: (value: string) => void;
    onProductoIdChange: (value: string) => void;
    productos: ProductoOption[];
    unidades: UnidadOption[];
    errors?: {
        producto_unidad_id?: string;
        producto_id?: string;
    };
};

export function MantenimientoAsociacionFields({
    productoUnidadId,
    productoId,
    onProductoUnidadIdChange,
    onProductoIdChange,
    productos,
    unidades,
    errors,
}: MantenimientoAsociacionFieldsProps) {
    const [catalogoProductoOpen, setCatalogoProductoOpen] = useState(false);
    const [catalogoUnidadOpen, setCatalogoUnidadOpen] = useState(false);

    const productoCatalogo: ProductCatalogItem[] = useMemo(
        () =>
            productos.map((producto) => ({
                id: producto.id,
                nombre: producto.nombre,
                codigo: producto.codigo,
                marca_nombre: producto.marca_nombre,
                categoria_nombre: producto.categoria_nombre,
            })),
        [productos],
    );

    const unidadesCatalogo: UnidadCatalogItem[] = useMemo(
        () =>
            unidades.map((unidad) => ({
                id: unidad.id,
                codigo: unidad.codigo,
                estado_label: unidad.estado_label,
                producto_nombre: unidad.producto_nombre,
                producto_codigo: unidad.producto_codigo,
            })),
        [unidades],
    );

    const productoSeleccionado = productos.find((p) => p.id === Number(productoId));
    const unidadSeleccionada = unidades.find((u) => u.id === Number(productoUnidadId));

    const seleccionarProducto = (id: number) => {
        onProductoIdChange(String(id));
        onProductoUnidadIdChange('');
    };

    const seleccionarUnidad = (id: number) => {
        onProductoUnidadIdChange(String(id));
        onProductoIdChange('');
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Opcional. Elige del catálogo o deja vacío para un mantenimiento general.
            </p>

            <div className="space-y-2">
                <Label>Producto</Label>
                {productoSeleccionado ? (
                    <div className="flex items-start justify-between gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
                        <div className="min-w-0">
                            <p className="font-medium text-foreground">{productoSeleccionado.nombre}</p>
                            <p className="text-xs text-muted-foreground">{productoSeleccionado.codigo}</p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => onProductoIdChange('')}
                            aria-label="Quitar producto"
                        >
                            <X className="size-4" />
                        </Button>
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start rounded-xl"
                        onClick={() => setCatalogoProductoOpen(true)}
                        disabled={unidadSeleccionada !== undefined}
                    >
                        <LayoutGrid className="mr-2 size-4" />
                        Elegir del catálogo
                    </Button>
                )}
                <InputError message={errors?.producto_id} />
            </div>

            <div className="relative flex items-center py-1">
                <div className="grow border-t border-border/60" />
                <span className="mx-3 shrink-0 text-xs text-muted-foreground">o unidad física</span>
                <div className="grow border-t border-border/60" />
            </div>

            <div className="space-y-2">
                <Label>Unidad específica</Label>
                {unidadSeleccionada ? (
                    <div className="flex items-start justify-between gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
                        <div className="min-w-0">
                            <p className="font-medium text-foreground">{unidadSeleccionada.codigo}</p>
                            <p className="text-xs text-muted-foreground">
                                {unidadSeleccionada.producto_nombre ?? 'Sin producto'}
                                {unidadSeleccionada.producto_codigo
                                    ? ` · ${unidadSeleccionada.producto_codigo}`
                                    : ''}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {unidadSeleccionada.estado_label}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => onProductoUnidadIdChange('')}
                            aria-label="Quitar unidad"
                        >
                            <X className="size-4" />
                        </Button>
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start rounded-xl"
                        onClick={() => setCatalogoUnidadOpen(true)}
                        disabled={productoSeleccionado !== undefined || unidades.length === 0}
                    >
                        <Package className="mr-2 size-4" />
                        {unidades.length === 0
                            ? 'Sin unidades registradas'
                            : 'Elegir unidad del catálogo'}
                    </Button>
                )}
                <InputError message={errors?.producto_unidad_id} />
            </div>

            <ProductCatalogPickerModal
                open={catalogoProductoOpen}
                onOpenChange={setCatalogoProductoOpen}
                productos={productoCatalogo}
                onSelect={seleccionarProducto}
                selectedId={productoId ? Number(productoId) : null}
            />

            <UnidadCatalogPickerModal
                open={catalogoUnidadOpen}
                onOpenChange={setCatalogoUnidadOpen}
                unidades={unidadesCatalogo}
                onSelect={seleccionarUnidad}
                selectedId={productoUnidadId ? Number(productoUnidadId) : null}
            />
        </div>
    );
}
