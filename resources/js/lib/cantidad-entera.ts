/** Cantidad de unidades (enteros, sin decimales). */
export function parseCantidadEntera(value: string | number | undefined): number {
    const n = Math.floor(Number(value));

    return Number.isFinite(n) && n > 0 ? n : 0;
}

export function fmtCantidadEntera(value: string | number | undefined): string {
    const n = parseCantidadEntera(value);

    return n > 0 ? String(n) : '0';
}
