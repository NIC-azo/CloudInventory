import ProductController from "@/controllers/products.controller.js";
import { Router } from "express";

class ProductsRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this.routerMethods();
    }

    private routerMethods(): void {
        this.router.get('/health', () => console.log('backend activo'));
        this.router.get('/', ProductController.getAllProducts);
        this.router.post('/create', ProductController.createProduct);
        this.router.put('/update/:id_product', ProductController.updateProduct);
        this.router.delete('/delete', ProductController.deleteProduct);
    }
}

export default new ProductsRouter().router;