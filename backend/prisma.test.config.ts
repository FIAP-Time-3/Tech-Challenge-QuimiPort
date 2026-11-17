import { defineConfig } from 'prisma/config';
import { configureTestDatabase } from './test/support/database-env.js';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: configureTestDatabase() },
});
