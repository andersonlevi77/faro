import { usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useMemo } from 'react';

function mensajesValidacion(errors: Record<string, unknown> | undefined): string[] {
    if (!errors) {
        return [];
    }
    const salida: string[] = [];
    for (const v of Object.values(errors)) {
        if (typeof v === 'string' && v.trim() !== '') {
            salida.push(v);
        } else if (Array.isArray(v)) {
            for (const item of v) {
                if (typeof item === 'string' && item.trim() !== '') {
                    salida.push(item);
                }
            }
        }
    }
    return salida;
}

export function AppFlashMessages() {
    const { flash, errors } = usePage().props as {
        flash?: { success?: string | null; error?: string | null };
        errors?: Record<string, unknown>;
    };

    const mensajes = useMemo(() => mensajesValidacion(errors), [errors]);
    const hayErroresValidacion = mensajes.length > 0;

    return (
        <div className="space-y-3 px-4 pt-3 md:px-5" role="region" aria-label="Mensajes del sistema">
            {flash?.success ? (
                <div className="flex gap-3 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <p className="min-w-0 leading-relaxed">{flash.success}</p>
                </div>
            ) : null}
            {flash?.error ? (
                <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <p className="min-w-0 leading-relaxed font-medium">{flash.error}</p>
                </div>
            ) : null}
            {hayErroresValidacion ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
                    <p className="flex items-start gap-2 font-medium text-destructive">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                        <span>No se pudo guardar. Revisa los datos o los mensajes siguientes.</span>
                    </p>
                    {mensajes.length > 0 ? (
                        <ul className="mt-2 list-inside list-disc space-y-1 text-foreground/90">
                            {mensajes.slice(0, 8).map((msg, i) => (
                                <li key={i} className="leading-relaxed">
                                    {msg}
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
