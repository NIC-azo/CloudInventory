import "dotenv/config";
import type { Request, Response } from "express";
import productsModels from "@/models/products.models.js";
import { ApiResponse } from "@/utils/api_response.util.js";
import { errorHandler } from "@/middlewares/error.middleware.js";
import type { CreateProducts, UpdateProducts } from "@/types/products.types.js";

class ProductController {
    static getAllProducts = errorHandler(async (req: Request, res: Response) => {
        const results = await productsModels.getProducts();
        if (!results) {
            return ApiResponse.errorOperation(res, "error interno del servidor para obtener productos", 500);
        }
        return ApiResponse.returnResults(res, results, 200);
    });
    static createProduct = errorHandler(async (req: Request, res: Response) => {
        const { ...restOfBody } = req.body;
        if (Object.keys(restOfBody).length < 1 || restOfBody === undefined) {
            return ApiResponse.errorOperation(res, "se necesita las credenciales del producto", 400)
        }
        const productConverted: CreateProducts = {
            ...restOfBody,
        };
        const productCreated = await productsModels.createProducts(productConverted);
        if (!productCreated.id || productCreated === undefined) {
            return ApiResponse.errorOperation(res, "error interno al crear producto", 500)
        }
        return ApiResponse.operations(res, "producto creado correctamente", 201)
    });
    static updateProduct = errorHandler(async (req: Request, res: Response) => {
        const { id_product } = req.params;
        const { ...restOfBody } = req.body;
        if (String(id_product) === undefined || !id_product) {
            return ApiResponse.errorOperation(res, "se requiere el id del producto", 400)
        }
        if (Object.keys(restOfBody).length < 1) {
            return ApiResponse.errorOperation(res, "se requiere almenos un dato para actualizar el producto", 400)
        }
        if (String(restOfBody.sku)) {
            const productFound = await productsModels.getProduct(String(restOfBody.sku));
            if (productFound && productFound.id !== String(id_product)) {
                return ApiResponse.errorOperation(res, "el codigo sku ya a sido registrado por otro producto", 400)
            }
        }
        const productConverted: UpdateProducts = {
            ...restOfBody
        }
        const productUpdated = await productsModels.updateProducts(String(id_product), productConverted);
        if (!productUpdated.id || productUpdated === undefined) {
            return ApiResponse.errorOperation(res, "error interno al actualizar el producto", 500)
        }
        return ApiResponse.operations(res, "producto actualizado correctamente", 200);
    })
    static deleteProduct = errorHandler(async (req: Request, res: Response) => {
        const { id_product } = req.params;
        if (String(id_product) || !id_product) {
            return ApiResponse.errorOperation(res, "se requiere id del producto para proceder", 400);
        }
        const productDeleted = await productsModels.deleteProducts(String(id_product));
        if (!productDeleted.id || productDeleted === undefined) {
            return ApiResponse.errorOperation(res, "error interno al eliminar producto", 500);
        }
        return ApiResponse.operations(res, "producto eliminado correctamente", 200);
    })
}

export default ProductController;