export interface DbHealthResponseDto {
  database: boolean;
}

export interface HealthResponseDto {
  api: 'ok';
  status: 'ok' | 'degraded';
  timestamp: string;
  uptime: string;
  services: DbHealthResponseDto;
}
