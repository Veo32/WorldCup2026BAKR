import { PrismaClient } from '@prisma/client';

const FORCE_DISABLE_DB = false;

const globalThisWithPrisma = globalThis as typeof globalThis & {
  prismaGlobal?: PrismaClient;
};

let prismaInstance: PrismaClient | null = null;

if (!FORCE_DISABLE_DB) {
  try {
    prismaInstance = globalThisWithPrisma.prismaGlobal ?? new PrismaClient({
      log: [
        { emit: 'stdout', level: 'error' }, // تم إضافة الفاصلة هنا
        { emit: 'stdout', level: 'warn' }
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      globalThisWithPrisma.prismaGlobal = prismaInstance;
    }

    console.log("💎 [Database System] Prisma Client initialized successfully.");
  } catch (error) {
    console.error("❌ [Database Initialization Error]: Failed to boot Prisma Client.", error);
    prismaInstance = null;
  }
}

export const checkDatabaseHealth = async (): Promise<boolean> => {
  if (!prismaInstance) return false;
  try {
    await prismaInstance.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
};

export const prisma = prismaInstance;