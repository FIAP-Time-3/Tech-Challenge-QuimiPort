import { getHealth as fetchHealth } from '@/modules/health/services/healthService';

export function getHealth() {
  return fetchHealth();
}
