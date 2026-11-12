import { getHealth as fetchHealth } from '@/modules/health/services/health.service';

export function getHealth() {
  return fetchHealth();
}
