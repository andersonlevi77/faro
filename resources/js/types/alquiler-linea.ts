export type AlquilerLineaForm = {
    producto_id: number | '';
    cantidad: string;
    precio_diario: string;
};

export function emptyAlquilerLinea(): AlquilerLineaForm {
    return {
        producto_id: '',
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
        cantidad,
        precio_diario: precioAlquilerDiario,
    };
}
