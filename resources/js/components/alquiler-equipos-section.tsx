import { LayoutGrid, Minus, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { AlquilerCatalogoModal } from '@/components/alquiler-catalogo-modal';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProductoAlquilerComboboxSource } from '@/lib/combobox-options';
import { parseCantidadEntera } from '@/lib/cantidad-entera';
import {
    disponibleRestantePaquete,
    disponibleRestanteProducto,
} from '@/lib/stock-disponible';
import { fmtQ } from '@/lib/utils';
import type { AlquilerLineaForm, PaqueteAlquilerSource } from '@/types/alquiler-linea';

export type { PaqueteAlquilerSource };

type AlquilerEquiposSectionProps = {
    lineas: AlquilerLineaForm[];
    onLineasChange: (lineas: AlquilerLineaForm[]) => void;
    productosAlquiler: ProductoAlquilerComboboxSource[];
    paquetesAlquiler?: PaqueteAlquilerSource[];
    errors?: Record<string, string>;
};

export function AlquilerEquiposSection({
    lineas,
    onLineasChange,
    productosAlquiler,
    paquetesAlquiler = [],
    errors = {},
}: AlquilerEquiposSectionProps) {
    const [catalogoOpen, setCatalogoOpen] = useState(false);

    const productoPorId = useMemo(
        () => new Map(productosAlquiler.map((p) => [p.id, p])),
        [productosAlquiler],
    );
    const paquetePorId = useMemo(
        () => new Map(paquetesAlquiler.map((p) => [p.id, p])),
        [paquetesAlquiler],
    );

    const lineasValidas = lineas.filter(
        (l) => l.producto_id !== '' || l.paquete_id !== '',
    );

    const mergeLineasDesdeCatalogo = (nuevas: AlquilerLineaForm[]) => {
        const merged: AlquilerLineaForm[] = [...lineasValidas];

        for (const nueva of nuevas) {
            const esPaquete = nueva.paquete_id !== '';
            const duplicado = merged.findIndex((l) =>
                esPaquete
                    ? l.paquete_id === nueva.paquete_id
                    : l.producto_id === nueva.producto_id,
            );

            if (duplicado >= 0) {
                const suma =
                    parseCantidadEntera(merged[duplicado].cantidad) +
                    parseCantidadEntera(nueva.cantidad);
                merged[duplicado] = { ...merged[duplicado], cantidad: String(suma) };
            } else {
                merged.push(nueva);
            }
        }

        onLineasChange(merged);
    };

    const updateCantidad = (idx: number, valor: string) => {
        const linea = lineasValidas[idx];
        const realIdx = lineas.indexOf(linea);
        let cantidad = parseCantidadEntera(valor);
        if (cantidad < 1) {
            cantidad = 1;
        }

        if (linea.producto_id !== '') {
            const producto = productoPorId.get(linea.producto_id);
            if (producto) {
                const max = disponibleRestanteProducto(
                    producto.stock_disponible,
                    lineas,
                    producto.id,
                    0,
                    realIdx,
                );
                cantidad = Math.min(cantidad, max);
            }
        } else if (linea.paquete_id !== '') {
            const paquete = paquetePorId.get(linea.paquete_id);
            if (paquete) {
                const max = disponibleRestantePaquete(
                    paquete.stock_disponible,
                    lineas,
                    paquete.id,
                    0,
                    realIdx,
                );
                cantidad = Math.min(cantidad, max);
            }
        }

        onLineasChange(
            lineas.map((l, i) => (i === realIdx ? { ...l, cantidad: String(cantidad) } : l)),
        );
    };

    const quitarLinea = (idx: number) => {
        const linea = lineasValidas[idx];
        onLineasChange(lineas.filter((l) => l !== linea));
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <Label className="text-base">Equipos del alquiler *</Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Agrega productos o paquetes desde el catálogo. Las cantidades son en unidades
                        enteras.
                    </p>
                </div>
                <Button type="button" variant="success" onClick={() => setCatalogoOpen(true)}>
                    <LayoutGrid className="mr-2 size-4" />
                    Abrir catálogo
                </Button>
            </div>

            <InputError message={errors.lineas} />

            {lineasValidas.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 bg-muted/15 px-6 py-10 text-center">
                    <LayoutGrid className="mx-auto size-10 text-muted-foreground/50" />
                    <p className="mt-3 text-sm font-medium text-foreground">Sin equipos aún</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Pulsa «Abrir catálogo» para elegir productos o paquetes.
                    </p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {lineasValidas.map((linea, idx) => {
                        const esPaquete = linea.paquete_id !== '';
                        const producto = !esPaquete ? productoPorId.get(linea.producto_id) : undefined;
                        const paquete = esPaquete ? paquetePorId.get(linea.paquete_id) : undefined;
                        const titulo = esPaquete ? paquete?.nombre : producto?.nombre;
                        const codigo = esPaquete ? paquete?.codigo : producto?.codigo;
                        const realIdx = lineas.indexOf(linea);
                        const max = esPaquete
                            ? paquete
                                ? disponibleRestantePaquete(
                                      paquete.stock_disponible,
                                      lineas,
                                      paquete.id,
                                      0,
                                      realIdx,
                                  )
                                : 1
                            : producto
                              ? disponibleRestanteProducto(
                                    producto.stock_disponible,
                                    lineas,
                                    producto.id,
                                    0,
                                    realIdx,
                                )
                              : 1;

                        return (
                            <li
                                key={`${esPaquete ? 'p' : 'r'}-${esPaquete ? linea.paquete_id : linea.producto_id}-${idx}`}
                                className="flex flex-col gap-3 rounded-xl border border-border/50 bg-card p-4 sm:flex-row sm:items-center"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-foreground">
                                        {titulo ?? '—'}
                                        {esPaquete && (
                                            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                Paquete
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{codigo}</p>
                                    {esPaquete && paquete && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {paquete.productos
                                                .map((i) => `${parseCantidadEntera(i.cantidad)}× ${i.nombre}`)
                                                .join(', ')}
                                        </p>
                                    )}
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {fmtQ(linea.precio_diario || (esPaquete ? paquete?.precio_alquiler : producto?.precio_alquiler_diario) || '0')}/día
                                        {' · '}Máx. {max} disp.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="size-8"
                                            disabled={parseCantidadEntera(linea.cantidad) <= 1}
                                            onClick={() =>
                                                updateCantidad(
                                                    idx,
                                                    String(parseCantidadEntera(linea.cantidad) - 1),
                                                )
                                            }
                                        >
                                            <Minus className="size-3" />
                                        </Button>
                                        <Input
                                            type="number"
                                            step={1}
                                            min={1}
                                            max={max}
                                            value={linea.cantidad}
                                            onChange={(e) => updateCantidad(idx, e.target.value)}
                                            className="h-8 w-16 text-center"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="size-8"
                                            disabled={parseCantidadEntera(linea.cantidad) >= max}
                                            onClick={() =>
                                                updateCantidad(
                                                    idx,
                                                    String(parseCantidadEntera(linea.cantidad) + 1),
                                                )
                                            }
                                        >
                                            <Plus className="size-3" />
                                        </Button>
                                    </div>
                                    <IconActionTooltip label="Quitar del alquiler">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive"
                                            onClick={() => quitarLinea(idx)}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </IconActionTooltip>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <AlquilerCatalogoModal
                open={catalogoOpen}
                onOpenChange={setCatalogoOpen}
                productos={productosAlquiler}
                paquetes={paquetesAlquiler}
                lineasFormulario={lineas}
                onConfirm={mergeLineasDesdeCatalogo}
            />
        </div>
    );
}
