export interface Booking {
    id: number;
    fecha: string;
    estado: string;
    cliente: {
        id: number; // Agregar esta línea
        nombre: string;
        foto?: string; // Opcional, si necesitas
    };
    entrenadorNombre: string;
}