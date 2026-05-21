import { LayoutGrid, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { matchesSearchQuery } from '@/lib/search-text';
import { cn } from '@/lib/utils';

export type ProductCatalogItem = {
    id: number;
    nombre: string;
    codigo: string;
    marca_nombre?: string | null;
    categoria_nombre?: string | null;
    detalle?: string | null;
};

type ProductCatalogPickerModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productos: ProductCatalogItem[];
    onSelect: (productoId: number) => void;
    title?: string;
    description?: string;
    selectedId?: number | null;
};

export function ProductCatalogPickerModal({
    open,
    onOpenChange,
    productos,
    onSelect,
    title = 'Catálogo de productos',
    description = 'Toca un producto para seleccionarlo.',
    selectedId = null,
}: ProductCatalogPickerModalProps) {
    const [busqueda, setBusqueda] = useState('');

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

    const handleSelect = (productoId: number) => {
        onSelect(productoId);
        setBusqueda('');
        onOpenChange(false);
    };

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            setBusqueda('');
        }

        onOpenChange(next);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="flex max-h-[min(90vh,820px)] flex-col gap-0 overflow-hidden rounded-2xl border-0 p-0 sm:max-w-3xl">
                <DialogHeader className="shrink-0 space-y-1 border-b border-border/50 px-5 py-4 text-left sm:px-6">
                    <div className="flex items-center gap-2">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <LayoutGrid className="size-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                {description}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

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

                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 sm:px-5">
                    {productosFiltrados.length === 0 ? (
                        <p className="py-10 text-center text-sm text-muted-foreground">
                            Ningún producto coincide con la búsqueda.
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                            {productosFiltrados.map((producto) => {
                                const seleccionado = selectedId === producto.id;

                                return (
                                    <button
                                        key={producto.id}
                                        type="button"
                                        onClick={() => handleSelect(producto.id)}
                                        className={cn(
                                            'flex flex-col rounded-xl border p-3 text-left transition-[box-shadow,transform,border-color]',
                                            'hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm active:scale-[0.98]',
                                            seleccionado &&
                                                'border-primary bg-primary/5 ring-1 ring-primary/20',
                                        )}
                                    >
                                        <span className="line-clamp-2 text-sm leading-snug font-medium text-foreground">
                                            {producto.nombre}
                                        </span>
                                        <span className="mt-1 text-xs text-muted-foreground">
                                            {producto.codigo}
                                        </span>
                                        {(producto.marca_nombre || producto.categoria_nombre) && (
                                            <span className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                                {[producto.marca_nombre, producto.categoria_nombre]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </span>
                                        )}
                                        {producto.detalle && (
                                            <span className="mt-2 text-xs font-medium text-primary">
                                                {producto.detalle}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
