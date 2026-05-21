import { Package, Search } from 'lucide-react';
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

export type UnidadCatalogItem = {
    id: number;
    codigo: string;
    estado_label: string;
    producto_nombre: string | null;
    producto_codigo: string | null;
};

type UnidadCatalogPickerModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    unidades: UnidadCatalogItem[];
    onSelect: (unidadId: number) => void;
    selectedId?: number | null;
};

export function UnidadCatalogPickerModal({
    open,
    onOpenChange,
    unidades,
    onSelect,
    selectedId = null,
}: UnidadCatalogPickerModalProps) {
    const [busqueda, setBusqueda] = useState('');

    const unidadesFiltradas = useMemo(() => {
        const filtradas = unidades.filter((unidad) =>
            matchesSearchQuery(
                [unidad.codigo, unidad.producto_nombre, unidad.producto_codigo, unidad.estado_label]
                    .filter(Boolean)
                    .join(' '),
                busqueda,
            ),
        );

        return filtradas.sort((a, b) => a.codigo.localeCompare(b.codigo, 'es'));
    }, [unidades, busqueda]);

    const handleSelect = (unidadId: number) => {
        onSelect(unidadId);
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
                            <Package className="size-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold">Unidades físicas</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                Toca una unidad para asociarla. Pasará a estado «En mantenimiento».
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
                            placeholder="Buscar por código, producto o estado…"
                            className="pl-9"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 sm:px-5">
                    {unidadesFiltradas.length === 0 ? (
                        <p className="py-10 text-center text-sm text-muted-foreground">
                            Ninguna unidad coincide con la búsqueda.
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                            {unidadesFiltradas.map((unidad) => {
                                const seleccionada = selectedId === unidad.id;

                                return (
                                    <button
                                        key={unidad.id}
                                        type="button"
                                        onClick={() => handleSelect(unidad.id)}
                                        className={cn(
                                            'flex flex-col rounded-xl border p-3 text-left transition-[box-shadow,transform,border-color]',
                                            'hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm active:scale-[0.98]',
                                            seleccionada &&
                                                'border-primary bg-primary/5 ring-1 ring-primary/20',
                                        )}
                                    >
                                        <span className="text-sm font-semibold text-foreground">
                                            {unidad.codigo}
                                        </span>
                                        <span className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                            {unidad.producto_nombre ?? 'Sin producto'}
                                            {unidad.producto_codigo
                                                ? ` (${unidad.producto_codigo})`
                                                : ''}
                                        </span>
                                        <span className="mt-2 inline-flex w-fit rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                            {unidad.estado_label}
                                        </span>
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
