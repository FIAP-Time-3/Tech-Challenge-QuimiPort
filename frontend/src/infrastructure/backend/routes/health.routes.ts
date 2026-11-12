import { api } from '../api';
import type {
  DbHealthResponseDto,
  HealthResponseDto,
} from '../dtos/health.dtos';

const baseUrl = 'health';

export const healthApiRoutes = {
  getHealth: (signal?: AbortSignal) => {
    return api.get<HealthResponseDto>(baseUrl, { signal });
  },
  getDbHealth: () => {
    return api.get<DbHealthResponseDto>(`${baseUrl}/db`);
  },
};
