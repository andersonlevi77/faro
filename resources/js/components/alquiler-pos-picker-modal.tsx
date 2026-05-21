import { LayoutGrid, Minus, Plus, Search, ShoppingCart, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProductoAlquilerComboboxSource } from '@/lib/combobox-options';
import { matchesSearchQuery } from '@/lib/search-text';
import { cn, fmtQ } from '@/lib/utils';
import type { AlquilerLineaForm } from '@/types/alquiler-linea';

type CartItem = {
    producto_id: number;
    cantidad: string;
    precio_diario: string;
};

type AlquilerPosPickerModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productos: ProductoAlquilerComboboxSource[];
    onConfirm: (lineas: AlquilerLineaForm[]) => void;
};

export function AlquilerPosPickerModal({
    open,
    onOpenChange,
    productos,
    onConfirm,
}: AlquilerPosPickerModalProps) {
    const [busqueda, setBusqueda] = useState('');
    const [carrito, setCarrito] = useState<CartItem[]>([]);

    const productosFiltrados = useMemo(() => {
        const filtrados = productos.filter((producto) =>
            matchesSearchQuery(
                [producto.nombre, producto.codigo, producto.marca_nombre, producto.categoria_nombre]
                    .filter(Boolean)
                    .join(' '),
                busqueda,
            ),
        );

        return filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    }, [productos, busqueda]);

    const productoPorId = useMemo(
        () => new Map(productos.map((producto) => [producto.id, producto])),
        [productos],
    );

    const agregarProducto = (producto: ProductoAlquilerComboboxSource) => {
        setCarrito((prev) => {
            const existente = prev.find((item) => item.producto_id === producto.id);

            if (existente) {
                const cantidad = Number(existente.cantidad) + 1;

                return prev.map((item) =>
                    item.producto_id === producto.id
                        ? { ...item, cantidad: String(cantidad) }
                        : item,
                );
            }

            return [
                ...prev,
                {
                    producto_id: producto.id,
                    cantidad: '1',
                    precio_diario: producto.precio_alquiler_diario,
                },
            ];
        });
    };

    const actualizarCarrito = (productoId: number, patch: Partial<CartItem>) => {
        setCarrito((prev) =>
            prev.map((item) => (item.producto_id === productoId ? { ...item, ...patch } : item)),
        );
    };

    const quitarDelCarrito = (productoId: number) => {
        setCarrito((prev) => prev.filter((item) => item.producto_id !== productoId));
    };

    const handleConfirm = () => {
        const lineas: AlquilerLineaForm[] = carrito.map((item) => ({
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            precio_diario: item.precio_diario,
        }));

        onConfirm(lineas);
        setCarrito([]);
        setBusqueda('');
        onOpenChange(false);
    };

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            setCarrito([]);
            setBusqueda('');
        }

        onOpenChange(next);
    };

    const totalUnidades = carrito.reduce((sum, item) => sum + Number(item.cantidad || 0), 0);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="flex max-h-[min(92vh,900px)] flex-col gap-0 overflow-hidden rounded-2xl border-0 p-0 sm:max-w-5xl">
                <DialogHeader className="shrink-0 space-y-1 border-b border-border/50 px-5 py-4 text-left sm:px-6">
                    <div className="flex items-center gap-2">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <LayoutGrid className="size-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold">Catálogo de equipos</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                Toca los productos para agregarlos. Ajusta cantidad y precio por día antes de
                                confirmar.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
                    <div className="flex min-h-0 flex-1 flex-col border-b border-border/50 lg:border-b-0 lg:border-r">
                        <div className="shrink-0 p-4 pb-2 sm:px-5">
                            <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={busqueda}
                                    onChange={(event) => setBusqueda(event.target.value)}
                                    placeholder="Buscar por nombre, código o marca…"
                                    className="pl-9"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-5">
                            {productosFiltrados.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    Ningún producto coincide con la búsqueda.
                                </p>
                            ) : (
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                                    {productosFiltrados.map((producto) => {
                                        const enCarrito = carrito.find(
                                            (item) => item.producto_id === producto.id,
                                        );
                                        const cantidadCarrito = enCarrito
                                            ? Number(enCarrito.cantidad)
                                            : 0;

                                        return (
                                            <button
                                                key={producto.id}
                                                type="button"
                                                onClick={() => agregarProducto(producto)}
                                                className={cn(
                                                    'flex flex-col rounded-xl border p-3 text-left transition-[box-shadow,transform,border-color]',
                                                    'hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm active:scale-[0.98]',
                                                    cantidadCarrito > 0 &&
                                                        'border-primary bg-primary/5 ring-1 ring-primary/20',
                                                )}
                                            >
                                                <span className="line-clamp-2 text-sm leading-snug font-medium text-foreground">
                                                    {producto.nombre}
                                                </span>
                                                <span className="mt-1 text-xs text-muted-foreground">
                                                    {producto.codigo}
                                                </span>
                                                {producto.marca_nombre && (
                                                    <span className="mt-0.5 text-xs text-muted-foreground">
                                                        {producto.marca_nombre}
                                                    </span>
                                                )}
                                                <div className="mt-2 flex items-end justify-between gap-1">
                                                    <span className="text-sm font-semibold text-primary">
                                                        {fmtQ(producto.precio_alquiler_diario)}
                                                        <span className="text-xs font-normal text-muted-foreground">
                                                            /día
                                                        </span>
                                                    </span>
                                                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                                        Stock {producto.stock_alquiler}
                                                    </span>
                                                </div>
                                                {cantidadCarrito > 0 && (
                                                    <span className="mt-2 inline-flex w-fit items-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                                                        ×{cantidadCarrito}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex w-full shrink-0 flex-col bg-muted/20 lg:w-80">
                        <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
                            <ShoppingCart className="size-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                                Seleccionados ({carrito.length})
                            </span>
                        </div>

                        <div className="min-h-[120px] flex-1 overflow-y-auto p-4">
                            {carrito.length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground">
                                    Toca un producto del catálogo para agregarlo aquí.
                                </p>
                            ) : (
                                <ul className="space-y-3">
                                    {carrito.map((item) => {
                                        const producto = productoPorId.get(item.producto_id);

                                        if (!producto) {
                                            return null;
                                        }

                                        return (
                                            <li
                                                key={item.producto_id}
                                                className="rounded-xl border border-border/50 bg-card p-3 shadow-sm"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium">
                                                            {producto.nombre}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {producto.codigo}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                                                        onClick={() => quitarDelCarrito(item.producto_id)}
                                                    >
                                                        <X className="size-4" />
                                                    </Button>
                                                </div>
                                                <div className="mt-3 grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                                            Cant.
                                                        </Label>
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                className="size-8 shrink-0"
                                                                onClick={() => {
                                                                    const next = Math.max(
                                                                        0.001,
                                                                        Number(item.cantidad) - 1,
                                                                    );
                                                                    actualizarCarrito(item.producto_id, {
                                                                        cantidad: String(next),
                                                                    });
                                                                }}
                                                            >
                                                                <Minus className="size-3" />
                                                            </Button>
                                                            <Input
                                                                type="number"
                                                                step="0.001"
                                                                min="0.001"
                                                                value={item.cantidad}
                                                                onChange={(event) =>
                                                                    actualizarCarrito(item.producto_id, {
                                                                        cantidad: event.target.value,
                                                                    })
                                                                }
                                                                className="h-8 px-1 text-center text-sm"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                className="size-8 shrink-0"
                                                                onClick={() =>
                                                                    actualizarCarrito(item.producto_id, {
                                                                        cantidad: String(
                                                                            Number(item.cantidad) + 1,
                                                                        ),
                                                                    })
                                                                }
                                                            >
                                                                <Plus className="size-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                                            Precio / día
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={item.precio_diario}
                                                            onChange={(event) =>
                                                                actualizarCarrito(item.producto_id, {
                                                                    precio_diario: event.target.value,
                                                                })
                                                            }
                                                            className="h-8 text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="shrink-0 flex-col gap-2 border-t border-border/50 bg-muted/20 px-5 py-4 sm:flex-row sm:justify-between sm:px-6">
                    <p className="text-sm text-muted-foreground">
                        {carrito.length > 0
                            ? `${carrito.length} producto(s) · ${totalUnidades} unidad(es) en total`
                            : 'Sin productos en el carrito'}
                    </p>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => handleOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="success"
                            className="rounded-xl"
                            disabled={carrito.length === 0}
                            onClick={handleConfirm}
                        >
                            Agregar al alquiler
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
