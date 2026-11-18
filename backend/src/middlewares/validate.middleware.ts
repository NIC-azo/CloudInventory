import type { Request, Response, NextFunction } from "express";
import { type ZodType, ZodError } from "zod";
import { ApiResponse } from "@/utils/api_response.util.js";

/**
 * Middleware para validar el cuerpo (body) de las peticiones HTTP con un esquema de Zod.
 */
export const validateBody = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const formattedErrors = result.error.issues.map((issue) => ({
                campo: issue.path.join("."),
                mensaje: issue.message,
            }));

            ApiResponse.errorOperation(
                res,
                {
                    mensaje: "Datos de entrada inválidos",
                    errores: formattedErrors,
                },
                400
            );
            return;
        }

        // Reemplaza el body con los datos ya parseados, tipados y saneados por Zod
        req.body = result.data;
        next();
    };
};

/**
 * Middleware para validar los parámetros de la URL (req.params) con un esquema de Zod.
 */
export const validateParams = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.params);

        if (!result.success) {
            const formattedErrors = result.error.issues.map((issue) => ({
                campo: issue.path.join("."),
                mensaje: issue.message,
            }));

            ApiResponse.errorOperation(
                res,
                {
                    mensaje: "Parámetros de ruta inválidos",
                    errores: formattedErrors,
                },
                400
            );
            return;
        }

        req.params = result.data as Record<string, string>;
        next();
    };
};
