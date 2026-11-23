import { ForbiddenException } from '@nestjs/common';
import { isEmail } from 'class-validator';
import { PrismaService } from '../../database/prisma.service.js';
import { UserService } from './application/user.service.js';

async function seedAdmin() {
  const name = process.env.SEED_ADMIN_NAME?.trim();
  const email = process.env.SEED_ADMIN_EMAIL?.trim();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!name || !email || !isEmail(email) || !password?.trim()) {
    throw new Error(
      'Informe SEED_ADMIN_NAME, SEED_ADMIN_EMAIL válido e SEED_ADMIN_PASSWORD.',
    );
  }

  const prisma = new PrismaService();
  try {
    await new UserService(prisma).createFirst({
      body: { name, email, password },
    });
  } catch (error) {
    if (!(error instanceof ForbiddenException)) {
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? error.message
      : 'Falha ao criar administrador inicial.',
  );
  process.exitCode = 1;
});
