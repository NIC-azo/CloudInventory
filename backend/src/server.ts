import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import { router } from "@/routes/index.routes.js";

const PORT = process.env["PORT_BACKEND_LOCAL"] || process.env["PORT"] || 3000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// RF-06: Endpoint raíz de comprobación de salud
app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
        status: "ok",
        message: "CloudInventory Backend en línea",
        timestamp: new Date().toISOString(),
    });
});

app.use("/api", router);

// Middleware global para captura de errores
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error no controlado:", err);
    res.status(500).json({
        message: "Error interno del servidor",
        error: process.env["NODE_ENV"] === "development" ? err.message : undefined,
    });
});

app.listen(PORT, () => {
    console.log(`escuchando en puerto ${PORT}`);
});
