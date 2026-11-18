import prismaInstance from "@/libs/prisma.singleton.js";
import type { CreateProductInput, UpdateProductInput } from "@/schemas/products.schema.js";

class ProductModel {
    getProducts = async () => {
        return await prismaInstance.products.findMany({
            where: {
                activo: true,
            },
            orderBy: {
                fecha_creacion: "asc",
            },
        });
    };

    getProductById = async (id: string) => {
        return await prismaInstance.products.findUnique({
            where: {
                id: id,
            },
        });
    };

    getProductBySku = async (sku: string) => {
        return await prismaInstance.products.findUnique({
            where: {
                SKU: sku,
            },
            select: {
                id: true,
                SKU: true,
            },
        });
    };

    // Mantenemos compatibilidad con getProduct anterior
    getProduct = async (sku: string) => {
        return await this.getProductBySku(sku);
    };

    createProducts = async (data: CreateProductInput) => {
        return await prismaInstance.products.create({
            data: data,
            select: {
                id: true,
                SKU: true,
                nombre: true,
                precio: true,
                stock: true,
            },
        });
    };

    updateProducts = async (id: string, data: UpdateProductInput) => {
        return await prismaInstance.products.update({
            where: { id: id },
            data: data,
            select: {
                id: true,
                SKU: true,
                nombre: true,
                precio: true,
                stock: true,
                fecha_actualizacion: true,
            },
        });
    };

    deleteProducts = async (id: string) => {
        return await prismaInstance.products.update({
            where: { id: id },
            data: { activo: false },
            select: { id: true, activo: true },
        });
    };
}

export default new ProductModel();
