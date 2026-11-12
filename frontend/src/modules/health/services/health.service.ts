import { healthApiRoutes } from '@/infrastructure/backend/routes/health.routes';
import type { Health } from '@/modules/health/models/health';

export function getHealth() {
  const controller = new AbortController();

  async function request(): Promise<Health> {
    const response = await healthApiRoutes.getHealth(controller.signal);
    return response.data;
  }

  return { promise: request(), cancel: () => controller.abort() };
}
