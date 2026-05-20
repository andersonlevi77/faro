import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { fmtQ } from '@/lib/utils';
import { calendario } from '@/routes';
import { show as alquilerShow } from '@/routes/alquileres';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AlquilerCal {
    id: number;
    codigo: string;
    estado: string;
    fecha_inicio_prevista: string;
    fecha_fin_prevista: string;
    total: string;
    cliente?: { nombre: string } | null;
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_SEMANA = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

const ESTADO_COLOR: Record<string, string> = {
    borrador: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
    reservado: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-800/60 dark:text-yellow-200',
    entregado: 'bg-blue-200 text-blue-900 dark:bg-blue-800/60 dark:text-blue-200',
    en_uso: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-800/60 dark:text-indigo-200',
    devuelto: 'bg-green-200 text-green-900 dark:bg-green-800/60 dark:text-green-200',
    cerrado: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    cancelado: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

function buildCalendarDays(anio: number, mes: number): (number | null)[] {
    const primerDia = new Date(anio, mes - 1, 1).getDay();
    const diasEnMes = new Date(anio, mes, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < primerDia; i++) { days.push(null); }
    for (let d = 1; d <= diasEnMes; d++) { days.push(d); }
    while (days.length % 7 !== 0) { days.push(null); }
    return days;
}

function dateStr(anio: number, mes: number, dia: number): string {
    return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

function alquileresParaDia(alquileres: AlquilerCal[], anio: number, mes: number, dia: number): AlquilerCal[] {
    const d = dateStr(anio, mes, dia);
    return alquileres.filter((a) => a.fecha_inicio_prevista <= d && a.fecha_fin_prevista >= d);
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Calendario', href: calendario.url() }];

export default function Calendario({
    alquileres,
    anio,
    mes,
    hoy,
}: {
    alquileres: AlquilerCal[];
    anio: number;
    mes: number;
    hoy: string;
}) {
    const days = buildCalendarDays(anio, mes);

    const navMes = (delta: number) => {
        let nm = mes + delta;
        let na = anio;
        if (nm < 1) { nm = 12; na--; }
        if (nm > 12) { nm = 1; na++; }
        router.get(calendario.url({ query: { anio: na, mes: nm } }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendario" />
            <div className="flex h-full flex-1 flex-col gap-5 p-4 md:p-5">
                <Card className="shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                    <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                        <CardTitle className="text-base">{MESES[mes - 1]} {anio}</CardTitle>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="size-8" onClick={() => navMes(-1)}>
                                <ChevronLeft className="size-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => router.get(calendario.url())}>
                                Hoy
                            </Button>
                            <Button variant="outline" size="icon" className="size-8" onClick={() => navMes(1)}>
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-2">
                        {/* Cabecera días semana */}
                        <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
                            {DIAS_SEMANA.map((d) => (
                                <div key={d} className="py-2">{d}</div>
                            ))}
                        </div>
                        {/* Grid días */}
                        <div className="grid grid-cols-7">
                            {days.map((dia, idx) => {
                                if (dia === null) {
                                    return <div key={`empty-${idx}`} className="min-h-[90px] border border-transparent" />;
                                }
                                const isHoy = dateStr(anio, mes, dia) === hoy;
                                const alqs = alquileresParaDia(alquileres, anio, mes, dia);
                                return (
                                    <div
                                        key={dia}
                                        className={`min-h-[90px] border border-border/30 p-1 ${isHoy ? 'bg-primary/5' : ''}`}
                                    >
                                        <span className={`flex size-6 items-center justify-center rounded-full text-xs font-medium mb-1 ${isHoy ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}>
                                            {dia}
                                        </span>
                                        <div className="space-y-0.5">
                                            {alqs.slice(0, 3).map((a) => (
                                                <Link
                                                    key={a.id}
                                                    href={alquilerShow.url({ alquiler: a.id })}
                                                    className={`block truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight hover:opacity-80 ${ESTADO_COLOR[a.estado] ?? ESTADO_COLOR.cerrado}`}
                                                    title={`${a.codigo} — ${a.cliente?.nombre ?? ''}`}
                                                >
                                                    {a.codigo}
                                                </Link>
                                            ))}
                                            {alqs.length > 3 && (
                                                <span className="block text-[10px] text-muted-foreground pl-1">+{alqs.length - 3} más</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Lista del mes */}
                <Card className="shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                    <CardHeader>
                        <CardTitle className="text-base">Alquileres en {MESES[mes - 1]} {anio}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {alquileres.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No hay alquileres en este mes.</p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg bg-muted/20">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border/40 bg-muted/30">
                                            <th className="px-4 py-2 text-left font-medium">Código</th>
                                            <th className="px-4 py-2 text-left font-medium">Cliente</th>
                                            <th className="px-4 py-2 text-left font-medium">Período</th>
                                            <th className="px-4 py-2 text-left font-medium">Estado</th>
                                            <th className="px-4 py-2 text-right font-medium">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {alquileres.map((a) => (
                                            <tr
                                                key={a.id}
                                                className="border-b border-border/30 cursor-pointer hover:bg-muted/20"
                                                onClick={() => router.visit(alquilerShow.url({ alquiler: a.id }))}
                                            >
                                                <td className="px-4 py-2 font-mono text-xs font-medium">{a.codigo}</td>
                                                <td className="px-4 py-2">{a.cliente?.nombre ?? '—'}</td>
                                                <td className="px-4 py-2 text-muted-foreground">{a.fecha_inicio_prevista} → {a.fecha_fin_prevista}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_COLOR[a.estado] ?? ESTADO_COLOR.cerrado}`}>
                                                        {a.estado.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-right tabular-nums">{fmtQ(a.total)}</td>
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
