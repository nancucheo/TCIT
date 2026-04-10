import { PrismaClient } from '@prisma/client';

// Singleton PrismaClient instance to avoid exhausting the database connection pool
const prisma = new PrismaClient();

export default prisma;
