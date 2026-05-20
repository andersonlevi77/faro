import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { create, destroy, edit, index, show } from '@/routes/clientes';
import type { BreadcrumbItem } from '@/types';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ClienteRow {
    id: number;
    nombre: string;
    documento: string | null;
    email: string | null;
    telefono: string | null;
    ciudad: string | null;
    alquileres_count: number;
}

interface Puntaje {
    puntuacion: number;
    etiqueta: string;
}

interface Paginated {
    data: ClienteRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

const SCORE_COLOR: Record<string, string> = {
    Excelente: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    Bueno: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    Regular: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    Bajo: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export default function ClientesIndex({
    clientes,
    filters,
    puntajes,
}: {
    clientes: Paginated;
    filters: { buscar?: string };
    puntajes: Record<number, Puntaje>;
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Alquileres', href: index.url() },
        { title: 'Clientes', href: index.url() },
    ];

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const buscar = (form.elements.namedItem('buscar') as HTMLInputElement)?.value;
        router.get(index.url(), { buscar: buscar || undefined }, { preserveState: true });
    };

    const handleDestroy = (id: number) => {
        if (confirm('¿Eliminar este cliente?')) {
            router.delete(destroy.url({ cliente: id }));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clientes" />
            <div className="flex h-full flex-1 flex-col gap-5 p-4 md:p-5">
                <Card className="shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                    <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0 pb-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Users className="size-4" />
                                </span>
                                Clientes
                            </CardTitle>
                            <CardDescription className="mt-1">Personas u organizaciones que alquilan equipo.</CardDescription>
                        </div>
                        <Button asChild className="shrink-0">
                            <Link href={create.url()}>
                                <Plus className="mr-2 size-4" />
                                Nuevo cliente
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
                                    placeholder="Buscar por nombre, documento, email..."
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
                                        <th className="px-4 py-3 text-left font-medium">Nombre</th>
                                        <th className="px-4 py-3 text-left font-medium">Documento</th>
                                        <th className="px-4 py-3 text-left font-medium">Contacto</th>
                                        <th className="px-4 py-3 text-right font-medium">Alquileres</th>
                                        <th className="px-4 py-3 text-left font-medium">Puntuación</th>
                                        <th className="w-[100px] px-4 py-3 text-left font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientes.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                                                No hay clientes. Crea el primero.
                                            </td>
                                        </tr>
                                    ) : (
                                        clientes.data.map((c) => {
                                            const puntaje = puntajes[c.id];
                                            return (
                                                <tr key={c.id} className="border-b border-border/30">
                                                    <td className="px-4 py-3 font-medium text-foreground">{c.nombre}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{c.documento ?? '—'}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {[c.email, c.telefono].filter(Boolean).join(' · ') || '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right tabular-nums">{c.alquileres_count}</td>
                                                    <td className="px-4 py-3">
                                                        {puntaje && (
                                                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${SCORE_COLOR[puntaje.etiqueta] ?? ''}`}>
                                                                {puntaje.puntuacion} — {puntaje.etiqueta}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-1">
                                                            <IconActionTooltip label="Ver ficha del cliente">
                                                                <Button variant="ghost" size="icon" className="size-8" asChild>
                                                                    <Link href={show.url({ cliente: c.id })}>
                                                                        <span className="sr-only">Ver</span>
                                                                        <Users className="size-4" />
                                                                    </Link>
                                                                </Button>
                                                            </IconActionTooltip>
                                                            <IconActionTooltip label="Editar cliente">
                                                                <Button variant="ghost" size="icon" className="size-8" asChild>
                                                                    <Link href={edit.url({ cliente: c.id })}>
                                                                        <span className="sr-only">Editar</span>
                                                                        <Pencil className="size-4" />
                                                                    </Link>
                                                                </Button>
                                                            </IconActionTooltip>
                                                            <IconActionTooltip label="Eliminar cliente">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="size-8 text-destructive hover:text-destructive"
                                                                    type="button"
                                                                    onClick={() => handleDestroy(c.id)}
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                </Button>
                                                            </IconActionTooltip>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {clientes.last_page > 1 && (
                            <div className="flex flex-wrap justify-center gap-1">
                                {clientes.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className="min-w-[2rem]"
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
