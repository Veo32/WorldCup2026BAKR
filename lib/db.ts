import { PrismaClient } from '@prisma/client';

const FORCE_DISABLE_DB = false;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  FORCE_DISABLE_DB
    ? null
    : globalForPrisma.prisma ||
      new PrismaClient({
        datasourceUrl: process.env.DATABASE_URL,
        log: [
          { emit: 'stdout', level: 'error' },
          { emit: 'stdout', level: 'warn' },
        ],
      });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma as PrismaClient;
}

export const checkDatabaseHealth = async (): Promise<boolean> => {
  if (!prisma) return false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("DB health check failed:", error);
    return false;
  }
};