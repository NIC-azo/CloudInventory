import "dotenv/config";
import type { Request, Response } from "express";
import productsModels from "@/models/products.models.js";
import { ApiResponse } from "@/utils/api_response.util.js";
import { errorHandler } from "@/middlewares/error.middleware.js";
import type { CreateProductInput, UpdateProductInput } from "@/schemas/products.schema.js";

class ProductController {
    // RF-06: Endpoint de estado del servicio
    static healthCheck = errorHandler(async (_req: Request, res: Response) => {
        return ApiResponse.operations(res, "Backend activo y funcionando", 200);
    });

    // RF-02: Obtener todos los productos activos
    static getAllProducts = errorHandler(async (_req: Request, res: Response) => {
        const results = await productsModels.getProducts();
        return ApiResponse.returnResults(res, results, 200);
    });

    // RF-02: Consultar un producto individual por su ID
    static getProductById = errorHandler(async (req: Request, res: Response) => {
        const { id_product } = req.params;
        const product = await productsModels.getProductById(id_product as string);

        if (!product) {
            return ApiResponse.errorOperation(res, "Producto no encontrado", 404);
        }

        return ApiResponse.returnResults(res, product, 200);
    });

    // RF-01 y RF-05: Crear producto con validación de Zod y verificación de SKU duplicado
    static createProduct = errorHandler(async (req: Request, res: Response) => {
        // req.body ya fue validado y tipado por el middleware de Zod
        const input = req.body as CreateProductInput;

        // Regla de negocio: Verificar si el SKU ya existe
        const existingProduct = await productsModels.getProductBySku(input.SKU);
        if (existingProduct) {
            return ApiResponse.errorOperation(
                res,
                `El código SKU '${input.SKU}' ya se encuentra registrado`,
                400
            );
        }

        const productCreated = await productsModels.createProducts(input);
        return ApiResponse.returnResults(res, productCreated, 201);
    });

    // RF-03 y RF-05: Actualizar producto
    static updateProduct = errorHandler(async (req: Request, res: Response) => {
        const { id_product } = req.params;
        const input = req.body as UpdateProductInput;

        // Verificar que el producto exista
        const productExists = await productsModels.getProductById(id_product as string);
        if (!productExists) {
            return ApiResponse.errorOperation(res, "Producto no encontrado", 404);
        }

        // Si se va a modificar el SKU, verificar que no pertenezca a otro producto
        if (input.SKU) {
            const productWithSku = await productsModels.getProductBySku(input.SKU);
            if (productWithSku && productWithSku.id !== id_product) {
                return ApiResponse.errorOperation(
                    res,
                    `El código SKU '${input.SKU}' ya pertenece a otro producto`,
                    400
                );
            }
        }

        const productUpdated = await productsModels.updateProducts(id_product as string, input);
        return ApiResponse.returnResults(res, productUpdated, 200);
    });

    // RF-04: Desactivar producto (baja lógica sin eliminar de la base de datos)
    static deleteProduct = errorHandler(async (req: Request, res: Response) => {
        const { id_product } = req.params;

        const productExists = await productsModels.getProductById(id_product as string);
        if (!productExists) {
            return ApiResponse.errorOperation(res, "Producto no encontrado", 404);
        }

        await productsModels.deleteProducts(id_product as string);
        return ApiResponse.operations(res, "Producto desactivado correctamente", 200);
    });
}

export default ProductController;
