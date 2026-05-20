import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import estado from '@/routes/alquileres/estado';
import pagosRoutes from '@/routes/alquileres/pagos';
import { edit, index, show } from '@/routes/alquileres';
import type { BreadcrumbItem } from '@/types';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fmtQ } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductoMini {
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

export default function AlquileresVer({
    alquiler,
    transicionesPermitidas,
    puedeEditar,
    puedeCambiarEstado,
    puedeCobrar,
    resumen,
    tiposPago,
    metodosPago,
}: {
    alquiler: Alquiler;
    transicionesPermitidas: OpcionSelect[];
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
        router.post(estado.update.url({ alquiler: alquiler.id }), { estado: value });
    };

    const registrarPago = (e: React.FormEvent) => {
        e.preventDefault();
        pagoForm.post(pagosRoutes.store.url({ alquiler: alquiler.id }), {
            onSuccess: () => pagoForm.reset(),
        });
    };

    const eliminarPago = (pagoId: number) => {
        router.delete(pagosRoutes.destroy.url({ alquiler: alquiler.id, pago: pagoId }));
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
            <Head title={alquiler.codigo} />
            <div className="flex h-full flex-1 flex-col gap-5 p-4 md:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <IconActionTooltip label="Volver a la lista de alquileres">
                            <Button variant="ghost" size="icon" className="size-9 rounded-lg hover:bg-accent" asChild>
                                <Link href={index.url()}>
                                    <ArrowLeft className="size-4" />
                                </Link>
                            </Button>
                        </IconActionTooltip>
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-foreground">{alquiler.codigo}</h1>
                            <p className="text-sm capitalize text-muted-foreground">
                                Estado: {alquiler.estado.replace('_', ' ')}
                            </p>
                        </div>
                    </div>
                    {puedeEditar && (
                        <Button asChild>
                            <Link href={edit.url({ alquiler: alquiler.id })}>
                                <Pencil className="mr-2 size-4" />
                                Editar borrador
                            </Link>
                        </Button>
                    )}
                </div>

                {puedeCambiarEstado && transicionesPermitidas.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Cambiar estado</CardTitle>
                            <CardDescription>Flujo: borrador → reservado → entregado → en uso → devuelto → cerrado.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {transicionesPermitidas.map((t) => (
                                <Button key={t.value} type="button" variant="secondary" onClick={() => cambiarEstado(t.value)}>
                                    Marcar: {t.label}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                )}

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
                                {alquiler.fecha_inicio_prevista} → {alquiler.fecha_fin_prevista}
                            </p>
                            {alquiler.fecha_entrega_at && (
                                <p>
                                    <span className="text-muted-foreground">Entrega: </span>
                                    {alquiler.fecha_entrega_at}
                                </p>
                            )}
                            {alquiler.fecha_devolucion_at && (
                                <p>
                                    <span className="text-muted-foreground">Devolución: </span>
                                    {alquiler.fecha_devolucion_at}
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
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
                            <div>
                                <p className="text-muted-foreground">Total alquiler</p>
                                <p className="tabular-nums font-medium">{fmtQ(resumen.total_alquiler)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Depósito</p>
                                <p className="tabular-nums font-medium">{fmtQ(resumen.deposito)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Cobrado</p>
                                <p className="tabular-nums font-medium">{fmtQ(resumen.total_cobrado)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Saldo pendiente</p>
                                <p className={`tabular-nums text-lg font-semibold ${saldoNum > 0 ? 'text-destructive' : 'text-green-600'}`}>
                                    {fmtQ(resumen.saldo_pendiente)}
                                </p>
                            </div>
                        </div>
                        {parseFloat(resumen.total_devuelto) > 0 && (
                            <p className="mt-2 text-xs text-muted-foreground">
                                Total devuelto al cliente: {fmtQ(resumen.total_devuelto)}
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
                            <div className="overflow-x-auto rounded-lg bg-muted/20">
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
                                                <td className="px-4 py-2 text-muted-foreground">{p.created_at}</td>
                                                {puedeCobrar && (
                                                    <td className="px-4 py-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-7 text-destructive hover:text-destructive"
                                                            onClick={() => eliminarPago(p.id)}
                                                        >
                                                            <Trash2 className="size-4" />
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
                            <form onSubmit={registrarPago} className="grid gap-3 border-t border-border/40 pt-4 sm:grid-cols-4">
                                <div className="space-y-1">
                                    <Label htmlFor="tipo">Tipo</Label>
                                    <Select value={pagoForm.data.tipo} onValueChange={(v) => pagoForm.setData('tipo', v)}>
                                        <SelectTrigger id="tipo">
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
                                <div className="space-y-1">
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
                                <div className="space-y-1">
                                    <Label htmlFor="metodo_pago">Método</Label>
                                    <Select value={pagoForm.data.metodo_pago} onValueChange={(v) => pagoForm.setData('metodo_pago', v)}>
                                        <SelectTrigger id="metodo_pago">
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
                                <div className="space-y-1">
                                    <Label htmlFor="notas_pago">Notas</Label>
                                    <Input
                                        id="notas_pago"
                                        placeholder="Opcional"
                                        value={pagoForm.data.notas}
                                        onChange={(e) => pagoForm.setData('notas', e.target.value)}
                                    />
                                </div>
                                <div className="sm:col-span-4">
                                    <Button type="submit" disabled={pagoForm.processing} size="sm">
                                        <Plus className="mr-1 size-4" />
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
                        <div className="overflow-x-auto rounded-lg bg-muted/20">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/40 bg-muted/30">
                                        <th className="px-4 py-2 text-left font-medium">Producto</th>
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
                                                {l.producto?.nombre} <span className="text-muted-foreground">({l.producto?.codigo})</span>
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
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                            <Button type="submit" disabled={devueltoForm.processing}>
                                Confirmar devolución
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
