import { PrismaClient } from "@prisma/client";

const globalWithPrisma = global as typeof global & {
  prisma: PrismaClient;
};

export const prisma =
  globalWithPrisma.prisma ||
  new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") {
  globalWithPrisma.prisma = prisma;
}
