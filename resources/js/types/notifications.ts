export type AlquilerNotificacionItem = {
    id: number;
    codigo: string;
    estado: string;
    fecha_fin_prevista: string;
    cliente: { id: number; nombre: string } | null;
};

export type StockBajoNotificacionItem = {
    id: number;
    nombre: string;
    codigo: string;
    disponible: string;
    stock_minimo: string;
    stock_total: string;
};

export type AlquilerNotificaciones = {
    dias_ventana: number;
    total: number;
    proximos: AlquilerNotificacionItem[];
    atrasados: AlquilerNotificacionItem[];
    stock_bajo: StockBajoNotificacionItem[];
};
