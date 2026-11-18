import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const prismaGlobalVariables = globalThis as unknown as {
    prismaGlobal: PrismaClient | undefined;
    poolGlobal: Pool | undefined;
};

const isProduction = process.env["NODE_ENV"] === "production";
const db_url = process.env["DATABASE_URL"] || "";

const poolConfig = prismaGlobalVariables.poolGlobal ?? new Pool({
    connectionString: db_url,
    // En Docker local PostgreSQL no usa SSL; solo se activa en producción
    ssl: isProduction ? { rejectUnauthorized: false } : false,
});

const adapter = new PrismaPg(poolConfig);

const prismaInstance = prismaGlobalVariables.prismaGlobal ?? new PrismaClient({
    adapter: adapter,
    log: ["query", "info", "warn", "error"],
});

if (!isProduction) {
    prismaGlobalVariables.prismaGlobal = prismaInstance;
    prismaGlobalVariables.poolGlobal = poolConfig;
}

export default prismaInstance;
