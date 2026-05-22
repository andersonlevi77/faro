import { fechaYmd } from '@/lib/dates';
import type { AlquilerLineaForm } from '@/types/alquiler-linea';

/**
 * Días de contrato previstos (inicio y fin inclusive), igual que {@see \App\Models\Alquiler::calcularDias}.
 */
export function diasContratoPrevistos(fechaInicio: string, fechaFin: string): number {
    const a = fechaYmd(fechaInicio);
    const b = fechaYmd(fechaFin);
    if (a.length < 10 || b.length < 10) {
        return 0;
    }
    const [y1, m1, d1] = a.split('-').map(Number);
    const [y2, m2, d2] = b.split('-').map(Number);
    const t1 = Date.UTC(y1, m1 - 1, d1);
    const t2 = Date.UTC(y2, m2 - 1, d2);
    if (Number.isNaN(t1) || Number.isNaN(t2) || t2 < t1) {
        return 0;
    }
    const diff = Math.floor((t2 - t1) / 86400000) + 1;

    return Math.max(1, diff);
}

function precioDiarioLinea(
    linea: AlquilerLineaForm,
    precioListaPorProductoId: Map<number, string>,
): number {
    const manual = linea.precio_diario.trim();
    if (manual !== '' && !Number.isNaN(Number.parseFloat(manual))) {
        return Math.max(0, Number.parseFloat(manual));
    }
    if (linea.producto_id !== '') {
        const lista = precioListaPorProductoId.get(Number(linea.producto_id));

        return lista !== undefined && lista !== '' ? Math.max(0, Number.parseFloat(lista) || 0) : 0;
    }

    return 0;
}

/**
 * Suma de subtotales estimados (cantidad × precio/día × días), alineado con el guardado en servidor.
 */
export function totalAlquilerEstimadoDesdeLineas(
    fechaInicio: string,
    fechaFin: string,
    lineas: AlquilerLineaForm[],
    precioListaPorProductoId: Map<number, string>,
): number {
    const dias = diasContratoPrevistos(fechaInicio, fechaFin);
    if (dias === 0) {
        return 0;
    }
    let suma = 0;
    for (const linea of lineas) {
        const cant = Number.parseFloat(String(linea.cantidad)) || 0;
        const precio = precioDiarioLinea(linea, precioListaPorProductoId);
        suma += cant * precio * dias;
    }

    return Math.round((suma + Number.EPSILON) * 100) / 100;
}
