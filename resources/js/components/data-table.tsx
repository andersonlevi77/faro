import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type DataTableProps = {
    children: ReactNode;
    className?: string;
};

export function DataTable({ children, className }: DataTableProps) {
    return <div className={cn('faro-table-wrap', className)}>{children}</div>;
}
