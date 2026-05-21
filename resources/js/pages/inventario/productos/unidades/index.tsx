import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2, Pencil, Wrench, X, Check } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { Badge } from '@/components/ui/badge';
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
import AppLayout from '@/layouts/app-layout';
import { show } from '@/routes/productos';
import { index as unidadesIndex, store as unidadesStore } from '@/routes/productos/unidades';
import { update as unidadUpdate, destroy as unidadDestroy } from '@/routes/unidades';
import { create as crearMantenimiento } from '@/routes/mantenimientos';
import type { BreadcrumbItem } from '@/types';

interface Producto {
    id: number;
    nombre: string;
    codigo: string;
    categoria: { nombre: string } | null;
    marca: { nombre: string } | null;
}

interface EstadoOption {
    value: string;
    label: string;
    color: string;
}

interface Unidad {
    id: number;
    codigo: string;
    estado: string;
    notas: string | null;
}

const colorMap: Record<string, string> = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

function EstadoBadge({ estado, estados }: { estado: string; estados: EstadoOption[] }) {
    const opt = estados.find((e) => e.value === estado);
    if (!opt) return <span>{estado}</span>;
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorMap[opt.color] ?? colorMap.gray}`}>
            {opt.label}
        </span>
    );
}

export default function ProductoUnidadesIndex({
    producto,
    unidades,
    estados,
}: {
    producto: Producto;
    unidades: Unidad[];
    estados: EstadoOption[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Productos', href: show.url({ producto: producto.id }) },
        { title: producto.nombre, href: show.url({ producto: producto.id }) },
        { title: 'Unidades', href: unidadesIndex.url({ producto: producto.id }) },
    ];
    const { confirm, dialog } = useConfirmDialog();

    const [editingId, setEditingId] = useState<number | null>(null);
    const [useGenerate, setUseGenerate] = useState(true);

    const storeForm = useForm({
        codigo: '',
        cantidad_generar: '1',
        notas: '',
    });

    const editForm = useForm({
        codigo: '',
        estado: '',
        notas: '',
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = useGenerate
            ? { cantidad_generar: storeForm.data.cantidad_generar, notas: storeForm.data.notas }
            : { codigo: storeForm.data.codigo, notas: storeForm.data.notas };

        storeForm.transform(() => payload);
        storeForm.post(unidadesStore.url({ producto: producto.id }), {
            onSuccess: () => storeForm.reset(),
        });
    };

    const startEdit = (u: Unidad) => {
        setEditingId(u.id);
        editForm.setData({ codigo: u.codigo, estado: u.estado, notas: u.notas ?? '' });
    };

    const saveEdit = (u: Unidad) => {
        editForm.put(unidadUpdate.url({ unidade: u.id }), {
            onSuccess: () => setEditingId(null),
        });
    };

    const deleteUnidad = (u: Unidad) => {
        confirm({
            title: `¿Eliminar unidad ${u.codigo}?`,
            description: 'Se eliminará esta unidad del producto. Esta acción no se puede deshacer.',
            confirmLabel: 'Eliminar unidad',
            onConfirm: () => router.delete(unidadDestroy.url({ unidade: u.id })),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {dialog}
            <Head title={`Unidades — ${producto.nombre}`} />
            <div className="faro-page">
                <div className="flex items-center gap-3">
                    <IconActionTooltip label="Volver a la ficha del producto">
                        <Button variant="ghost" size="icon" className="size-9 rounded-xl hover:bg-muted" asChild>
                            <Link href={show.url({ producto: producto.id })}>
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                    </IconActionTooltip>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">
                            Unidades — {producto.nombre}
                        </h1>
                        <p className="text-sm text-muted-foreground">{producto.codigo}</p>
                    </div>
                </div>

                {/* Resumen de estados */}
                <div className="flex flex-wrap gap-3">
                    {estados.map((e) => {
                        const count = unidades.filter((u) => u.estado === e.value).length;
                        return (
                            <div key={e.value} className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
                                <span className={`size-2 rounded-full ${colorMap[e.color]?.split(' ')[0] ?? 'bg-gray-300'}`} />
                                <span className="text-sm text-muted-foreground">{e.label}</span>
                                <span className="text-sm font-semibold">{count}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Agregar unidades */}
                <div className="rounded-xl border border-border bg-card p-5">
                    <p className="mb-4 text-sm font-medium">Agregar unidades</p>
                    <div className="mb-3 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setUseGenerate(true)}
                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${useGenerate ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
                        >
                            Generar automáticamente
                        </button>
                        <button
                            type="button"
                            onClick={() => setUseGenerate(false)}
                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${!useGenerate ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
                        >
                            Código manual
                        </button>
                    </div>
                    <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
                        {useGenerate ? (
                            <div className="space-y-1.5">
                                <Label htmlFor="cantidad_generar">Cantidad</Label>
                                <Input
                                    id="cantidad_generar"
                                    type="number"
                                    min="1"
                                    max="500"
                                    className="w-28"
                                    value={storeForm.data.cantidad_generar}
                                    onChange={(e) => storeForm.setData('cantidad_generar', e.target.value)}
                                />
                                <InputError message={storeForm.errors.cantidad_generar} />
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <Label htmlFor="codigo_nuevo">Código</Label>
                                <Input
                                    id="codigo_nuevo"
                                    className="w-48"
                                    value={storeForm.data.codigo}
                                    onChange={(e) => storeForm.setData('codigo', e.target.value)}
                                    placeholder="AND-001"
                                />
                                <InputError message={storeForm.errors.codigo} />
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <Label htmlFor="notas_nueva">Notas (opcional)</Label>
                            <Input
                                id="notas_nueva"
                                className="w-56"
                                value={storeForm.data.notas}
                                onChange={(e) => storeForm.setData('notas', e.target.value)}
                                placeholder="Observaciones"
                            />
                        </div>
                        <Button type="submit" disabled={storeForm.processing} className="gap-1.5">
                            <Plus className="size-4" />
                            {useGenerate ? 'Generar' : 'Agregar'}
                        </Button>
                    </form>
                </div>

                {/* Tabla de unidades */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    {unidades.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
                            <p className="font-medium">Sin unidades registradas</p>
                            <p className="text-sm">Usa el formulario de arriba para agregar unidades físicas.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-muted/40">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Código</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Notas</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {unidades.map((u) =>
                                    editingId === u.id ? (
                                        <tr key={u.id} className="bg-muted/20">
                                            <td className="px-4 py-2">
                                                <Input
                                                    value={editForm.data.codigo}
                                                    onChange={(e) => editForm.setData('codigo', e.target.value)}
                                                    className="h-8 w-36"
                                                />
                                                <InputError message={editForm.errors.codigo} />
                                            </td>
                                            <td className="px-4 py-2">
                                                <Select value={editForm.data.estado} onValueChange={(v) => editForm.setData('estado', v)}>
                                                    <SelectTrigger className="h-8 w-40">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {estados.map((e) => (
                                                            <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={editForm.errors.estado} />
                                            </td>
                                            <td className="px-4 py-2">
                                                <Input
                                                    value={editForm.data.notas}
                                                    onChange={(e) => editForm.setData('notas', e.target.value)}
                                                    className="h-8 w-56"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <IconActionTooltip label="Guardar">
                                                        <Button variant="ghost" size="icon" className="size-8" onClick={() => saveEdit(u)} disabled={editForm.processing}>
                                                            <Check className="size-4 text-green-600" />
                                                        </Button>
                                                    </IconActionTooltip>
                                                    <IconActionTooltip label="Cancelar">
                                                        <Button variant="ghost" size="icon" className="size-8" onClick={() => setEditingId(null)}>
                                                            <X className="size-4" />
                                                        </Button>
                                                    </IconActionTooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-mono text-xs font-medium">{u.codigo}</td>
                                            <td className="px-4 py-3">
                                                <EstadoBadge estado={u.estado} estados={estados} />
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{u.notas ?? '—'}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <IconActionTooltip label="Editar">
                                                        <Button variant="ghost" size="icon" className="size-8" onClick={() => startEdit(u)}>
                                                            <Pencil className="size-4" />
                                                        </Button>
                                                    </IconActionTooltip>
                                                    <IconActionTooltip label="Agregar mantenimiento">
                                                        <Button variant="ghost" size="icon" className="size-8" asChild>
                                                            <Link href={crearMantenimiento.url({ mergeQuery: { unidad_id: u.id } })}>
                                                                <Wrench className="size-4" />
                                                            </Link>
                                                        </Button>
                                                    </IconActionTooltip>
                                                    {u.estado === 'disponible' && (
                                                        <IconActionTooltip label="Eliminar">
                                                            <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => deleteUnidad(u)}>
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </IconActionTooltip>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
