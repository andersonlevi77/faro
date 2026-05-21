import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Check } from 'lucide-react';

export interface PermisoCelda {
    name: string;
    label: string;
    descripcion: string;
}

export interface CasillaMatriz {
    accion: string;
    permiso: PermisoCelda | null;
}

export interface FilaMatriz {
    modulo: string;
    moduloLabel: string;
    casillas: CasillaMatriz[];
    extras: PermisoCelda[];
}

export interface MatrizPermisos {
    columnas: { key: string; label: string }[];
    filas: FilaMatriz[];
}

const AYUDA_POR_MODULO: Record<string, string> = {
    dashboard: 'Lo que puede ver el usuario al abrir el panel principal.',
    productos: 'Gestión del catálogo de productos (inventario y alquiler).',
    clientes: 'Datos de clientes y su relación con alquileres.',
    alquileres: 'Contratos de alquiler, líneas y cambios de estado.',
    usuarios: 'Listado de cuentas y asignación de roles (no edita permisos del rol aquí).',
    roles: 'Definición de roles y de qué permisos dispone cada uno.',
};

function nombresEnFila(fila: FilaMatriz): string[] {
    const n: string[] = [];
    for (const c of fila.casillas) {
        if (c.permiso) {
            n.push(c.permiso.name);
        }
    }
    for (const e of fila.extras) {
        n.push(e.name);
    }

    return n;
}

function filaCompletaSeleccionada(fila: FilaMatriz, selected: string[]): boolean {
    const nombres = nombresEnFila(fila);
    if (nombres.length === 0) {
        return false;
    }

    return nombres.every((nombre) => selected.includes(nombre));
}

function etiquetaAccion(matriz: MatrizPermisos, accion: string): string {
    return matriz.columnas.find((c) => c.key === accion)?.label ?? accion;
}

function permisosActivosEnModulo(fila: FilaMatriz, selected: string[]): PermisoCelda[] {
    const out: PermisoCelda[] = [];
    for (const c of fila.casillas) {
        if (c.permiso && selected.includes(c.permiso.name)) {
            out.push(c.permiso);
        }
    }
    for (const e of fila.extras) {
        if (selected.includes(e.name)) {
            out.push(e);
        }
    }

    return out;
}

function ModulePermissionsCard({
    fila,
    matriz,
    selected,
    readOnly,
    onToggle,
    onToggleRow,
}: {
    fila: FilaMatriz;
    matriz: MatrizPermisos;
    selected: string[];
    readOnly: boolean;
    onToggle?: (permissionName: string) => void;
    onToggleRow?: (permissionNames: string[], currentlyAllSelected: boolean) => void;
}) {
    const nombresFila = nombresEnFila(fila);
    const todos = filaCompletaSeleccionada(fila, selected);
    const activos = nombresFila.filter((n) => selected.includes(n)).length;
    const total = nombresFila.length;
    const ayuda = AYUDA_POR_MODULO[fila.modulo] ?? 'Permisos de esta parte del sistema.';

    if (readOnly) {
        const lista = permisosActivosEnModulo(fila, selected);

        return (
            <Card className="gap-0 py-4">
                <CardHeader className="space-y-1 px-5 pb-2 pt-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <CardTitle className="text-base">{fila.moduloLabel}</CardTitle>
                        <span className="text-xs tabular-nums text-muted-foreground">
                            {lista.length} de {total || '—'}
                        </span>
                    </div>
                    <CardDescription>{ayuda}</CardDescription>
                </CardHeader>
                <CardContent className="px-5 pt-0">
                    {lista.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Ningún permiso activo en este módulo.</p>
                    ) : (
                        <ul className="space-y-2">
                            {lista.map((p) => (
                                <li key={p.name} className="flex gap-3 text-sm">
                                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                                        <Check className="size-3" strokeWidth={2.5} />
                                    </span>
                                    <div className="min-w-0 space-y-1">
                                        <p className="font-medium leading-snug text-foreground">{p.label}</p>
                                        {p.descripcion ? (
                                            <p className="text-xs leading-relaxed text-muted-foreground">{p.descripcion}</p>
                                        ) : null}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="gap-0 py-4">
            <CardHeader className="flex flex-col gap-3 space-y-0 px-5 pb-3 pt-0 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <CardTitle className="text-base">{fila.moduloLabel}</CardTitle>
                        <span className="rounded-md bg-muted/80 px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                            {total > 0 ? `${activos} / ${total} activos` : '—'}
                        </span>
                    </div>
                    <CardDescription className="text-pretty">{ayuda}</CardDescription>
                </div>
                {onToggleRow && nombresFila.length > 0 && (
                    <IconActionTooltip
                        label={
                            todos
                                ? 'Quitar todos los permisos de este módulo de una vez'
                                : 'Asignar todos los permisos de este módulo de una vez'
                        }
                    >
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0 self-start"
                            onClick={() => onToggleRow(nombresFila, todos)}
                        >
                            {todos ? 'Desactivar todo el módulo' : 'Activar todo el módulo'}
                        </Button>
                    </IconActionTooltip>
                )}
            </CardHeader>
            <CardContent className="space-y-4 px-5 pt-0">
                <div className="grid gap-2 sm:grid-cols-2">
                    {fila.casillas.map((casilla) => {
                        if (!casilla.permiso) {
                            return null;
                        }
                        const titulo = etiquetaAccion(matriz, casilla.accion);

                        return (
                            <label
                                key={casilla.accion}
                                className="flex cursor-pointer gap-3 rounded-xl border border-border/50 bg-muted/20 p-3 transition-colors hover:bg-muted/25"
                            >
                                <input
                                    type="checkbox"
                                    className="mt-0.5 size-4 shrink-0 rounded border-input"
                                    checked={selected.includes(casilla.permiso.name)}
                                    onChange={() => onToggle?.(casilla.permiso!.name)}
                                />
                                <span className="min-w-0">
                                    <span className="block text-sm font-medium text-foreground">{titulo}</span>
                                    <span className="mt-0.5 block text-xs font-medium leading-snug text-muted-foreground">
                                        {casilla.permiso.label}
                                    </span>
                                    {casilla.permiso.descripcion ? (
                                        <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground/95">
                                            {casilla.permiso.descripcion}
                                        </span>
                                    ) : null}
                                </span>
                            </label>
                        );
                    })}
                </div>

                {fila.extras.length > 0 && (
                    <div className="border-t border-border/50 pt-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Permisos adicionales
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {fila.extras.map((extra) => (
                                <label
                                    key={extra.name}
                                    className="flex cursor-pointer gap-3 rounded-xl border border-border/50 bg-muted/20 p-3 transition-colors hover:bg-muted/25"
                                >
                                    <input
                                        type="checkbox"
                                        className="mt-0.5 size-4 shrink-0 rounded border-input"
                                        checked={selected.includes(extra.name)}
                                        onChange={() => onToggle?.(extra.name)}
                                    />
                                    <span className="min-w-0">
                                        <span className="block text-sm font-medium leading-snug text-foreground">{extra.label}</span>
                                        {extra.descripcion ? (
                                            <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground/95">
                                                {extra.descripcion}
                                            </span>
                                        ) : null}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function RolePermissionsMatrix({
    matriz,
    selected,
    onToggle,
    onToggleRow,
    readOnly = false,
}: {
    matriz: MatrizPermisos;
    selected: string[];
    onToggle?: (permissionName: string) => void;
    onToggleRow?: (permissionNames: string[], currentlyAllSelected: boolean) => void;
    readOnly?: boolean;
}) {
    return (
        <div className="space-y-4">
            {!readOnly && (
                <div className="rounded-xl border border-border/50 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                    <p className="text-pretty">
                        Los permisos están agrupados por <span className="font-medium text-foreground">módulo</span>. Activa
                        solo lo que necesites; puedes usar <span className="font-medium text-foreground">Activar todo el módulo</span>{' '}
                        para marcar de una vez todas las casillas de esa sección.
                    </p>
                    <p className="mt-2 text-pretty">
                        Cada usuario recibe permisos únicamente a través de los{' '}
                        <span className="font-medium text-foreground">roles</span> que le asignes en{' '}
                        <span className="font-medium text-foreground">Usuarios</span>.
                    </p>
                </div>
            )}
            {readOnly && (
                <p className="text-sm text-muted-foreground">
                    Resumen por módulo de los permisos que tiene este rol. Para cambiarlos, usa Editar en el listado de roles.
                </p>
            )}

            <div className="flex flex-col gap-4">
                {matriz.filas.map((fila) => (
                    <ModulePermissionsCard
                        key={fila.modulo}
                        fila={fila}
                        matriz={matriz}
                        selected={selected}
                        readOnly={readOnly}
                        onToggle={onToggle}
                        onToggleRow={onToggleRow}
                    />
                ))}
            </div>
        </div>
    );
}
