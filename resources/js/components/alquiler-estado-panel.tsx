import { ArrowRight, CircleDot, History, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fmtFechaHora } from '@/lib/dates';
import { badgeEstadoAlquiler, dotEstadoAlquiler, stepEstadoAlquiler } from '@/lib/estado-alquiler';
import { cn } from '@/lib/utils';

interface EstadoInfo {
    value: string;
    label: string;
    color: string;
}

interface HistorialEntrada {
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

interface Transicion extends EstadoInfo {}

export function AlquilerEstadoPanel({
    estadoActual,
    flujoPrincipal,
    historialEstados,
    transicionesPermitidas,
    puedeCambiarEstado,
    onCambiarEstado,
}: {
    estadoActual: EstadoInfo;
    flujoPrincipal: EstadoInfo[];
    historialEstados: HistorialEntrada[];
    transicionesPermitidas: Transicion[];
    puedeCambiarEstado: boolean;
    onCambiarEstado: (value: string) => void;
}) {
    const indiceActual = flujoPrincipal.findIndex((e) => e.value === estadoActual.value);
    const esCancelado = estadoActual.value === 'cancelado';

    return (
        <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <CardTitle className="text-base">Estado del alquiler</CardTitle>
                        <CardDescription className="mt-1">
                            Seguimiento del contrato y registro de cada cambio.
                        </CardDescription>
                    </div>
                    <span
                        className={cn(
                            'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ring-inset',
                            badgeEstadoAlquiler(estadoActual.color),
                        )}
                    >
                        <span className={cn('size-2.5 rounded-full', dotEstadoAlquiler(estadoActual.color))} />
                        {estadoActual.label}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {!esCancelado && (
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Flujo del contrato
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                            {flujoPrincipal.map((paso, idx) => {
                                const completado = indiceActual >= 0 && idx < indiceActual;
                                const actual = paso.value === estadoActual.value;
                                const pendiente = indiceActual >= 0 && idx > indiceActual;

                                return (
                                    <div key={paso.value} className="flex items-center gap-2">
                                        <div
                                            className={cn(
                                                'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                                                actual && stepEstadoAlquiler(paso.color),
                                                completado && 'border-primary/30 bg-primary/5 text-primary',
                                                pendiente && 'border-border/50 bg-muted/30 text-muted-foreground',
                                                !actual && !completado && !pendiente && 'border-border/50 text-muted-foreground',
                                            )}
                                        >
                                            {completado && !actual && (
                                                <CircleDot className="size-3.5 shrink-0 text-primary" />
                                            )}
                                            {actual && (
                                                <span className={cn('size-2 shrink-0 rounded-full', dotEstadoAlquiler(paso.color))} />
                                            )}
                                            {paso.label}
                                        </div>
                                        {idx < flujoPrincipal.length - 1 && (
                                            <ArrowRight className="size-3.5 text-muted-foreground/60" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {esCancelado && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
                        Este alquiler fue cancelado y no continúa el flujo normal del contrato.
                    </p>
                )}

                {puedeCambiarEstado && transicionesPermitidas.length > 0 && (
                    <div className="rounded-xl border border-border/50 bg-muted/15 p-4">
                        <p className="mb-3 text-sm font-medium text-foreground">Siguiente paso</p>
                        <div className="flex flex-wrap gap-2">
                            {transicionesPermitidas.map((t) => (
                                <Button
                                    key={t.value}
                                    type="button"
                                    variant={t.value === 'cancelado' ? 'destructive' : 'outline'}
                                    size="lg"
                                    className={cn(
                                        t.value !== 'cancelado' &&
                                            'border-2 hover:opacity-90',
                                        t.value !== 'cancelado' && stepEstadoAlquiler(t.color),
                                    )}
                                    onClick={() => onCambiarEstado(t.value)}
                                >
                                    {t.value === 'cancelado' ? 'Cancelar alquiler' : `Marcar como ${t.label}`}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <div className="mb-3 flex items-center gap-2">
                        <History className="size-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">Historial de estados</p>
                    </div>

                    {historialEstados.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Aún no hay cambios registrados en este alquiler.
                        </p>
                    ) : (
                        <ol className="relative space-y-0 border-l-2 border-border/60 pl-6">
                            {historialEstados.map((entrada, idx) => (
                                <li key={entrada.id} className={cn('pb-6', idx === historialEstados.length - 1 && 'pb-0')}>
                                    <span
                                        className={cn(
                                            'absolute -left-[9px] mt-1.5 size-4 rounded-full ring-4 ring-card',
                                            dotEstadoAlquiler(entrada.estado_nuevo_color),
                                        )}
                                    />
                                    <div className="rounded-lg border border-border/40 bg-card p-3 shadow-sm">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {entrada.estado_anterior_label ? (
                                                <>
                                                    <span
                                                        className={cn(
                                                            'inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
                                                            badgeEstadoAlquiler(entrada.estado_anterior_color ?? 'gray'),
                                                        )}
                                                    >
                                                        {entrada.estado_anterior_label}
                                                    </span>
                                                    <ArrowRight className="size-3.5 text-muted-foreground" />
                                                </>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Creación →</span>
                                            )}
                                            <span
                                                className={cn(
                                                    'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset',
                                                    badgeEstadoAlquiler(entrada.estado_nuevo_color),
                                                )}
                                            >
                                                {entrada.estado_nuevo_label}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            <span className="font-medium text-foreground">{fmtFechaHora(entrada.created_at)}</span>
                                            {' · '}
                                            <span className="inline-flex items-center gap-1">
                                                <User className="size-3.5" />
                                                {entrada.usuario?.name ?? 'Sistema'}
                                            </span>
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
