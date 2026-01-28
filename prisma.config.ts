// prisma.config.ts
// Optional helper to initialize Prisma Client in TypeScript
import { PrismaClient } from "@prisma/client";

// Prevent multiple instances in development (Next.js hot reload)
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
  log: ["query", "error", "warn"],
});

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
