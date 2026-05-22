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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    productoAlquilerComboboxOptions,
    type ProductoAlquilerComboboxSource,
} from '@/lib/combobox-options';
import { disponibleRestanteProducto, parseStockCantidad } from '@/lib/stock-disponible';
import { fmtQ } from '@/lib/utils';
import {
    alquilerLineaFromPaquete,
    alquilerLineaFromProducto,
    emptyAlquilerLinea,
    type AlquilerLineaForm,
} from '@/types/alquiler-linea';

export type PaqueteAlquilerSource = {
    id: number;
    nombre: string;
    codigo: string;
    precio_alquiler: string;
    productos: { nombre: string; codigo: string; cantidad: string }[];
};

type AlquilerLineasEditorProps = {
    lineas: AlquilerLineaForm[];
    onLineasChange: (lineas: AlquilerLineaForm[]) => void;
    productosAlquiler: ProductoAlquilerComboboxSource[];
    paquetesAlquiler?: PaqueteAlquilerSource[];
    errors?: Record<string, string>;
    onConfirmRemove?: (idx: number, onConfirm: () => void) => void;
};

export function AlquilerLineasEditor({
    lineas,
    onLineasChange,
    productosAlquiler,
    paquetesAlquiler = [],
    errors = {},
    onConfirmRemove,
}: AlquilerLineasEditorProps) {
    const [posOpen, setPosOpen] = useState(false);

    const productoOptions = useMemo(
        () => productoAlquilerComboboxOptions(productosAlquiler),
        [productosAlquiler],
    );

    const paqueteOptions = useMemo(
        () =>
            paquetesAlquiler.map((p) => ({
                value: p.id,
                label: `${p.nombre} · ${p.codigo}`,
                searchText: [p.nombre, p.codigo, ...p.productos.map((i) => i.nombre)].join(' '),
            })),
        [paquetesAlquiler],
    );

    const productoPorId = useMemo(
        () => new Map(productosAlquiler.map((producto) => [producto.id, producto])),
        [productosAlquiler],
    );

    const paquetePorId = useMemo(
        () => new Map(paquetesAlquiler.map((paquete) => [paquete.id, paquete])),
        [paquetesAlquiler],
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

    const updateCantidadLinea = (idx: number, valor: string) => {
        const linea = lineas[idx];
        if (linea.producto_id === '' || linea.paquete_id !== '') {
            updateLinea(idx, { cantidad: valor });

            return;
        }

        const producto = productoPorId.get(linea.producto_id);
        if (!producto) {
            updateLinea(idx, { cantidad: valor });

            return;
        }

        const max = disponibleRestanteProducto(
            producto.stock_disponible,
            lineas,
            linea.producto_id,
            0,
            idx,
        );
        let cantidad = parseStockCantidad(valor);
        if (cantidad > max) {
            cantidad = max;
        }
        if (cantidad < 0.001 && max >= 0.001) {
            cantidad = 0.001;
        }

        updateLinea(idx, { cantidad: String(cantidad) });
    };

    const setTipoLinea = (idx: number, tipo: 'producto' | 'paquete') => {
        if (tipo === 'producto') {
            updateLinea(idx, { producto_id: '', paquete_id: '', precio_diario: '' });
        } else {
            updateLinea(idx, { producto_id: '', paquete_id: '', precio_diario: '' });
        }
    };

    const handleProductoSelect = (idx: number, productoId: number | '') => {
        if (productoId === '') {
            updateLinea(idx, { producto_id: '', precio_diario: '' });

            return;
        }

        const producto = productoPorId.get(productoId);

        updateLinea(idx, {
            ...alquilerLineaFromProducto(productoId, producto?.precio_alquiler_diario ?? ''),
        });
    };

    const handlePaqueteSelect = (idx: number, paqueteId: number | '') => {
        if (paqueteId === '') {
            updateLinea(idx, { paquete_id: '', precio_diario: '' });

            return;
        }

        const paquete = paquetePorId.get(paqueteId);

        updateLinea(idx, {
            ...alquilerLineaFromPaquete(paqueteId, paquete?.precio_alquiler ?? ''),
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
                        const esPaquete = linea.paquete_id !== '';
                        const producto =
                            linea.producto_id !== ''
                                ? productoPorId.get(linea.producto_id)
                                : undefined;
                        const paquete =
                            linea.paquete_id !== '' ? paquetePorId.get(linea.paquete_id) : undefined;

                        return (
                            <div
                                key={idx}
                                className="flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/20 p-4"
                            >
                                <div className="flex flex-wrap items-center gap-3">
                                    <Label className="text-xs text-muted-foreground">Tipo</Label>
                                    <Select
                                        value={esPaquete ? 'paquete' : 'producto'}
                                        onValueChange={(v) =>
                                            setTipoLinea(idx, v as 'producto' | 'paquete')
                                        }
                                    >
                                        <SelectTrigger className="w-[140px] bg-white dark:bg-card">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="producto">Producto</SelectItem>
                                            <SelectItem value="paquete">Paquete</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <Label>{esPaquete ? 'Paquete' : 'Producto'}</Label>
                                        {esPaquete ? (
                                            <SearchableCombobox
                                                value={linea.paquete_id}
                                                onValueChange={(id) => handlePaqueteSelect(idx, id)}
                                                options={paqueteOptions}
                                                placeholder="Buscar paquete…"
                                                emptyMessage="Ningún paquete coincide"
                                            />
                                        ) : (
                                            <SearchableCombobox
                                                value={linea.producto_id}
                                                onValueChange={(id) => handleProductoSelect(idx, id)}
                                                options={productoOptions}
                                                placeholder="Buscar por nombre, código o marca…"
                                                emptyMessage="Ningún producto coincide con la búsqueda"
                                            />
                                        )}
                                    </div>
                                    <div className="w-full space-y-2 sm:w-28">
                                        <Label>Cantidad</Label>
                                        <Input
                                            type="number"
                                            step="0.001"
                                            min="0.001"
                                            max={
                                                producto && !esPaquete
                                                    ? disponibleRestanteProducto(
                                                          producto.stock_disponible,
                                                          lineas,
                                                          producto.id,
                                                          0,
                                                          idx,
                                                      )
                                                    : undefined
                                            }
                                            value={linea.cantidad}
                                            onChange={(event) =>
                                                updateCantidadLinea(idx, event.target.value)
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
                                            placeholder="0.00"
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
                                {paquete && (
                                    <p className="text-xs text-muted-foreground">
                                        Incluye:{' '}
                                        {paquete.productos
                                            .map((i) => `${i.cantidad}× ${i.nombre}`)
                                            .join(', ')}
                                        {' · '}
                                        Lista: {fmtQ(paquete.precio_alquiler)}/día
                                    </p>
                                )}
                                {producto && !esPaquete && (
                                    <p className="text-xs text-muted-foreground">
                                        Disponible para alquilar:{' '}
                                        <strong>
                                            {disponibleRestanteProducto(
                                                producto.stock_disponible,
                                                lineas,
                                                producto.id,
                                                0,
                                                idx,
                                            ).toLocaleString('es-GT')}
                                        </strong>
                                        {' '}
                                        (stock total {producto.stock_alquiler})
                                        {linea.precio_diario && (
                                            <>
                                                {' '}
                                                · Lista: {fmtQ(producto.precio_alquiler_diario)}/día
                                                {linea.precio_diario !== producto.precio_alquiler_diario &&
                                                    ` · Usando ${fmtQ(linea.precio_diario)}/día`}
                                            </>
                                        )}
                                    </p>
                                )}
                                <InputError
                                    message={
                                        errors[`lineas.${idx}.producto_id`] ??
                                        errors[`lineas.${idx}.paquete_id`] ??
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
                lineasFormulario={lineas}
                onConfirm={mergeLineasFromPos}
            />
        </>
    );
}
