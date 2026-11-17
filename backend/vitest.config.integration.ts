import { defineConfig } from 'vitest/config';
import { configureTestDatabase } from './test/support/database-env.js';

configureTestDatabase();

export default defineConfig({
  test: {
    globals: true,
    include: ['test/integration/**/*.integration.ts'],
    globalSetup: ['./test/support/reset-database.ts'],
    fileParallelism: false,
    testTimeout: 15000,
    hookTimeout: 30000,
  },
});
