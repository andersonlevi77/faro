import type { AlquilerLineaForm } from '@/types/alquiler-linea';

export function parseStockCantidad(value: string | number | undefined): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

/** Cantidad ya usada en líneas del formulario (mismo producto). */
export function cantidadProductoEnLineas(
    lineas: AlquilerLineaForm[],
    productoId: number,
    excluirIndice?: number,
): number {
    return lineas.reduce((sum, linea, idx) => {
        if (idx === excluirIndice) {
            return sum;
        }
        if (linea.paquete_id !== '' || linea.producto_id !== productoId) {
            return sum;
        }

        return sum + parseStockCantidad(linea.cantidad);
    }, 0);
}

/**
 * Disponible para agregar más unidades de un producto en el formulario/catálogo.
 * stock_disponible viene del servidor (stock total menos otros alquileres activos).
 */
export function disponibleRestanteProducto(
    stockDisponible: string,
    lineasFormulario: AlquilerLineaForm[],
    productoId: number,
    cantidadEnCarrito = 0,
    excluirIndiceLinea?: number,
): number {
    const base = parseStockCantidad(stockDisponible);
    const enFormulario = cantidadProductoEnLineas(lineasFormulario, productoId, excluirIndiceLinea);

    return Math.max(0, base - enFormulario - cantidadEnCarrito);
}
