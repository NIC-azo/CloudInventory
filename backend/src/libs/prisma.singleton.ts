import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config"

const prismaGlobalVariables = globalThis as unknown as {
    prismaGlobal: PrismaClient | undefined;
    poolGlobal: Pool | undefined;
}

const environment = process.env["NODE_ENV"] === "dev";
const db_url = process.env["DATABASE_URL"] || "";

const poolConfig = prismaGlobalVariables.poolGlobal ?? new Pool({
    connectionString: db_url,
    ssl: environment ? { rejectUnauthorized: false } : true,
});

const adapter = new PrismaPg(poolConfig);

const prismaInstance = prismaGlobalVariables.prismaGlobal ?? new PrismaClient({
    adapter: adapter,
    log: ["query", "info", "warn", "error"],
});

if (environment) {
    prismaGlobalVariables.prismaGlobal = prismaInstance;
    prismaGlobalVariables.poolGlobal = poolConfig;
}

export default prismaInstance;