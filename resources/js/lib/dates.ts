const ZONA_GUATEMALA = 'America/Guatemala';
const LOCALE = 'es-GT';

/** Extrae YYYY-MM-DD sin aplicar desfase de zona horaria. */
export function fechaYmd(value: string): string {
    return value.slice(0, 10);
}

/** Fecha calendario (sin hora), p. ej. períodos previstos. */
export function fmtFecha(value: string): string {
    const [year, month, day] = fechaYmd(value).split('-').map(Number);

    return new Intl.DateTimeFormat(LOCALE, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(Date.UTC(year, month - 1, day)));
}

/** Fecha y hora en zona horaria de Guatemala. */
export function fmtFechaHora(value: string): string {
    return new Intl.DateTimeFormat(LOCALE, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: ZONA_GUATEMALA,
    }).format(new Date(value));
}

/** Rango de fechas calendario. */
export function fmtRangoFechas(inicio: string, fin: string): string {
    return `${fmtFecha(inicio)} → ${fmtFecha(fin)}`;
}
