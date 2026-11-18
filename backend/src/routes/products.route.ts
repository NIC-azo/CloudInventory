import ProductController from "@/controllers/products.controller.js";
import { Router } from "express";
import { validateBody, validateParams } from "@/middlewares/validate.middleware.js";
import {
    createProductSchema,
    updateProductSchema,
    productIdParamSchema,
} from "@/schemas/products.schema.js";

class ProductsRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this.routerMethods();
    }

    private routerMethods(): void {
        // RF-06: Endpoint de comprobación de disponibilidad
        this.router.get('/health', ProductController.healthCheck);

        // RF-02: Listar todos los productos
        this.router.get('/', ProductController.getAllProducts);

        // RF-02: Consultar un producto por su ID
        this.router.get(
            '/:id_product',
            validateParams(productIdParamSchema),
            ProductController.getProductById
        );

        // RF-01 & RF-05: Registrar producto con validación de esquema
        this.router.post(
            '/create',
            validateBody(createProductSchema),
            ProductController.createProduct
        );

        // RF-03 & RF-05: Actualizar producto con validación de ID y campos
        this.router.put(
            '/update/:id_product',
            validateParams(productIdParamSchema),
            validateBody(updateProductSchema),
            ProductController.updateProduct
        );

        // RF-04: Desactivar producto (baja lógica)
        this.router.delete(
            '/delete/:id_product',
            validateParams(productIdParamSchema),
            ProductController.deleteProduct
        );
    }
}

export default new ProductsRouter().router;
