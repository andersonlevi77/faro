import { router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Columns3,
    HelpCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { mergeTableQuery } from '@/lib/table-query';
import { cn } from '@/lib/utils';
import type { LaravelPaginator } from '@/types/pagination';

export type FaroColumnDef<T> = {
    id: string;
    label: string;
    tooltip?: string;
    sortable?: boolean;
    sortKey?: string;
    align?: 'left' | 'center' | 'right';
    hideable?: boolean;
    defaultVisible?: boolean;
    headerClassName?: string;
    cellClassName?: string;
    cell: (row: T) => ReactNode;
};

type FaroDataTableProps<T> = {
    tableId: string;
    columns: FaroColumnDef<T>[];
    paginator: LaravelPaginator<T>;
    indexUrl: string;
    query?: Record<string, string | number | undefined | null>;
    sort?: string | null;
    direction?: 'asc' | 'desc' | null;
    emptyMessage?: string;
    rowKey?: (row: T) => string | number;
};

function storageKey(tableId: string): string {
    return `faro-table-columns:${tableId}`;
}

function defaultVisibility<T>(columns: FaroColumnDef<T>[]): Record<string, boolean> {
    const vis: Record<string, boolean> = {};
    for (const col of columns) {
        vis[col.id] = col.defaultVisible !== false;
    }

    return vis;
}

function loadVisibility<T>(tableId: string, columns: FaroColumnDef<T>[]): Record<string, boolean> {
    const defaults = defaultVisibility(columns);

    try {
        const raw = localStorage.getItem(storageKey(tableId));
        if (!raw) {
            return defaults;
        }
        const parsed = JSON.parse(raw) as Record<string, boolean>;

        return { ...defaults, ...parsed };
    } catch {
        return defaults;
    }
}

function alignClass(align: FaroColumnDef<unknown>['align']): string {
    if (align === 'right') {
        return 'text-right';
    }
    if (align === 'center') {
        return 'text-center';
    }

    return 'text-left';
}

function ColumnHeader({
    label,
    tooltip,
    sortable,
    sortKey,
    activeSort,
    activeDirection,
    onSort,
    align,
}: {
    label: string;
    tooltip?: string;
    sortable?: boolean;
    sortKey?: string;
    activeSort?: string | null;
    activeDirection?: 'asc' | 'desc' | null;
    onSort: (key: string) => void;
    align?: 'left' | 'center' | 'right';
}) {
    const key = sortKey ?? '';
    const isActive = sortable && key !== '' && activeSort === key;
    const SortIcon = isActive
        ? activeDirection === 'asc'
            ? ArrowUp
            : ArrowDown
        : ArrowUpDown;

    return (
        <th className={cn('px-4 py-3 font-medium text-foreground', alignClass(align))}>
            <div
                className={cn(
                    'inline-flex items-center gap-1',
                    align === 'right' && 'ml-auto',
                    align === 'center' && 'mx-auto',
                )}
            >
                {sortable && key ? (
                    <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        onClick={() => onSort(key)}
                    >
                        <span>{label}</span>
                        <SortIcon className={cn('size-3.5 shrink-0', isActive && 'text-primary')} />
                    </button>
                ) : (
                    <span>{label}</span>
                )}
                {tooltip && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                                aria-label={`Ayuda: ${label}`}
                            >
                                <HelpCircle className="size-3.5" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-center">
                            {tooltip}
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
        </th>
    );
}

export function FaroDataTable<T>({
    tableId,
    columns,
    paginator,
    indexUrl,
    query = {},
    sort = null,
    direction = null,
    emptyMessage = 'No hay registros para mostrar.',
    rowKey,
}: FaroDataTableProps<T>) {
    const [visible, setVisible] = useState<Record<string, boolean>>(() =>
        loadVisibility(tableId, columns),
    );

    useEffect(() => {
        localStorage.setItem(storageKey(tableId), JSON.stringify(visible));
    }, [tableId, visible]);

    const visibleColumns = useMemo(
        () => columns.filter((col) => visible[col.id] !== false),
        [columns, visible],
    );

    const hideableColumns = useMemo(
        () => columns.filter((col) => col.hideable !== false),
        [columns],
    );

    const navigate = useCallback(
        (patch: Record<string, string | number | undefined | null>) => {
            router.get(indexUrl, mergeTableQuery(query, patch), {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [indexUrl, query],
    );

    const handleSort = useCallback(
        (sortKey: string) => {
            const nextDirection =
                sort === sortKey && direction === 'asc' ? 'desc' : 'asc';
            navigate({ sort: sortKey, direction: nextDirection, page: 1 });
        },
        [sort, direction, navigate],
    );

    const toggleColumn = (id: string, checked: boolean) => {
        const nextVisible = visibleColumns.length;
        if (!checked && nextVisible <= 1) {
            return;
        }

        setVisible((prev) => ({ ...prev, [id]: checked }));
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                    {paginator.total === 0
                        ? 'Sin resultados'
                        : `Mostrando ${paginator.from ?? 0}–${paginator.to ?? 0} de ${paginator.total}`}
                </p>
                {hideableColumns.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" variant="outline" size="sm" className="gap-2">
                                <Columns3 className="size-4" />
                                Columnas
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {hideableColumns.map((col) => (
                                <DropdownMenuCheckboxItem
                                    key={col.id}
                                    checked={visible[col.id] !== false}
                                    onCheckedChange={(checked) =>
                                        toggleColumn(col.id, checked === true)
                                    }
                                >
                                    {col.label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            <div className="faro-table-wrap overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border/40 bg-muted/30">
                            {visibleColumns.map((col) => (
                                <ColumnHeader
                                    key={col.id}
                                    label={col.label}
                                    tooltip={col.tooltip}
                                    sortable={col.sortable}
                                    sortKey={col.sortKey ?? col.id}
                                    activeSort={sort}
                                    activeDirection={direction}
                                    onSort={handleSort}
                                    align={col.align}
                                />
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginator.data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={visibleColumns.length}
                                    className="px-4 py-10 text-center text-muted-foreground"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginator.data.map((row, rowIndex) => (
                                <tr
                                    key={rowKey ? rowKey(row) : rowIndex}
                                    className="border-b border-border/30 last:border-0 transition-colors hover:bg-muted/25"
                                >
                                    {visibleColumns.map((col) => (
                                        <td
                                            key={col.id}
                                            className={cn(
                                                'px-4 py-3',
                                                alignClass(col.align),
                                                col.cellClassName,
                                            )}
                                        >
                                            {col.cell(row)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {paginator.last_page > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                        Página {paginator.current_page} de {paginator.last_page}
                    </p>
                    <div className="flex flex-wrap items-center gap-1">
                        {paginator.links.map((link, index) => {
                            const label = link.label
                                .replace('&laquo;', '«')
                                .replace('&raquo;', '»')
                                .replace(/Previous|Next/g, (m) =>
                                    m === 'Previous' ? 'Anterior' : 'Siguiente',
                                );
                            const isNav =
                                label.includes('«') ||
                                label.includes('»') ||
                                label === 'Anterior' ||
                                label === 'Siguiente';

                            if (!link.url) {
                                return (
                                    <span
                                        key={index}
                                        className="rounded-md px-3 py-1.5 text-sm text-muted-foreground/50"
                                    >
                                        {isNav ? (
                                            label.includes('«') || label === 'Anterior' ? (
                                                <ChevronLeft className="size-4" />
                                            ) : (
                                                <ChevronRight className="size-4" />
                                            )
                                        ) : (
                                            label
                                        )}
                                    </span>
                                );
                            }

                            return (
                                <Button
                                    key={index}
                                    type="button"
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    className="min-w-9"
                                    onClick={() => router.visit(link.url!)}
                                >
                                    {isNav ? (
                                        label.includes('«') || label === 'Anterior' ? (
                                            <ChevronLeft className="size-4" />
                                        ) : (
                                            <ChevronRight className="size-4" />
                                        )
                                    ) : (
                                        label
                                    )}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
