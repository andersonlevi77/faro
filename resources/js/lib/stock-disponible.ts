import type { AlquilerLineaForm, PaqueteAlquilerSource } from '@/types/alquiler-linea';
import { parseCantidadEntera } from '@/lib/cantidad-entera';

type ItemDemandaStock =
    | { tipo: 'producto'; producto_id: number; cantidad: string }
    | { tipo: 'paquete'; paquete_id: number; cantidad: string };

export function parseStockCantidad(value: string | number | undefined): number {
    return parseCantidadEntera(value);
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

        return sum + parseCantidadEntera(linea.cantidad);
    }, 0);
}

/**
 * Disponible para agregar más unidades de un producto.
 * stock_disponible = stock total − otros alquileres activos (no incluye alerta de stock mínimo).
 */
export function disponibleRestanteProducto(
    stockDisponible: string,
    lineasFormulario: AlquilerLineaForm[],
    productoId: number,
    cantidadOtraEnCarrito = 0,
    excluirIndiceLinea?: number,
): number {
    const base = parseCantidadEntera(stockDisponible);
    const enFormulario = cantidadProductoEnLineas(lineasFormulario, productoId, excluirIndiceLinea);

    return Math.max(0, base - enFormulario - cantidadOtraEnCarrito);
}

/** Máximo de paquetes completos según stock de cada producto del paquete. */
export function disponibleRestantePaquete(
    stockDisponiblePaquete: string,
    lineasFormulario: AlquilerLineaForm[],
    paqueteId: number,
    cantidadOtraEnCarrito = 0,
    excluirIndiceLinea?: number,
): number {
    const base = parseCantidadEntera(stockDisponiblePaquete);
    const enFormulario = lineas.reduce((sum, linea, idx) => {
        if (idx === excluirIndiceLinea || linea.paquete_id !== paqueteId) {
            return sum;
        }

        return sum + parseCantidadEntera(linea.cantidad);
    }, 0);

    return Math.max(0, base - enFormulario - cantidadOtraEnCarrito);
}

/** Unidades de cada producto requeridas por líneas del formulario y/o carrito del catálogo. */
export function demandaUnidadesPorProducto(
    lineas: AlquilerLineaForm[],
    paquetes: Map<number, PaqueteAlquilerSource>,
    itemsExtra: ItemDemandaStock[] = [],
): Map<number, number> {
    const demanda = new Map<number, number>();

    const sumar = (productoId: number, unidades: number) => {
        if (unidades <= 0) {
            return;
        }
        demanda.set(productoId, (demanda.get(productoId) ?? 0) + unidades);
    };

    const procesarLinea = (linea: AlquilerLineaForm) => {
        const cantidad = parseCantidadEntera(linea.cantidad);
        if (linea.producto_id !== '') {
            sumar(linea.producto_id, cantidad);
        } else if (linea.paquete_id !== '') {
            const paquete = paquetes.get(linea.paquete_id);
            paquete?.productos.forEach((item) => {
                sumar(item.id, cantidad * parseCantidadEntera(item.cantidad));
            });
        }
    };

    const procesarItem = (item: ItemDemandaStock) => {
        const cantidad = parseCantidadEntera(item.cantidad);
        if (item.tipo === 'producto') {
            sumar(item.producto_id, cantidad);
        } else {
            const paquete = paquetes.get(item.paquete_id);
            paquete?.productos.forEach((p) => {
                sumar(p.id, cantidad * parseCantidadEntera(p.cantidad));
            });
        }
    };

    lineas.forEach(procesarLinea);
    itemsExtra.forEach(procesarItem);

    return demanda;
}

/**
 * Valida que la demanda combinada (productos sueltos + paquetes) no supere el stock disponible.
 */
export function mensajeErrorDemandaStock(
    lineas: AlquilerLineaForm[],
    productos: { id: number; nombre: string; stock_disponible: string }[],
    paquetes: Map<number, PaqueteAlquilerSource>,
    itemsExtra: ItemDemandaStock[] = [],
): string | null {
    const productoPorId = new Map(productos.map((p) => [p.id, p]));
    const demanda = demandaUnidadesPorProducto(lineas, paquetes, itemsExtra);

    for (const [productoId, necesario] of demanda) {
        const producto = productoPorId.get(productoId);
        if (!producto) {
            continue;
        }
        const disponible = parseCantidadEntera(producto.stock_disponible);
        if (necesario > disponible) {
            return `No hay suficiente «${producto.nombre}» disponible (máx. ${disponible}).`;
        }
    }

    for (const item of itemsExtra) {
        if (item.tipo !== 'paquete') {
            continue;
        }
        const paquete = paquetes.get(item.paquete_id);
        if (!paquete) {
            continue;
        }
        const cantidad = parseCantidadEntera(item.cantidad);
        const maxPaquetes = disponibleRestantePaquete(
            paquete.stock_disponible,
            lineas,
            paquete.id,
            0,
        );
        if (cantidad > maxPaquetes) {
            return `«${paquete.nombre}» supera el disponible (${maxPaquetes} paquete(s)).`;
        }
    }

    return null;
}
