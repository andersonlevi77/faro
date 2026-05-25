import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { fmtFecha } from '@/lib/dates';
import { fmtQ } from '@/lib/utils';
import { show as alquilerShow } from '@/routes/alquileres';
import { edit, index, show } from '@/routes/clientes';
import type { BreadcrumbItem } from '@/types';

interface AlquilerMini {
    id: number;
    codigo: string;
    estado: string;
    fecha_fin_prevista: string;
    lineas_count: number;
}

interface Cliente {
    id: number;
    codigo: string | null;
    nombre: string;
    documento: string | null;
    email: string | null;
    telefono: string | null;
    direccion: string | null;
    ciudad: string | null;
    notas: string | null;
    alquileres: AlquilerMini[];
}

const SCORE_COLOR: Record<string, string> = {
    Excelente: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    Bueno: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    Regular: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    Bajo: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const ESTADO_COLOR: Record<string, string> = {
    creado: 'text-yellow-700 dark:text-yellow-400',
    entregado: 'text-blue-700 dark:text-blue-400',
    devuelto: 'text-green-700 dark:text-green-400',
};

export default function ClientesVer({
    cliente,
    puntuacion,
    etiquetaPuntuacion,
    totalPagado,
}: {
    cliente: Cliente;
    puntuacion: number;
    etiquetaPuntuacion: string;
    totalPagado: string;
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Clientes', href: index.url() },
        { title: cliente.nombre, href: show.url({ cliente: cliente.id }) },
    ];

    const pctScore = puntuacion;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={cliente.nombre} />
            <div className="faro-page">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <IconActionTooltip label="Volver a la lista de clientes">
                            <Button variant="ghost" size="icon" className="size-9 rounded-xl hover:bg-muted" asChild>
                                <Link href={index.url()}>
                                    <ArrowLeft className="size-4" />
                                </Link>
                            </Button>
                        </IconActionTooltip>
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-foreground">{cliente.nombre}</h1>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${SCORE_COLOR[etiquetaPuntuacion] ?? ''}`}>
                                {puntuacion}/100 — {etiquetaPuntuacion}
                            </span>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={edit.url({ cliente: cliente.id })}>
                            <Pencil className="mr-2 size-4" />
                            Editar
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Datos de contacto</CardTitle>
                            <CardDescription>Información registrada del cliente.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                            <div>
                                <p className="text-muted-foreground">Código</p>
                                <p className="font-medium">{cliente.codigo ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Documento</p>
                                <p className="font-medium">{cliente.documento ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Email</p>
                                <p className="font-medium">{cliente.email ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Teléfono</p>
                                <p className="font-medium">{cliente.telefono ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Ciudad</p>
                                <p className="font-medium">{cliente.ciudad ?? '—'}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-muted-foreground">Dirección</p>
                                <p className="font-medium">{cliente.direccion ?? '—'}</p>
                            </div>
                            {cliente.notas && (
                                <div className="sm:col-span-2">
                                    <p className="text-muted-foreground">Notas</p>
                                    <p className="whitespace-pre-wrap font-medium">{cliente.notas}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Resumen financiero</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-muted-foreground">Total alquileres</p>
                                    <p className="text-2xl font-semibold tabular-nums">{cliente.alquileres.length}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Total cobrado</p>
                                    <p className="text-2xl font-semibold tabular-nums text-green-700 dark:text-green-400">{fmtQ(totalPagado)}</p>
                                </div>
                            </div>
                            <div>
                                <p className="mb-1 text-muted-foreground">Puntuación de cliente</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className={`h-full rounded-full transition-all ${pctScore >= 80 ? 'bg-green-500' : pctScore >= 60 ? 'bg-blue-500' : pctScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                            style={{ width: `${pctScore}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium tabular-nums">{puntuacion}/100</span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Basada en alquileres completados, devoluciones a tiempo e incidentes.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Alquileres recientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {cliente.alquileres.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Sin alquileres aún.</p>
                        ) : (
                            <div className="faro-table-wrap">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border/40 bg-muted/30">
                                            <th className="px-4 py-2 text-left font-medium">Código</th>
                                            <th className="px-4 py-2 text-left font-medium">Estado</th>
                                            <th className="px-4 py-2 text-left font-medium">Fin previsto</th>
                                            <th className="px-4 py-2 text-right font-medium">Líneas</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cliente.alquileres.map((a) => (
                                            <tr
                                                key={a.id}
                                                className="border-b border-border/30 cursor-pointer hover:bg-muted/20"
                                                onClick={() => window.location.href = alquilerShow.url({ alquiler: a.id })}
                                            >
                                                <td className="px-4 py-2">
                                                    <Link
                                                        href={alquilerShow.url({ alquiler: a.id })}
                                                        className="font-mono text-xs font-medium text-primary hover:underline"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {a.codigo}
                                                    </Link>
                                                </td>
                                                <td className={`px-4 py-2 capitalize ${ESTADO_COLOR[a.estado] ?? ''}`}>
                                                    {a.estado.replace('_', ' ')}
                                                </td>
                                                <td className="px-4 py-2 text-muted-foreground">{fmtFecha(a.fecha_fin_prevista)}</td>
                                                <td className="px-4 py-2 text-right tabular-nums">{a.lineas_count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
