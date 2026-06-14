import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const FORCE_DISABLE_DB = false;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | null };

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? '',
});

export const prisma =
  FORCE_DISABLE_DB
    ? null
    : globalForPrisma.prisma ||
      new PrismaClient({
        adapter,
        log: [
          { emit: 'stdout', level: 'error' },
          { emit: 'stdout', level: 'warn' },
        ],
      });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
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