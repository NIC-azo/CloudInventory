import productsRoute from "@routes/products.route.js";
import { Router } from "express";

const router: Router = Router();

router.use('/products', productsRoute);

export { router };