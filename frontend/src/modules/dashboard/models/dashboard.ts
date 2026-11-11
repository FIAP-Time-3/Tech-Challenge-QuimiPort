export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  detail: string;
  type: 'loads' | 'products' | 'volume' | 'attention';
}

export interface DashboardLoad {
  code: string;
  product: string;
  category: string;
  origin: string;
  quantity: string;
  status: 'Em trânsito' | 'Em análise' | 'Liberada';
  updated: string;
}

export interface DashboardMovement {
  day: string;
  value: number;
}

export interface TerminalCapacityItem {
  label: string;
  value: number;
  color: string;
}
