import { LayoutGrid, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { AlquilerPosPickerModal } from '@/components/alquiler-pos-picker-modal';
import { SearchableCombobox } from '@/components/searchable-combobox';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    productoAlquilerComboboxOptions,
    type ProductoAlquilerComboboxSource,
} from '@/lib/combobox-options';
import { fmtQ } from '@/lib/utils';
import { emptyAlquilerLinea, type AlquilerLineaForm } from '@/types/alquiler-linea';

type AlquilerLineasEditorProps = {
    lineas: AlquilerLineaForm[];
    onLineasChange: (lineas: AlquilerLineaForm[]) => void;
    productosAlquiler: ProductoAlquilerComboboxSource[];
    errors?: Record<string, string>;
    onConfirmRemove?: (idx: number, onConfirm: () => void) => void;
};

export function AlquilerLineasEditor({
    lineas,
    onLineasChange,
    productosAlquiler,
    errors = {},
    onConfirmRemove,
}: AlquilerLineasEditorProps) {
    const [posOpen, setPosOpen] = useState(false);

    const productoOptions = useMemo(
        () => productoAlquilerComboboxOptions(productosAlquiler),
        [productosAlquiler],
    );

    const productoPorId = useMemo(
        () => new Map(productosAlquiler.map((producto) => [producto.id, producto])),
        [productosAlquiler],
    );

    const addLinea = () => {
        onLineasChange([...lineas, emptyAlquilerLinea()]);
    };

    const removeLinea = (idx: number) => {
        const doRemove = () =>
            onLineasChange(lineas.filter((_, index) => index !== idx));

        if (onConfirmRemove) {
            onConfirmRemove(idx, doRemove);

            return;
        }

        doRemove();
    };

    const updateLinea = (idx: number, patch: Partial<AlquilerLineaForm>) => {
        onLineasChange(lineas.map((linea, index) => (index === idx ? { ...linea, ...patch } : linea)));
    };

    const handleProductoSelect = (idx: number, productoId: number | '') => {
        if (productoId === '') {
            updateLinea(idx, { producto_id: '', precio_diario: '' });

            return;
        }

        const producto = productoPorId.get(productoId);

        updateLinea(idx, {
            producto_id: productoId,
            precio_diario: producto?.precio_alquiler_diario ?? '',
        });
    };

    const mergeLineasFromPos = (nuevas: AlquilerLineaForm[]) => {
        const existentes = lineas.filter((linea) => linea.producto_id !== '');
        const merged = [...existentes];

        for (const nueva of nuevas) {
            if (nueva.producto_id === '') {
                continue;
            }

            const duplicado = merged.findIndex(
                (linea) =>
                    linea.producto_id === nueva.producto_id &&
                    linea.precio_diario === nueva.precio_diario,
            );

            if (duplicado >= 0) {
                const cantidad =
                    Number(merged[duplicado].cantidad || 0) + Number(nueva.cantidad || 0);

                merged[duplicado] = {
                    ...merged[duplicado],
                    cantidad: String(cantidad),
                };
            } else {
                merged.push(nueva);
            }
        }

        onLineasChange(merged.length > 0 ? merged : [emptyAlquilerLinea()]);
    };

    return (
        <>
            <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label className="text-base">Líneas de equipo *</Label>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPosOpen(true)}
                        >
                            <LayoutGrid className="mr-1 size-4" />
                            Catálogo de equipos
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={addLinea}>
                            <Plus className="mr-1 size-4" />
                            Añadir línea
                        </Button>
                    </div>
                </div>
                <InputError message={errors.lineas} />
                <div className="space-y-3">
                    {lineas.map((linea, idx) => {
                        const producto =
                            linea.producto_id !== ''
                                ? productoPorId.get(linea.producto_id)
                                : undefined;

                        return (
                            <div
                                key={idx}
                                className="flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/20 p-4"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <Label>Producto</Label>
                                        <SearchableCombobox
                                            value={linea.producto_id}
                                            onValueChange={(id) => handleProductoSelect(idx, id)}
                                            options={productoOptions}
                                            placeholder="Buscar por nombre, código o marca…"
                                            emptyMessage="Ningún producto coincide con la búsqueda"
                                        />
                                    </div>
                                    <div className="w-full space-y-2 sm:w-28">
                                        <Label>Cantidad</Label>
                                        <Input
                                            type="number"
                                            step="0.001"
                                            min="0.001"
                                            value={linea.cantidad}
                                            onChange={(event) =>
                                                updateLinea(idx, { cantidad: event.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="w-full space-y-2 sm:w-36">
                                        <Label>Precio / día</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={linea.precio_diario}
                                            placeholder={
                                                producto
                                                    ? producto.precio_alquiler_diario
                                                    : '0.00'
                                            }
                                            onChange={(event) =>
                                                updateLinea(idx, { precio_diario: event.target.value })
                                            }
                                        />
                                    </div>
                                    <IconActionTooltip
                                        label={
                                            lineas.length <= 1
                                                ? 'Debe existir al menos una línea'
                                                : 'Quitar esta línea del alquiler'
                                        }
                                    >
                                        <span className="inline-flex shrink-0 sm:mb-0.5">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="shrink-0 text-destructive"
                                                disabled={lineas.length <= 1}
                                                onClick={() => removeLinea(idx)}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </span>
                                    </IconActionTooltip>
                                </div>
                                {producto && linea.precio_diario && (
                                    <p className="text-xs text-muted-foreground">
                                        Lista: {fmtQ(producto.precio_alquiler_diario)}/día
                                        {linea.precio_diario !== producto.precio_alquiler_diario &&
                                            ` · Usando ${fmtQ(linea.precio_diario)}/día`}
                                    </p>
                                )}
                                <InputError
                                    message={
                                        errors[`lineas.${idx}.producto_id`] ??
                                        errors[`lineas.${idx}.cantidad`] ??
                                        errors[`lineas.${idx}.precio_diario`]
                                    }
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <AlquilerPosPickerModal
                open={posOpen}
                onOpenChange={setPosOpen}
                productos={productosAlquiler}
                onConfirm={mergeLineasFromPos}
            />
        </>
    );
}
