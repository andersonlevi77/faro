export type EstadoAlquilerColor = 'gray' | 'yellow' | 'blue' | 'indigo' | 'green' | 'emerald' | 'red';

export const ESTADO_ALQUILER_BADGE: Record<EstadoAlquilerColor, string> = {
    gray: 'bg-gray-200 text-gray-800 ring-gray-300/60 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-600',
    yellow: 'bg-yellow-100 text-yellow-900 ring-yellow-300/60 dark:bg-yellow-900/50 dark:text-yellow-100',
    blue: 'bg-blue-100 text-blue-900 ring-blue-300/60 dark:bg-blue-900/50 dark:text-blue-100',
    indigo: 'bg-indigo-100 text-indigo-900 ring-indigo-300/60 dark:bg-indigo-900/50 dark:text-indigo-100',
    green: 'bg-green-100 text-green-900 ring-green-300/60 dark:bg-green-900/50 dark:text-green-100',
    emerald: 'bg-emerald-100 text-emerald-900 ring-emerald-300/60 dark:bg-emerald-900/50 dark:text-emerald-100',
    red: 'bg-red-100 text-red-900 ring-red-300/60 dark:bg-red-900/50 dark:text-red-100',
};

export const ESTADO_ALQUILER_DOT: Record<EstadoAlquilerColor, string> = {
    gray: 'bg-gray-400',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    emerald: 'bg-emerald-500',
    red: 'bg-red-500',
};

export const ESTADO_ALQUILER_STEP: Record<EstadoAlquilerColor, string> = {
    gray: 'border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-800/60 dark:text-gray-200',
    yellow: 'border-yellow-300 bg-yellow-50 text-yellow-900 dark:border-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-100',
    blue: 'border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-100',
    indigo: 'border-indigo-300 bg-indigo-50 text-indigo-900 dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-100',
    green: 'border-green-300 bg-green-50 text-green-900 dark:border-green-700 dark:bg-green-950/40 dark:text-green-100',
    emerald: 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100',
    red: 'border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950/40 dark:text-red-100',
};

export function badgeEstadoAlquiler(color: string): string {
    return ESTADO_ALQUILER_BADGE[color as EstadoAlquilerColor] ?? ESTADO_ALQUILER_BADGE.gray;
}

export function dotEstadoAlquiler(color: string): string {
    return ESTADO_ALQUILER_DOT[color as EstadoAlquilerColor] ?? ESTADO_ALQUILER_DOT.gray;
}

export function stepEstadoAlquiler(color: string): string {
    return ESTADO_ALQUILER_STEP[color as EstadoAlquilerColor] ?? ESTADO_ALQUILER_STEP.gray;
}
