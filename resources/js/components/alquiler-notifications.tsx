import { Link } from '@inertiajs/react';
import { AlertTriangle, Bell, CalendarClock, Package } from 'lucide-react';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { fechaYmd, fmtFecha } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { calendario } from '@/routes';
import { index as alquileresIndex, show as alquilerShow } from '@/routes/alquileres';
import { index as productosIndex } from '@/routes/productos';
import type { AlquilerNotificacionItem, AlquilerNotificaciones, StockBajoNotificacionItem } from '@/types';

function diasDesdeHoy(fecha: string): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fin = new Date(`${fechaYmd(fecha)}T00:00:00`);
    return Math.round((fin.getTime() - hoy.getTime()) / 86_400_000);
}

function etiquetaPlazo(fecha: string): string {
    const dias = diasDesdeHoy(fecha);

    if (dias < 0) {
        const atraso = Math.abs(dias);
        return atraso === 1 ? '1 día de atraso' : `${atraso} días de atraso`;
    }

    if (dias === 0) {
        return 'Vence hoy';
    }

    if (dias === 1) {
        return 'Vence mañana';
    }

    return `Vence en ${dias} días`;
}

function StockBajoFila({ producto }: { producto: StockBajoNotificacionItem }) {
    return (
        <Link
            href={productosIndex.url()}
            className="flex flex-col gap-0.5 rounded-xl border border-amber-300/40 bg-amber-50 px-3 py-2.5 transition-colors hover:bg-amber-100/80 dark:border-amber-800/40 dark:bg-amber-950/30 dark:hover:bg-amber-950/50"
        >
            <span className="font-medium text-foreground">{producto.nombre}</span>
            <span className="text-xs text-muted-foreground">{producto.codigo}</span>
            <p className="text-xs text-amber-800 dark:text-amber-300">
                Disponible: {producto.disponible} · Alerta en {producto.stock_minimo} o menos
            </p>
        </Link>
    );
}

function NotificacionFila({
    alquiler,
    variante,
}: {
    alquiler: AlquilerNotificacionItem;
    variante: 'atrasado' | 'proximo';
}) {
    return (
        <Link
            href={alquilerShow.url({ alquiler: alquiler.id })}
            className={cn(
                'flex flex-col gap-0.5 rounded-xl border px-3 py-2.5 transition-colors hover:bg-muted/50',
                variante === 'atrasado'
                    ? 'border-destructive/25 bg-destructive/5'
                    : 'border-border/50 bg-card',
            )}
        >
            <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-foreground">{alquiler.codigo}</span>
                <span
                    className={cn(
                        'shrink-0 text-xs font-medium',
                        variante === 'atrasado' ? 'text-destructive' : 'text-primary',
                    )}
                >
                    {etiquetaPlazo(alquiler.fecha_fin_prevista)}
                </span>
            </div>
            <p className="truncate text-sm text-foreground">{alquiler.cliente?.nombre ?? 'Sin cliente'}</p>
            <p className="text-xs text-muted-foreground">Fin previsto: {fmtFecha(alquiler.fecha_fin_prevista)}</p>
        </Link>
    );
}

export function AlquilerNotifications({
    notificaciones,
}: {
    notificaciones: AlquilerNotificaciones;
}) {
    const { total, proximos, atrasados, stock_bajo, dias_ventana } = notificaciones;
    const tieneAtrasados = atrasados.length > 0;
    const tieneStockBajo = stock_bajo.length > 0;

    return (
        <DropdownMenu>
            <IconActionTooltip label="Avisos de alquileres y stock bajo">
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative size-10 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={`Notificaciones de alquileres${total > 0 ? `, ${total} pendientes` : ''}`}
                    >
                        <Bell className="size-5" />
                        {total > 0 && (
                            <span
                                className={cn(
                                    'absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full px-1 py-0.5 text-[10px] font-bold text-white ring-2 ring-card',
                                    tieneAtrasados ? 'bg-destructive' : tieneStockBajo ? 'bg-amber-500' : 'bg-primary',
                                )}
                            >
                                {total > 9 ? '9+' : total}
                            </span>
                        )}
                    </Button>
                </DropdownMenuTrigger>
            </IconActionTooltip>
            <DropdownMenuContent className="w-80 rounded-2xl p-0 shadow-card" align="end">
                <DropdownMenuLabel className="border-b border-border/50 px-4 py-3 font-normal">
                    <p className="text-sm font-semibold text-foreground">Alquileres por atender</p>
                    <p className="text-xs text-muted-foreground">
                        Alquileres por vencer, atrasados y productos con stock bajo (solo aviso).
                    </p>
                </DropdownMenuLabel>

                <div className="max-h-[min(24rem,70vh)] space-y-4 overflow-y-auto p-3">
                    {total === 0 ? (
                        <div className="flex flex-col items-center gap-2 rounded-xl bg-muted/30 px-4 py-8 text-center">
                            <CalendarClock className="size-8 text-muted-foreground/60" />
                            <p className="text-sm font-medium text-foreground">Todo al día</p>
                            <p className="text-xs text-muted-foreground">
                                No hay alquileres activos por vencer ni atrasados.
                            </p>
                        </div>
                    ) : (
                        <>
                            {atrasados.length > 0 && (
                                <section className="space-y-2">
                                    <p className="flex items-center gap-1.5 px-1 text-xs font-semibold tracking-wide text-destructive uppercase">
                                        <AlertTriangle className="size-3.5" />
                                        Atrasados ({atrasados.length})
                                    </p>
                                    {atrasados.map((alquiler) => (
                                        <NotificacionFila
                                            key={alquiler.id}
                                            alquiler={alquiler}
                                            variante="atrasado"
                                        />
                                    ))}
                                </section>
                            )}
                            {proximos.length > 0 && (
                                <section className="space-y-2">
                                    <p className="flex items-center gap-1.5 px-1 text-xs font-semibold tracking-wide text-primary uppercase">
                                        <CalendarClock className="size-3.5" />
                                        Próximos {dias_ventana} días ({proximos.length})
                                    </p>
                                    {proximos.map((alquiler) => (
                                        <NotificacionFila
                                            key={alquiler.id}
                                            alquiler={alquiler}
                                            variante="proximo"
                                        />
                                    ))}
                                </section>
                            )}
                            {stock_bajo.length > 0 && (
                                <section className="space-y-2">
                                    <p className="flex items-center gap-1.5 px-1 text-xs font-semibold tracking-wide text-amber-700 uppercase dark:text-amber-400">
                                        <Package className="size-3.5" />
                                        Stock bajo ({stock_bajo.length})
                                    </p>
                                    {stock_bajo.map((producto) => (
                                        <StockBajoFila key={producto.id} producto={producto} />
                                    ))}
                                </section>
                            )}
                        </>
                    )}
                </div>

                <DropdownMenuSeparator className="m-0" />
                <div className="flex gap-2 p-2">
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl" asChild>
                        <Link href={alquileresIndex.url()}>Ver alquileres</Link>
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1 rounded-xl" asChild>
                        <Link href={calendario.url()}>Calendario</Link>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
