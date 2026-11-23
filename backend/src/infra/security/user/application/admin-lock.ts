import { Prisma } from '../../../database/generated/prisma/client.js';
import type { PrismaService } from '../../../database/prisma.service.js';

export function withAdminLock<T>(
  prisma: PrismaService,
  operation: (transaction: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(
    async (transaction) => {
      await transaction.$executeRaw`SELECT pg_advisory_xact_lock(714205)`;
      return operation(transaction);
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
  );
}
