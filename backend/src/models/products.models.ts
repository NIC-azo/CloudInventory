import prismaInstance from "@/libs/prisma.singleton.js";
import type { CreateProducts, UpdateProducts } from "@/types/products.types.js";

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

    createProducts = async (data: CreateProducts) => {
        return await prismaInstance.products.create({
            data: data,
            select: {
                id: true,
            },
        });
    };

    updateProducts = async (id: string, data: UpdateProducts) => {
        return await prismaInstance.products.update({
            where: { id: id },
            data: data,
            select: {
                id: true,
            },
        });
    };

    deleteProducts = async (id: string) => {
        return await prismaInstance.products.update({
            where: { id: id },
            data: { activo: false },
            select: { id: true },
        });
    };
}

export default new ProductModel();