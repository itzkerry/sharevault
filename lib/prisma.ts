import { PrismaClient } from "@/app/generated/prisma";

const globalForPrisma = global as unknown as {prisma: PrismaClient}

export const prisma = globalForPrisma.prisma || new PrismaClient()

globalForPrisma.prisma = prisma