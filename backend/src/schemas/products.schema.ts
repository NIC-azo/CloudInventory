import { z } from "zod";

/**
 * Esquema de validación para la creación de productos (RF-01 y RF-05)
 * - SKU: código único no vacío (3 a 30 caracteres)
 * - nombre: nombre comercial (mínimo 2 caracteres)
 * - descripcion: texto descriptivo
 * - precio: valor numérico positivo mayor a 0 (rechaza negativos)
 * - stock: entero mayor o igual a 0 (rechaza cantidades negativas)
 */
export const createProductSchema = z.object({
    SKU: z
        .string({
            required_error: "El SKU es obligatorio",
            invalid_type_error: "El SKU debe ser un texto",
        })
        .trim()
        .min(3, "El SKU debe tener al menos 3 caracteres")
        .max(30, "El SKU no puede exceder los 30 caracteres"),
    nombre: z
        .string({
            required_error: "El nombre es obligatorio",
            invalid_type_error: "El nombre debe ser un texto",
        })
        .trim()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder los 100 caracteres"),
    descripcion: z
        .string({
            required_error: "La descripción es obligatoria",
            invalid_type_error: "La descripción debe ser un texto",
        })
        .trim()
        .min(1, "La descripción no puede estar vacía"),
    precio: z
        .number({
            required_error: "El precio es obligatorio",
            invalid_type_error: "El precio debe ser un número",
        })
        .positive("El precio debe ser un número positivo mayor a 0"),
    stock: z
        .number({
            invalid_type_error: "El stock debe ser un número entero",
        })
        .int("El stock debe ser un número entero")
        .nonnegative("El stock no puede ser un número negativo")
        .optional()
        .default(0),
});

/**
 * Esquema de validación para la actualización de productos (RF-03 y RF-05)
 * Todos los campos son opcionales pero deben cumplir las mismas reglas si se envían.
 * Además valida que al menos se envíe un campo a actualizar.
 */
export const updateProductSchema = z
    .object({
        SKU: z
            .string({ invalid_type_error: "El SKU debe ser un texto" })
            .trim()
            .min(3, "El SKU debe tener al menos 3 caracteres")
            .max(30, "El SKU no puede exceder los 30 caracteres")
            .optional(),
        nombre: z
            .string({ invalid_type_error: "El nombre debe ser un texto" })
            .trim()
            .min(2, "El nombre debe tener al menos 2 caracteres")
            .max(100, "El nombre no puede exceder los 100 caracteres")
            .optional(),
        descripcion: z
            .string({ invalid_type_error: "La descripción debe ser un texto" })
            .trim()
            .min(1, "La descripción no puede estar vacía")
            .optional(),
        precio: z
            .number({ invalid_type_error: "El precio debe ser un número" })
            .positive("El precio debe ser un número positivo mayor a 0")
            .optional(),
        stock: z
            .number({ invalid_type_error: "El stock debe ser un número entero" })
            .int("El stock debe ser un número entero")
            .nonnegative("El stock no puede ser un número negativo")
            .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "Se requiere al menos un campo para actualizar el producto",
    });

/**
 * Esquema para validar el parámetro de ruta :id_product (UUID según schema.prisma)
 */
export const productIdParamSchema = z.object({
    id_product: z
        .string({
            required_error: "El ID del producto es obligatorio",
        })
        .uuid("El ID del producto debe ser un UUID válido"),
});

// Inferencia automática de tipos de TypeScript gracias a Zod
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductIdParamInput = z.infer<typeof productIdParamSchema>;
