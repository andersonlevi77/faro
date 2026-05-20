import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import InputError from '@/components/input-error';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { edit, index, update } from '@/routes/alquileres';
import type { BreadcrumbItem } from '@/types';

interface ClienteOpt {
    id: number;
    nombre: string;
    documento: string | null;
}

interface ProductoAlq {
    id: number;
    nombre: string;
    codigo: string;
    stock_alquiler: string;
    precio_alquiler_diario: string;
}

interface LineaForm {
    producto_id: number | '';
    cantidad: string;
}

interface Linea {
    id: number;
    producto_id: number;
    cantidad: string;
}

interface Alquiler {
    id: number;
    codigo: string;
    cliente_id: number;
    fecha_inicio_prevista: string;
    fecha_fin_prevista: string;
    deposito_monto: string;
    notas: string | null;
    lineas: Linea[];
}

export default function AlquileresEditar({
    alquiler,
    clientes,
    productosAlquiler,
}: {
    alquiler: Alquiler;
    clientes: ClienteOpt[];
    productosAlquiler: ProductoAlq[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Alquileres', href: index.url() },
        { title: alquiler.codigo, href: edit.url({ alquiler: alquiler.id }) },
    ];

    const { data, setData, put, processing, errors } = useForm({
        cliente_id: alquiler.cliente_id,
        fecha_inicio_prevista: alquiler.fecha_inicio_prevista.slice(0, 10),
        fecha_fin_prevista: alquiler.fecha_fin_prevista.slice(0, 10),
        deposito_monto: alquiler.deposito_monto,
        notas: alquiler.notas ?? '',
        lineas: alquiler.lineas.map((l) => ({
            producto_id: l.producto_id,
            cantidad: l.cantidad,
        })) as LineaForm[],
    });

    const addLinea = () => {
        setData('lineas', [...data.lineas, { producto_id: '', cantidad: '1' }]);
    };

    const removeLinea = (idx: number) => {
        setData(
            'lineas',
            data.lineas.filter((_, i) => i !== idx),
        );
    };

    const updateLinea = (idx: number, patch: Partial<LineaForm>) => {
        const next = data.lineas.map((l, i) => (i === idx ? { ...l, ...patch } : l));
        setData('lineas', next);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(update.url({ alquiler: alquiler.id }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${alquiler.codigo}`} />
            <div className="flex h-full flex-1 flex-col gap-5 p-4 md:p-5">
                <div className="flex items-center gap-3">
                    <IconActionTooltip label="Volver a la lista de alquileres">
                        <Button variant="ghost" size="icon" className="size-9 rounded-lg hover:bg-accent" asChild>
                            <Link href={index.url()}>
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                    </IconActionTooltip>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">Editar {alquiler.codigo}</h1>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="w-full space-y-6 rounded-xl bg-card p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="cliente_id">Cliente *</Label>
                            <select
                                id="cliente_id"
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={String(data.cliente_id)}
                                onChange={(e) => setData('cliente_id', Number(e.target.value))}
                            >
                                {clientes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nombre}
                                        {c.documento ? ` · ${c.documento}` : ''}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.cliente_id} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fecha_inicio_prevista">Inicio previsto *</Label>
                            <Input
                                id="fecha_inicio_prevista"
                                type="date"
                                required
                                value={data.fecha_inicio_prevista}
                                onChange={(e) => setData('fecha_inicio_prevista', e.target.value)}
                            />
                            <InputError message={errors.fecha_inicio_prevista} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fecha_fin_prevista">Fin previsto *</Label>
                            <Input
                                id="fecha_fin_prevista"
                                type="date"
                                required
                                value={data.fecha_fin_prevista}
                                onChange={(e) => setData('fecha_fin_prevista', e.target.value)}
                            />
                            <InputError message={errors.fecha_fin_prevista} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="deposito_monto">Depósito</Label>
                            <Input
                                id="deposito_monto"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.deposito_monto}
                                onChange={(e) => setData('deposito_monto', e.target.value)}
                            />
                            <InputError message={errors.deposito_monto} />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="notas">Notas</Label>
                            <Input id="notas" value={data.notas} onChange={(e) => setData('notas', e.target.value)} />
                            <InputError message={errors.notas} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <Label className="text-base">Líneas *</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addLinea}>
                                <Plus className="mr-1 size-4" />
                                Añadir línea
                            </Button>
                        </div>
                        <InputError message={errors.lineas as string} />
                        <div className="space-y-3">
                            {data.lineas.map((linea, idx) => (
                                <div
                                    key={idx}
                                    className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/10 p-4 sm:flex-row sm:items-end"
                                >
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <Label>Producto</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={linea.producto_id === '' ? '' : String(linea.producto_id)}
                                            onChange={(e) =>
                                                updateLinea(
                                                    idx,
                                                    e.target.value === '' ? { producto_id: '' } : { producto_id: Number(e.target.value) },
                                                )
                                            }
                                        >
                                            <option value="">Seleccionar</option>
                                            {productosAlquiler.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.nombre} (stock {p.stock_alquiler})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-full space-y-2 sm:w-32">
                                        <Label>Cantidad</Label>
                                        <Input
                                            type="number"
                                            step="0.001"
                                            min="0.001"
                                            value={linea.cantidad}
                                            onChange={(e) => updateLinea(idx, { cantidad: e.target.value })}
                                        />
                                    </div>
                                    <IconActionTooltip
                                        label={
                                            data.lineas.length <= 1
                                                ? 'Debe existir al menos una línea'
                                                : 'Quitar esta línea del alquiler'
                                        }
                                    >
                                        <span className="inline-flex shrink-0">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="shrink-0 text-destructive"
                                                disabled={data.lineas.length <= 1}
                                                onClick={() => removeLinea(idx)}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </span>
                                    </IconActionTooltip>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                        <Button type="submit" disabled={processing}>
                            Guardar cambios
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href={index.url()}>Volver al listado</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
