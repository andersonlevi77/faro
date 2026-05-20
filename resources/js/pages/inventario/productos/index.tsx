import { Head, Link, router } from '@inertiajs/react';
import { Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { create, destroy, edit, index } from '@/routes/productos';
import type { BreadcrumbItem } from '@/types';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Producto {
    id: number;
    nombre: string;
    codigo: string;
    codigo_barras: string | null;
    precio_venta: string;
    activo: boolean;
    categoria?: { id: number; nombre: string } | null;
    marca?: { id: number; nombre: string } | null;
    presentacion?: { id: number; nombre: string } | null;
}

interface PaginatedProductos {
    data: Producto[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export default function ProductosIndex({
    productos,
    filters,
}: {
    productos: PaginatedProductos;
    filters: { buscar?: string };
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inventario', href: index.url() },
        { title: 'Productos', href: index.url() },
    ];

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const buscar = (form.elements.namedItem('buscar') as HTMLInputElement)?.value;
        router.get(index.url(), { buscar: buscar || undefined }, { preserveState: true });
    };

    const handleDestroy = (id: number) => {
        if (confirm('¿Eliminar este producto?')) {
            router.delete(destroy.url({ producto: id }));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Productos" />
            <div className="flex h-full flex-1 flex-col gap-5 p-4 md:p-5">
                <Card className="shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                    <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0 pb-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Package className="size-4" />
                                </span>
                                Productos
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Catálogo de productos del inventario
                            </CardDescription>
                        </div>
                        <Button asChild className="shrink-0">
                            <Link href={create.url()}>
                                <Plus className="mr-2 size-4" />
                                Nuevo producto
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
                            <div className="relative min-w-0 flex-1">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input
                                    name="buscar"
                                    defaultValue={filters?.buscar}
                                    placeholder="Buscar por nombre, código o código de barras..."
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Buscar
                            </Button>
                        </form>
                        <div className="overflow-x-auto rounded-lg bg-muted/20">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/40 bg-muted/30">
                                        <th className="px-4 py-3 text-left font-medium text-foreground">Código</th>
                                        <th className="px-4 py-3 text-left font-medium text-foreground">Nombre</th>
                                        <th className="px-4 py-3 text-left font-medium text-foreground">Categoría</th>
                                        <th className="px-4 py-3 text-left font-medium text-foreground">Precio venta</th>
                                        <th className="px-4 py-3 text-left font-medium text-foreground">Estado</th>
                                        <th className="w-[120px] px-4 py-3 text-left font-medium text-foreground">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productos.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-10 text-center text-muted-foreground"
                                            >
                                                No hay productos. Crea el primero desde «Nuevo producto».
                                            </td>
                                        </tr>
                                    ) : (
                                        productos.data.map((p) => (
                                            <tr
                                                key={p.id}
                                                className="border-b border-border/30 last:border-0 transition-colors hover:bg-muted/25"
                                            >
                                                <td className="px-4 py-3 font-mono text-muted-foreground">{p.codigo}</td>
                                                <td className="px-4 py-3 font-medium text-foreground">{p.nombre}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{p.categoria?.nombre ?? '—'}</td>
                                                <td className="px-4 py-3 tabular-nums text-foreground">{p.precio_venta}</td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={
                                                            p.activo
                                                                ? 'font-medium text-primary'
                                                                : 'text-muted-foreground'
                                                        }
                                                    >
                                                        {p.activo ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1">
                                                        <IconActionTooltip label="Editar producto">
                                                            <Button variant="ghost" size="icon" className="size-8 rounded-md hover:bg-accent" asChild>
                                                                <Link href={edit.url({ producto: p.id })}>
                                                                    <Pencil className="size-4" />
                                                                </Link>
                                                            </Button>
                                                        </IconActionTooltip>
                                                        <IconActionTooltip label="Eliminar producto">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-8 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                                onClick={() => handleDestroy(p.id)}
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </IconActionTooltip>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {productos.last_page > 1 && (
                            <div className="flex flex-wrap items-center justify-center gap-1">
                                {productos.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url ?? '#'}
                                        className={
                                            link.active
                                                ? 'rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground'
                                                : 'rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                        }
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
