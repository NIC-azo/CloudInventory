import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
    fn: Function
) => (req: Request, res: Response, next: NextFunction) => {
    // resuelve metodos si pasa | pasamos a ese error si es que hay
    Promise.resolve(fn(req, res, next)).catch(next);
}