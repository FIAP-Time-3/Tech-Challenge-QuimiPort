import { execFileSync } from 'node:child_process';
import { configureTestDatabase } from './database-env.js';

export default function setup() {
  configureTestDatabase();
  execFileSync(
    process.execPath,
    [
      'node_modules/prisma/build/index.js',
      'migrate',
      'reset',
      '--force',
      '--config',
      'prisma.test.config.ts',
    ],
    { stdio: 'inherit', env: process.env },
  );
}
