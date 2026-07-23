import { PrismaClient } from '@prisma/client';

// Singleton pour éviter d'ouvrir trop de connexions en dev (hot reload)
export const prisma = new PrismaClient();
