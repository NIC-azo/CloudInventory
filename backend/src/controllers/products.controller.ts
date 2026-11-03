import "dotenv/config";
import type { Request, Response } from "express";
import productsModels from "@/models/products.models.js";
import { ApiResponse } from "@/utils/api_response.util.js";
import { errorHandler } from "@/middlewares/error.middleware.js";
import type { CreateProducts } from "@/types/products.types.js";

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
    });
}