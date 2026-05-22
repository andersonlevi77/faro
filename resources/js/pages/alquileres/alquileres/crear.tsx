import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';
import InputError from '@/components/input-error';
import { AlquilerLineasEditor } from '@/components/alquiler-lineas-editor';
import { SearchableCombobox } from '@/components/searchable-combobox';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import {
    type PaqueteAlquilerSource,
} from '@/components/alquiler-lineas-editor';
import {
    clienteComboboxOptions,
    type ClienteComboboxSource,
    type ProductoAlquilerComboboxSource,
} from '@/lib/combobox-options';
import { diasContratoPrevistos, totalAlquilerEstimadoDesdeLineas } from '@/lib/alquiler-totales';
import { fmtQ } from '@/lib/utils';
import { create, index, store } from '@/routes/alquileres';
import { emptyAlquilerLinea } from '@/types/alquiler-linea';
import type { BreadcrumbItem } from '@/types';

export default function AlquileresCrear({
    clientes,
    productosAlquiler,
    paquetesAlquiler = [],
}: {
    clientes: ClienteComboboxSource[];
    productosAlquiler: ProductoAlquilerComboboxSource[];
    paquetesAlquiler?: PaqueteAlquilerSource[];
}) {
    const clienteOptions = useMemo(() => clienteComboboxOptions(clientes), [clientes]);
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Alquileres', href: index.url() },
        { title: 'Nuevo', href: create.url() },
    ];

    const { confirm, dialog } = useConfirmDialog();

    const { data, setData, post, processing, errors } = useForm({
        cliente_id: '' as number | '',
        fecha_inicio_prevista: '',
        fecha_fin_prevista: '',
        deposito_monto: '',
        notas: '',
        lineas: [emptyAlquilerLinea()],
    });

    const productoPrecioMap = useMemo(() => {
        const m = new Map<number, string>();
        for (const p of productosAlquiler) {
            m.set(p.id, p.precio_alquiler_diario);
        }
        return m;
    }, [productosAlquiler]);

    const diasContrato = useMemo(
        () => diasContratoPrevistos(data.fecha_inicio_prevista, data.fecha_fin_prevista),
        [data.fecha_inicio_prevista, data.fecha_fin_prevista],
    );

    const totalAlquilerEstimado = useMemo(
        () =>
            totalAlquilerEstimadoDesdeLineas(
                data.fecha_inicio_prevista,
                data.fecha_fin_prevista,
                data.lineas,
                productoPrecioMap,
            ),
        [data.fecha_inicio_prevista, data.fecha_fin_prevista, data.lineas, productoPrecioMap],
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {dialog}
            <Head title="Nuevo alquiler" />
            <div className="faro-page">
                <div className="flex items-center gap-3">
                    <IconActionTooltip label="Volver a la lista de alquileres">
                        <Button variant="ghost" size="icon" className="size-9 rounded-xl hover:bg-muted" asChild>
                            <Link href={index.url()}>
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                    </IconActionTooltip>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">Nuevo alquiler</h1>
                </div>
                <form onSubmit={handleSubmit} className="faro-form-card">
                    <div className="faro-form-grid sm:grid-cols-3">
                        <div className="faro-field sm:col-span-3">
                            <Label htmlFor="cliente_id">Cliente *</Label>
                            <SearchableCombobox
                                id="cliente_id"
                                required
                                value={data.cliente_id}
                                onValueChange={(id) => setData('cliente_id', id)}
                                options={clienteOptions}
                                placeholder="Buscar por nombre, NIT o teléfono…"
                                emptyMessage="Ningún cliente coincide con la búsqueda"
                            />
                            <InputError message={errors.cliente_id} />
                        </div>
                        <div className="faro-field">
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
                        <div className="faro-field">
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
                        <div className="faro-field">
                            <Label htmlFor="deposito_monto">
                                Garantía{' '}
                                <span className="font-normal normal-case text-muted-foreground">(opcional)</span>
                            </Label>
                            <Input
                                id="deposito_monto"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.deposito_monto}
                                onChange={(e) => setData('deposito_monto', e.target.value)}
                                placeholder="0 — sin garantía"
                            />
                            <p className="text-xs leading-snug text-muted-foreground">
                                Monto de garantía aparte del precio del alquiler; déjalo en 0 o vacío si no aplica. Si lo registras,
                                el saldo a cobrar incluye alquiler + este monto.
                            </p>
                            <InputError message={errors.deposito_monto} />
                        </div>
                        <div className="faro-field sm:col-span-3">
                            <Label htmlFor="notas">Notas</Label>
                            <Input id="notas" value={data.notas} onChange={(e) => setData('notas', e.target.value)} />
                            <InputError message={errors.notas} />
                        </div>
                    </div>

                    <AlquilerLineasEditor
                        lineas={data.lineas}
                        onLineasChange={(lineas) => setData('lineas', lineas)}
                        productosAlquiler={productosAlquiler}
                        paquetesAlquiler={paquetesAlquiler}
                        errors={errors as Record<string, string>}
                        onConfirmRemove={(_idx, onConfirm) =>
                            confirm({
                                title: '¿Quitar esta línea?',
                                description: 'La línea se eliminará antes de guardar.',
                                confirmLabel: 'Quitar línea',
                                variant: 'destructive',
                                onConfirm,
                            })
                        }
                    />

                    <div className="rounded-2xl border border-primary/25 bg-primary/5 px-4 py-4 shadow-sm">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-primary/90">
                                    Total del alquiler (estimado)
                                </p>
                                <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-foreground">
                                    {fmtQ(totalAlquilerEstimado)}
                                </p>
                            </div>
                            {diasContrato > 0 && (
                                <p className="text-sm text-muted-foreground">
                                    {diasContrato} {diasContrato === 1 ? 'día' : 'días'} × líneas (cantidad × precio/día). No incluye la garantía opcional.
                                </p>
                            )}
                        </div>
                        {diasContrato === 0 && (
                            <p className="mt-2 text-xs text-muted-foreground">
                                Completa las fechas de inicio y fin para calcular el total.
                            </p>
                        )}
                    </div>

                    <div className="faro-form-actions">
                        <Button type="submit" variant="success" disabled={processing} className="faro-btn-primary">
                            Crear alquiler
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href={index.url()}>Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
