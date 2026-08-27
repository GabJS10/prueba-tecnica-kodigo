import { PrismaClient } from '@prisma/client';

/** Cliente Prisma único para toda la app. */
export const prisma = new PrismaClient();
