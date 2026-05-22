import { Boxes, LayoutGrid, Minus, Package, Plus, Search, ShoppingCart, X } from 'lucide-react';
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
import type { PaqueteAlquilerSource } from '@/types/alquiler-linea';
import type { ProductoAlquilerComboboxSource } from '@/lib/combobox-options';
import { parseCantidadEntera } from '@/lib/cantidad-entera';
import {
    disponibleRestantePaquete,
    disponibleRestanteProducto,
    mensajeErrorDemandaStock,
} from '@/lib/stock-disponible';
import { matchesSearchQuery } from '@/lib/search-text';
import { cn, fmtQ } from '@/lib/utils';
import {
    alquilerLineaFromPaquete,
    alquilerLineaFromProducto,
    type AlquilerLineaForm,
} from '@/types/alquiler-linea';

type TabCatalogo = 'productos' | 'paquetes';

type ItemCarrito =
    | { tipo: 'producto'; producto_id: number; cantidad: string; precio_diario: string }
    | { tipo: 'paquete'; paquete_id: number; cantidad: string; precio_diario: string };

type AlquilerCatalogoModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productos: ProductoAlquilerComboboxSource[];
    paquetes: PaqueteAlquilerSource[];
    lineasFormulario?: AlquilerLineaForm[];
    onConfirm: (lineas: AlquilerLineaForm[]) => void;
};

function cantidadProductoEnCarrito(carrito: ItemCarrito[], productoId: number, excluirIdx?: number): number {
    return carrito.reduce((sum, item, idx) => {
        if (idx === excluirIdx || item.tipo !== 'producto' || item.producto_id !== productoId) {
            return sum;
        }

        return sum + parseCantidadEntera(item.cantidad);
    }, 0);
}

function cantidadPaqueteEnCarrito(carrito: ItemCarrito[], paqueteId: number, excluirIdx?: number): number {
    return carrito.reduce((sum, item, idx) => {
        if (idx === excluirIdx || item.tipo !== 'paquete' || item.paquete_id !== paqueteId) {
            return sum;
        }

        return sum + parseCantidadEntera(item.cantidad);
    }, 0);
}

export function AlquilerCatalogoModal({
    open,
    onOpenChange,
    productos,
    paquetes,
    lineasFormulario = [],
    onConfirm,
}: AlquilerCatalogoModalProps) {
    const [tab, setTab] = useState<TabCatalogo>('productos');
    const [busqueda, setBusqueda] = useState('');
    const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
    const [errorStock, setErrorStock] = useState<string | null>(null);

    const productoPorId = useMemo(() => new Map(productos.map((p) => [p.id, p])), [productos]);
    const paquetePorId = useMemo(() => new Map(paquetes.map((p) => [p.id, p])), [paquetes]);

    const productosFiltrados = useMemo(() => {
        return productos
            .filter((p) =>
                matchesSearchQuery(
                    [p.nombre, p.codigo, p.marca_nombre, p.categoria_nombre].filter(Boolean).join(' '),
                    busqueda,
                ),
            )
            .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    }, [productos, busqueda]);

    const paquetesFiltrados = useMemo(() => {
        return paquetes
            .filter((p) =>
                matchesSearchQuery(
                    [p.nombre, p.codigo, ...p.productos.map((i) => i.nombre)].join(' '),
                    busqueda,
                ),
            )
            .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    }, [paquetes, busqueda]);

    const maxCantidadProducto = (producto: ProductoAlquilerComboboxSource, cantidadEnEsteItem: number): number => {
        const otrosEnCarrito = cantidadProductoEnCarrito(carrito, producto.id) - cantidadEnEsteItem;

        return disponibleRestanteProducto(
            producto.stock_disponible,
            lineasFormulario,
            producto.id,
            otrosEnCarrito,
        );
    };

    const maxCantidadPaquete = (paquete: PaqueteAlquilerSource, cantidadEnEsteItem: number): number => {
        const otrosEnCarrito = cantidadPaqueteEnCarrito(carrito, paquete.id) - cantidadEnEsteItem;

        return disponibleRestantePaquete(
            paquete.stock_disponible,
            lineasFormulario,
            paquete.id,
            otrosEnCarrito,
        );
    };

    const agregarProducto = (producto: ProductoAlquilerComboboxSource) => {
        setErrorStock(null);
        setCarrito((prev) => {
            const idx = prev.findIndex((i) => i.tipo === 'producto' && i.producto_id === producto.id);
            const cantidadActual = idx >= 0 ? parseCantidadEntera(prev[idx].cantidad) : 0;
            const max = maxCantidadProducto(producto, cantidadActual);

            if (max < 1) {
                setErrorStock(`«${producto.nombre}» no tiene unidades disponibles.`);

                return prev;
            }

            if (idx >= 0) {
                const nueva = Math.min(cantidadActual + 1, max);

                return prev.map((item, i) =>
                    i === idx && item.tipo === 'producto'
                        ? { ...item, cantidad: String(nueva) }
                        : item,
                );
            }

            return [
                ...prev,
                {
                    tipo: 'producto',
                    producto_id: producto.id,
                    cantidad: '1',
                    precio_diario: producto.precio_alquiler_diario,
                },
            ];
        });
    };

    const agregarPaquete = (paquete: PaqueteAlquilerSource) => {
        setErrorStock(null);
        setCarrito((prev) => {
            const idx = prev.findIndex((i) => i.tipo === 'paquete' && i.paquete_id === paquete.id);
            const cantidadActual = idx >= 0 ? parseCantidadEntera(prev[idx].cantidad) : 0;
            const max = maxCantidadPaquete(paquete, cantidadActual);

            if (max < 1) {
                setErrorStock(`«${paquete.nombre}» no tiene unidades disponibles.`);

                return prev;
            }

            if (idx >= 0) {
                const nueva = Math.min(cantidadActual + 1, max);

                return prev.map((item, i) =>
                    i === idx && item.tipo === 'paquete' ? { ...item, cantidad: String(nueva) } : item,
                );
            }

            return [
                ...prev,
                {
                    tipo: 'paquete',
                    paquete_id: paquete.id,
                    cantidad: '1',
                    precio_diario: paquete.precio_alquiler,
                },
            ];
        });
    };

    const actualizarCantidad = (idx: number, cantidad: number) => {
        setErrorStock(null);
        const item = carrito[idx];
        if (!item) {
            return;
        }

        let max = 1;
        if (item.tipo === 'producto') {
            const producto = productoPorId.get(item.producto_id);
            if (!producto) {
                return;
            }
            max = maxCantidadProducto(producto, 0);
        } else {
            const paquete = paquetePorId.get(item.paquete_id);
            if (!paquete) {
                return;
            }
            max = maxCantidadPaquete(paquete, 0);
        }

        const nueva = Math.min(Math.max(1, cantidad), max);
        if (nueva < cantidad) {
            setErrorStock(`Máximo ${max} unidad(es) disponible(s).`);
        }

        setCarrito((prev) =>
            prev.map((row, i) => (i === idx ? { ...row, cantidad: String(nueva) } : row)),
        );
    };

    const quitarItem = (idx: number) => {
        setErrorStock(null);
        setCarrito((prev) => prev.filter((_, i) => i !== idx));
    };

    const carritoExcedeStock = (): string | null =>
        mensajeErrorDemandaStock(lineasFormulario, productos, paquetePorId, carrito);

    const handleConfirm = () => {
        const error = carritoExcedeStock();
        if (error) {
            setErrorStock(error);

            return;
        }

        const lineas: AlquilerLineaForm[] = carrito.map((item) =>
            item.tipo === 'producto'
                ? alquilerLineaFromProducto(item.producto_id, item.precio_diario, item.cantidad)
                : alquilerLineaFromPaquete(item.paquete_id, item.precio_diario, item.cantidad),
        );

        onConfirm(lineas);
        setCarrito([]);
        setBusqueda('');
        setErrorStock(null);
        onOpenChange(false);
    };

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            setCarrito([]);
            setBusqueda('');
            setErrorStock(null);
            setTab('productos');
        }

        onOpenChange(next);
    };

    const totalUnidades = carrito.reduce((s, i) => s + parseCantidadEntera(i.cantidad), 0);

    const etiquetaItem = (item: ItemCarrito): { titulo: string; subtitulo: string; max: number } => {
        if (item.tipo === 'producto') {
            const p = productoPorId.get(item.producto_id);

            return {
                titulo: p?.nombre ?? 'Producto',
                subtitulo: p?.codigo ?? '',
                max: p ? maxCantidadProducto(p, parseCantidadEntera(item.cantidad)) : 1,
            };
        }

        const p = paquetePorId.get(item.paquete_id);

        return {
            titulo: p?.nombre ?? 'Paquete',
            subtitulo: p?.codigo ?? '',
            max: p ? maxCantidadPaquete(p, parseCantidadEntera(item.cantidad)) : 1,
        };
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="flex max-h-[min(92vh,900px)] flex-col gap-0 overflow-hidden rounded-2xl border-0 p-0 sm:max-w-5xl">
                <DialogHeader className="shrink-0 space-y-3 border-b border-border/50 px-5 py-4 text-left sm:px-6">
                    <div className="flex items-center gap-2">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <LayoutGrid className="size-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold">Catálogo de alquiler</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                Elige productos o paquetes. Solo se limita por stock real; la alerta de inventario
                                bajo avisa en la campana, no bloquea el alquiler.
                            </DialogDescription>
                        </div>
                    </div>
                    <div className="flex gap-1 rounded-xl bg-muted/50 p-1">
                        <button
                            type="button"
                            onClick={() => {
                                setTab('productos');
                                setBusqueda('');
                            }}
                            className={cn(
                                'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                tab === 'productos'
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            <Package className="size-4" />
                            Productos
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setTab('paquetes');
                                setBusqueda('');
                            }}
                            className={cn(
                                'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                tab === 'paquetes'
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            <Boxes className="size-4" />
                            Paquetes
                        </button>
                    </div>
                </DialogHeader>

                <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
                    <div className="flex min-h-0 flex-1 flex-col border-b border-border/50 lg:border-b-0 lg:border-r">
                        <div className="shrink-0 p-4 pb-2 sm:px-5">
                            <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    placeholder="Buscar…"
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-5">
                            {tab === 'productos' ? (
                                productosFiltrados.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-muted-foreground">
                                        Ningún producto coincide.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                                        {productosFiltrados.map((producto) => {
                                            const enCarrito = cantidadProductoEnCarrito(carrito, producto.id);
                                            const dispTotal = disponibleRestanteProducto(
                                                producto.stock_disponible,
                                                lineasFormulario,
                                                producto.id,
                                                enCarrito,
                                            );
                                            const sinStock = dispTotal < 1 && enCarrito === 0;

                                            return (
                                                <button
                                                    key={producto.id}
                                                    type="button"
                                                    disabled={sinStock}
                                                    onClick={() => agregarProducto(producto)}
                                                    className={cn(
                                                        'flex flex-col rounded-xl border p-3 text-left transition-[box-shadow,transform,border-color]',
                                                        'hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]',
                                                        enCarrito > 0 &&
                                                            'border-primary bg-primary/5 ring-1 ring-primary/20',
                                                        sinStock && 'cursor-not-allowed opacity-50',
                                                    )}
                                                >
                                                    <span className="line-clamp-2 text-sm font-medium">
                                                        {producto.nombre}
                                                    </span>
                                                    <span className="mt-1 text-xs text-muted-foreground">
                                                        {producto.codigo}
                                                    </span>
                                                    <span className="mt-2 text-sm font-semibold text-primary">
                                                        {fmtQ(producto.precio_alquiler_diario)}/día
                                                    </span>
                                                    <span className="mt-1 text-[10px] text-muted-foreground">
                                                        Disp. {dispTotal} · Total {parseCantidadEntera(producto.stock_alquiler)}
                                                    </span>
                                                    {enCarrito > 0 && (
                                                        <span className="mt-2 inline-flex w-fit rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                                                            ×{enCarrito}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )
                            ) : paquetesFiltrados.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    Ningún paquete coincide.
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {paquetesFiltrados.map((paquete) => {
                                        const enCarrito = cantidadPaqueteEnCarrito(carrito, paquete.id);
                                        const disp = disponibleRestantePaquete(
                                            paquete.stock_disponible,
                                            lineasFormulario,
                                            paquete.id,
                                            enCarrito,
                                        );
                                        const sinStock = disp < 1 && enCarrito === 0;

                                        return (
                                            <button
                                                key={paquete.id}
                                                type="button"
                                                disabled={sinStock}
                                                onClick={() => agregarPaquete(paquete)}
                                                className={cn(
                                                    'flex flex-col rounded-xl border p-3 text-left',
                                                    enCarrito > 0 && 'border-primary bg-primary/5',
                                                    sinStock && 'opacity-50',
                                                )}
                                            >
                                                <span className="font-medium">{paquete.nombre}</span>
                                                <span className="text-xs text-muted-foreground">{paquete.codigo}</span>
                                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                    {paquete.productos
                                                        .map((i) => `${parseCantidadEntera(i.cantidad)}× ${i.nombre}`)
                                                        .join(', ')}
                                                </p>
                                                <span className="mt-2 text-sm font-semibold text-primary">
                                                    {fmtQ(paquete.precio_alquiler)}/día
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    Disp. {disp} paquete(s)
                                                </span>
                                                {enCarrito > 0 && (
                                                    <span className="mt-1 text-xs font-medium text-primary">
                                                        ×{enCarrito} en carrito
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
                            <span className="text-sm font-medium">Seleccionados ({carrito.length})</span>
                        </div>
                        <div className="min-h-[120px] flex-1 overflow-y-auto p-4">
                            {carrito.length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground">
                                    Toca un ítem del catálogo para agregarlo.
                                </p>
                            ) : (
                                <ul className="space-y-3">
                                    {carrito.map((item, idx) => {
                                        const { titulo, subtitulo, max } = etiquetaItem(item);
                                        const cantidad = parseCantidadEntera(item.cantidad);

                                        return (
                                            <li
                                                key={`${item.tipo}-${item.tipo === 'producto' ? item.producto_id : item.paquete_id}`}
                                                className="rounded-xl border border-border/50 bg-card p-3 shadow-sm"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="text-sm font-medium">{titulo}</p>
                                                        <p className="text-xs text-muted-foreground">{subtitulo}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Máx. {max} disponible(s)
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-7 text-destructive"
                                                        onClick={() => quitarItem(idx)}
                                                    >
                                                        <X className="size-4" />
                                                    </Button>
                                                </div>
                                                <div className="mt-3 flex items-center gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="size-8"
                                                        disabled={cantidad <= 1}
                                                        onClick={() => actualizarCantidad(idx, cantidad - 1)}
                                                    >
                                                        <Minus className="size-3" />
                                                    </Button>
                                                    <Input
                                                        type="number"
                                                        step="1"
                                                        min={1}
                                                        max={max}
                                                        value={item.cantidad}
                                                        onChange={(e) =>
                                                            actualizarCantidad(
                                                                idx,
                                                                parseCantidadEntera(e.target.value),
                                                            )
                                                        }
                                                        className="h-8 text-center"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="size-8"
                                                        disabled={cantidad >= max}
                                                        onClick={() => actualizarCantidad(idx, cantidad + 1)}
                                                    >
                                                        <Plus className="size-3" />
                                                    </Button>
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
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                            {carrito.length > 0
                                ? `${carrito.length} ítem(s) · ${totalUnidades} unidad(es)`
                                : 'Sin ítems en el carrito'}
                        </p>
                        {errorStock && (
                            <p className="text-sm font-medium text-destructive">{errorStock}</p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="success"
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
