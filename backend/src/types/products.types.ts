export interface Products {
    id: string;
    sku: string;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    activo: boolean;
    fecha_creacion: Date;
    fecha_actualizacion: Date;
};

export interface CreateProducts {
    SKU: string;
    nombre: string;
    descripcion: string;
    precio: number;
    stock?: number;
}

export interface UpdateProducts {
    SKU?: string;
    nombre?: string;
    descripcion?: string;
    precio?: string;
    stock?: number;
}
