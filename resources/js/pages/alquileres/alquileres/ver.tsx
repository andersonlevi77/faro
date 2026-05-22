import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import estado from '@/routes/alquileres/estado';
import pagosRoutes from '@/routes/alquileres/pagos';
import { edit, index, show } from '@/routes/alquileres';
import type { BreadcrumbItem } from '@/types';
import { AlquilerEstadoPanel } from '@/components/alquiler-estado-panel';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fmtFecha, fmtFechaHora, fmtRangoFechas } from '@/lib/dates';
import { badgeEstadoAlquiler, dotEstadoAlquiler } from '@/lib/estado-alquiler';
import { cn, fmtQ } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductoMini {
    id: number;
    nombre: string;
    codigo: string;
}

interface PaqueteMini {
    id: number;
    nombre: string;
    codigo: string;
}

interface Linea {
    id: number;
    cantidad: string;
    dias: number;
    precio_diario: string;
    subtotal: string;
    producto?: ProductoMini | null;
    paquete?: PaqueteMini | null;
}

interface Pago {
    id: number;
    tipo: string;
    monto: string;
    metodo_pago: string;
    notas: string | null;
    created_at: string;
    registrado_por?: { id: number; name: string } | null;
}

interface Alquiler {
    id: number;
    codigo: string;
    estado: string;
    fecha_inicio_prevista: string;
    fecha_fin_prevista: string;
    fecha_entrega_at: string | null;
    fecha_devolucion_at: string | null;
    deposito_monto: string;
    total: string;
    notas: string | null;
    danio_descripcion: string | null;
    danio_monto: string;
    deposito_devuelto: string | null;
    cliente?: { id: number; nombre: string; documento: string | null } | null;
    usuario?: { id: number; name: string } | null;
    lineas: Linea[];
    pagos: Pago[];
}

interface Resumen {
    total_alquiler: string;
    deposito: string;
    total_cobrado: string;
    total_devuelto: string;
    saldo_pendiente: string;
}

interface OpcionSelect {
    value: string;
    label: string;
}

interface EstadoInfo {
    value: string;
    label: string;
    color: string;
}

interface HistorialEstado {
    id: number;
    estado_anterior: string | null;
    estado_anterior_label: string | null;
    estado_anterior_color: string | null;
    estado_nuevo: string;
    estado_nuevo_label: string;
    estado_nuevo_color: string;
    usuario: { name: string } | null;
    created_at: string;
}

export default function AlquileresVer({
    alquiler,
    estadoActual,
    flujoPrincipal,
    historialEstados,
    transicionesPermitidas,
    puedeEditar,
    puedeCambiarEstado,
    puedeCobrar,
    resumen,
    tiposPago,
    metodosPago,
}: {
    alquiler: Alquiler;
    estadoActual: EstadoInfo;
    flujoPrincipal: EstadoInfo[];
    historialEstados: HistorialEstado[];
    transicionesPermitidas: (OpcionSelect & { color: string })[];
    puedeEditar: boolean;
    puedeCambiarEstado: boolean;
    puedeCobrar: boolean;
    resumen: Resumen;
    tiposPago: OpcionSelect[];
    metodosPago: OpcionSelect[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Alquileres', href: index.url() },
        { title: alquiler.codigo, href: show.url({ alquiler: alquiler.id }) },
    ];

    const [devueltoOpen, setDevueltoOpen] = useState(false);
    const { confirm, dialog } = useConfirmDialog();

    const pagoForm = useForm({
        tipo: '',
        monto: '',
        metodo_pago: '',
        notas: '',
    });

    const devueltoForm = useForm({
        estado: 'devuelto',
        danio_descripcion: '',
        danio_monto: '',
        deposito_devuelto: '',
    });

    const cambiarEstado = (value: string) => {
        if (value === 'devuelto') {
            setDevueltoOpen(true);
            return;
        }
        const opcion = transicionesPermitidas.find((t) => t.value === value);
        const label = opcion?.label ?? value;
        confirm({
            title: `¿Marcar como ${label}?`,
            description: `El alquiler ${alquiler.codigo} pasará al estado «${label}».`,
            confirmLabel: `Marcar: ${label}`,
            variant: 'success',
            onConfirm: () => router.post(estado.update.url({ alquiler: alquiler.id }), { estado: value }),
        });
    };

    const registrarPago = (e: React.FormEvent) => {
        e.preventDefault();
        pagoForm.post(pagosRoutes.store.url({ alquiler: alquiler.id }), {
            onSuccess: () => pagoForm.reset(),
        });
    };

    const eliminarPago = (pagoId: number) => {
        confirm({
            title: '¿Eliminar este pago?',
            description: 'Se quitará el registro del historial de cobros. Esta acción no se puede deshacer.',
            confirmLabel: 'Eliminar pago',
            variant: 'destructive',
            onConfirm: () => router.delete(pagosRoutes.destroy.url({ alquiler: alquiler.id, pago: pagoId })),
        });
    };

    const confirmarDevolucion = (e: React.FormEvent) => {
        e.preventDefault();
        devueltoForm.post(estado.update.url({ alquiler: alquiler.id }), {
            onSuccess: () => setDevueltoOpen(false),
        });
    };

    const saldoNum = parseFloat(resumen.saldo_pendiente);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {dialog}
            <Head title={alquiler.codigo} />
            <div className="faro-page">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <IconActionTooltip label="Volver a la lista de alquileres">
                            <Button variant="ghost" size="icon" className="size-9 rounded-xl hover:bg-muted" asChild>
                                <Link href={index.url()}>
                                    <ArrowLeft className="size-4" />
                                </Link>
                            </Button>
                        </IconActionTooltip>
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-foreground">{alquiler.codigo}</h1>
                            <span
                                className={cn(
                                    'mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
                                    badgeEstadoAlquiler(estadoActual.color),
                                )}
                            >
                                <span className={cn('size-2 rounded-full', dotEstadoAlquiler(estadoActual.color))} />
                                {estadoActual.label}
                            </span>
                        </div>
                    </div>
                    {puedeEditar && (
                        <Button asChild>
                            <Link href={edit.url({ alquiler: alquiler.id })}>
                                <Pencil className="mr-2 size-4" />
                                Editar alquiler
                            </Link>
                        </Button>
                    )}
                </div>

                <AlquilerEstadoPanel
                    estadoActual={estadoActual}
                    flujoPrincipal={flujoPrincipal}
                    historialEstados={historialEstados}
                    transicionesPermitidas={transicionesPermitidas}
                    puedeCambiarEstado={puedeCambiarEstado}
                    onCambiarEstado={cambiarEstado}
                />

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Cliente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm">
                            <p className="font-medium">{alquiler.cliente?.nombre ?? '—'}</p>
                            <p className="text-muted-foreground">{alquiler.cliente?.documento}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Fechas</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2 text-sm">
                            <p>
                                <span className="text-muted-foreground">Período previsto: </span>
                                {fmtRangoFechas(alquiler.fecha_inicio_prevista, alquiler.fecha_fin_prevista)}
                            </p>
                            {alquiler.fecha_entrega_at && (
                                <p>
                                    <span className="text-muted-foreground">Entrega: </span>
                                    {fmtFechaHora(alquiler.fecha_entrega_at)}
                                </p>
                            )}
                            {alquiler.fecha_devolucion_at && (
                                <p>
                                    <span className="text-muted-foreground">Devolución: </span>
                                    {fmtFechaHora(alquiler.fecha_devolucion_at)}
                                </p>
                            )}
                            {alquiler.usuario && (
                                <p className="text-muted-foreground">Creado por: {alquiler.usuario.name}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Balance financiero */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Balance financiero</CardTitle>
                        <CardDescription className="text-pretty">
                            Resumen de lo que el cliente debe pagar por este contrato y lo que ya ingresó en caja.
                            La <strong>garantía</strong> (depósito o fianza) es un monto aparte del precio del alquiler: se cobra
                            junto con el alquiler si la registras y, al devolver el equipo sin problemas, se puede devolver al cliente
                            (registrando la devolución correspondiente). Si no hay garantía, solo aplica el total del alquiler.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Contrato y garantía
                            </p>
                            <div className="faro-form-grid sm:grid-cols-3">
                                <div className="faro-field">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Inicio previsto
                                    </p>
                                    <p className="text-sm font-medium text-foreground">{fmtFecha(alquiler.fecha_inicio_prevista)}</p>
                                </div>
                                <div className="faro-field">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Fin previsto
                                    </p>
                                    <p className="text-sm font-medium text-foreground">{fmtFecha(alquiler.fecha_fin_prevista)}</p>
                                </div>
                                <div className="faro-field">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Garantía
                                    </p>
                                    <p className="text-sm font-medium tabular-nums text-foreground">{fmtQ(alquiler.deposito_monto)}</p>
                                    <p className="text-xs leading-snug text-muted-foreground">
                                        Monto acordado como garantía (no es el total del alquiler).
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-border/40 pt-4">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Resumen de cobros
                            </p>
                            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-lg border border-border/40 bg-muted/15 p-3">
                                    <p className="text-xs font-medium text-muted-foreground">Total alquiler</p>
                                    <p className="mt-1 tabular-nums text-lg font-semibold text-foreground">{fmtQ(resumen.total_alquiler)}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Suma de líneas (días × precio diario × cantidad).
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border/40 bg-muted/15 p-3">
                                    <p className="text-xs font-medium text-muted-foreground">Garantía</p>
                                    <p className="mt-1 tabular-nums text-lg font-semibold text-foreground">{fmtQ(resumen.deposito)}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Monto de garantía del contrato (0 si no aplica); cuenta para lo que debe cubrir el cliente.
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border/40 bg-muted/15 p-3">
                                    <p className="text-xs font-medium text-muted-foreground">Cobrado</p>
                                    <p className="mt-1 tabular-nums text-lg font-semibold text-foreground">{fmtQ(resumen.total_cobrado)}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Pagos registrados (alquiler, garantía, etc.) que ya ingresaron.
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border/40 bg-muted/15 p-3">
                                    <p className="text-xs font-medium text-muted-foreground">Saldo pendiente</p>
                                    <p
                                        className={`mt-1 tabular-nums text-lg font-semibold ${saldoNum > 0 ? 'text-destructive' : 'text-green-600'}`}
                                    >
                                        {fmtQ(resumen.saldo_pendiente)}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        (Total alquiler + garantía) menos lo cobrado. En verde: al día con los cobros.
                                    </p>
                                </div>
                            </div>
                        </div>
                        {parseFloat(resumen.total_devuelto) > 0 && (
                            <p className="text-xs text-muted-foreground">
                                Total devuelto al cliente: <span className="font-medium tabular-nums text-foreground">{fmtQ(resumen.total_devuelto)}</span>
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Daños registrados */}
                {(alquiler.danio_descripcion || parseFloat(alquiler.danio_monto) > 0) && (
                    <Card className="border-destructive/40">
                        <CardHeader>
                            <CardTitle className="text-base text-destructive">Daños en devolución</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2 text-sm">
                            {alquiler.danio_descripcion && (
                                <p className="whitespace-pre-wrap">{alquiler.danio_descripcion}</p>
                            )}
                            <p>
                                <span className="text-muted-foreground">Monto por daños: </span>
                                <span className="font-medium tabular-nums">{fmtQ(alquiler.danio_monto)}</span>
                            </p>
                            {alquiler.deposito_devuelto !== null && (
                                <p>
                                    <span className="text-muted-foreground">Depósito devuelto: </span>
                                    <span className="font-medium tabular-nums">{fmtQ(alquiler.deposito_devuelto)}</span>
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Pagos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Pagos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {alquiler.pagos.length > 0 ? (
                            <div className="faro-table-wrap">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border/40 bg-muted/30">
                                            <th className="px-4 py-2 text-left font-medium">Tipo</th>
                                            <th className="px-4 py-2 text-left font-medium">Método</th>
                                            <th className="px-4 py-2 text-right font-medium">Monto</th>
                                            <th className="px-4 py-2 text-left font-medium">Notas</th>
                                            <th className="px-4 py-2 text-left font-medium">Registrado por</th>
                                            <th className="px-4 py-2 text-left font-medium">Fecha</th>
                                            {puedeCobrar && <th className="px-4 py-2" />}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {alquiler.pagos.map((p) => (
                                            <tr key={p.id} className="border-b border-border/30">
                                                <td className="px-4 py-2 capitalize">{p.tipo.replace('_', ' ')}</td>
                                                <td className="px-4 py-2 capitalize">{p.metodo_pago.replace('_', ' ')}</td>
                                                <td className="px-4 py-2 text-right tabular-nums">{fmtQ(p.monto)}</td>
                                                <td className="px-4 py-2 text-muted-foreground">{p.notas ?? '—'}</td>
                                                <td className="px-4 py-2 text-muted-foreground">{p.registrado_por?.name ?? '—'}</td>
                                                <td className="px-4 py-2 text-muted-foreground">{fmtFechaHora(p.created_at)}</td>
                                                {puedeCobrar && (
                                                    <td className="px-4 py-2">
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => eliminarPago(p.id)}
                                                        >
                                                            <Trash2 className="size-4" />
                                                            Eliminar
                                                        </Button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No hay pagos registrados.</p>
                        )}

                        {puedeCobrar && (
                            <form onSubmit={registrarPago} className="space-y-0 border-t border-border/40 pt-4">
                                <div className="faro-form-grid sm:grid-cols-4">
                                <div className="faro-field">
                                    <Label htmlFor="tipo">Tipo</Label>
                                    <Select value={pagoForm.data.tipo} onValueChange={(v) => pagoForm.setData('tipo', v)}>
                                        <SelectTrigger id="tipo" className="w-full">
                                            <SelectValue placeholder="Seleccionar…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tiposPago.map((t) => (
                                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {pagoForm.errors.tipo && <p className="text-xs text-destructive">{pagoForm.errors.tipo}</p>}
                                </div>
                                <div className="faro-field">
                                    <Label htmlFor="monto">Monto</Label>
                                    <Input
                                        id="monto"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder="0.00"
                                        value={pagoForm.data.monto}
                                        onChange={(e) => pagoForm.setData('monto', e.target.value)}
                                    />
                                    {pagoForm.errors.monto && <p className="text-xs text-destructive">{pagoForm.errors.monto}</p>}
                                </div>
                                <div className="faro-field">
                                    <Label htmlFor="metodo_pago">Método</Label>
                                    <Select value={pagoForm.data.metodo_pago} onValueChange={(v) => pagoForm.setData('metodo_pago', v)}>
                                        <SelectTrigger id="metodo_pago" className="w-full">
                                            <SelectValue placeholder="Seleccionar…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {metodosPago.map((m) => (
                                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {pagoForm.errors.metodo_pago && <p className="text-xs text-destructive">{pagoForm.errors.metodo_pago}</p>}
                                </div>
                                <div className="faro-field">
                                    <Label htmlFor="notas_pago">Notas</Label>
                                    <Input
                                        id="notas_pago"
                                        placeholder="Opcional"
                                        value={pagoForm.data.notas}
                                        onChange={(e) => pagoForm.setData('notas', e.target.value)}
                                    />
                                </div>
                                </div>
                                <div className="faro-form-actions">
                                    <Button type="submit" variant="success" disabled={pagoForm.processing} className="faro-btn-primary">
                                        <Plus className="size-4" />
                                        Registrar pago
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {alquiler.notas && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Notas</CardTitle>
                        </CardHeader>
                        <CardContent className="whitespace-pre-wrap text-sm">{alquiler.notas}</CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Líneas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="faro-table-wrap">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/40 bg-muted/30">
                                        <th className="px-4 py-2 text-left font-medium">Producto / Paquete</th>
                                        <th className="px-4 py-2 text-right font-medium">Cant.</th>
                                        <th className="px-4 py-2 text-right font-medium">Días</th>
                                        <th className="px-4 py-2 text-right font-medium">Precio/día</th>
                                        <th className="px-4 py-2 text-right font-medium">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alquiler.lineas.map((l) => (
                                        <tr key={l.id} className="border-b border-border/30">
                                            <td className="px-4 py-2">
                                                {l.paquete ? (
                                                    <>
                                                        <span className="font-medium">{l.paquete.nombre}</span>
                                                        <span className="text-muted-foreground"> (paquete · {l.paquete.codigo})</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        {l.producto?.nombre}{' '}
                                                        <span className="text-muted-foreground">({l.producto?.codigo})</span>
                                                    </>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-right tabular-nums">{l.cantidad}</td>
                                            <td className="px-4 py-2 text-right tabular-nums">{l.dias}</td>
                                            <td className="px-4 py-2 text-right tabular-nums">{fmtQ(l.precio_diario)}</td>
                                            <td className="px-4 py-2 text-right tabular-nums">{fmtQ(l.subtotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modal devolución con daños */}
            <Dialog open={devueltoOpen} onOpenChange={setDevueltoOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Registrar devolución</DialogTitle>
                        <DialogDescription>
                            Completa los datos de daños si aplica. El depósito a devolver se puede ajustar.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={confirmarDevolucion} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="danio_descripcion">Descripción de daños</Label>
                            <textarea
                                id="danio_descripcion"
                                rows={3}
                                placeholder="Describe los daños (opcional)"
                                className="faro-textarea w-full border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={devueltoForm.data.danio_descripcion}
                                onChange={(e) => devueltoForm.setData('danio_descripcion', e.target.value)}
                            />
                            {devueltoForm.errors.danio_descripcion && (
                                <p className="text-xs text-destructive">{devueltoForm.errors.danio_descripcion}</p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="danio_monto">Monto por daños</Label>
                                <Input
                                    id="danio_monto"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={devueltoForm.data.danio_monto}
                                    onChange={(e) => devueltoForm.setData('danio_monto', e.target.value)}
                                />
                                {devueltoForm.errors.danio_monto && (
                                    <p className="text-xs text-destructive">{devueltoForm.errors.danio_monto}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="deposito_devuelto">Depósito a devolver</Label>
                                <Input
                                    id="deposito_devuelto"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder={alquiler.deposito_monto}
                                    value={devueltoForm.data.deposito_devuelto}
                                    onChange={(e) => devueltoForm.setData('deposito_devuelto', e.target.value)}
                                />
                                {devueltoForm.errors.deposito_devuelto && (
                                    <p className="text-xs text-destructive">{devueltoForm.errors.deposito_devuelto}</p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDevueltoOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="success" disabled={devueltoForm.processing}>
                                Confirmar devolución
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
