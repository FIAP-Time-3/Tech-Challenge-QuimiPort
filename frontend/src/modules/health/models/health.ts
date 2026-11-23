export interface Health {
  api: string;
  status: string;
  timestamp: string;
  uptime: string;
  services: { database: boolean };
}
