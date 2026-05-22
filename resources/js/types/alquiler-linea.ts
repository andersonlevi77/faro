export type AlquilerLineaForm = {
    producto_id: number | '';
    paquete_id: number | '';
    cantidad: string;
    precio_diario: string;
};

export function emptyAlquilerLinea(): AlquilerLineaForm {
    return {
        producto_id: '',
        paquete_id: '',
        cantidad: '1',
        precio_diario: '',
    };
}

export function alquilerLineaFromProducto(
    productoId: number,
    precioAlquilerDiario: string,
    cantidad = '1',
): AlquilerLineaForm {
    return {
        producto_id: productoId,
        paquete_id: '',
        cantidad,
        precio_diario: precioAlquilerDiario,
    };
}

export function alquilerLineaFromPaquete(
    paqueteId: number,
    precioAlquiler: string,
    cantidad = '1',
): AlquilerLineaForm {
    return {
        producto_id: '',
        paquete_id: paqueteId,
        cantidad,
        precio_diario: precioAlquiler,
    };
}
