import { api } from '@/infrastructure/backend/api';
import type { Health } from '@/modules/health/models/health';

export function getHealth() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);



  async function request(): Promise<Health> {
    try {
      const response = await api.get<Health>('health')
      return response.data
    } finally {
      clearTimeout(timeout);
    }
  }

  return { promise: request(), cancel: () => controller.abort() };
}
