import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function fmtQ(value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `Q ${isNaN(num) ? '0.00' : num.toFixed(2)}`;
}

export function etiquetaOpcion(
    opciones: { value: string; label: string }[],
    value: string,
): string {
    return opciones.find((o) => o.value === value)?.label ?? value.replaceAll('_', ' ');
}
