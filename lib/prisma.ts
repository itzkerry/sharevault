import { PrismaClient } from "@/app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = global as unknown as {prisma: PrismaClient}

const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL!
})
export const prisma = 
    globalForPrisma.prisma || 
    new PrismaClient({adapter})

globalForPrisma.prisma = prisma