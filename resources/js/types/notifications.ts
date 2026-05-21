export type AlquilerNotificacionItem = {
    id: number;
    codigo: string;
    estado: string;
    fecha_fin_prevista: string;
    cliente: { id: number; nombre: string } | null;
};

export type AlquilerNotificaciones = {
    dias_ventana: number;
    total: number;
    proximos: AlquilerNotificacionItem[];
    atrasados: AlquilerNotificacionItem[];
};
