import type {
  DashboardLoad,
  DashboardMetric,
  DashboardMovement,
  TerminalCapacityItem,
} from '@/modules/dashboard/models/dashboard';

export const metrics: DashboardMetric[] = [
  {
    type: 'loads',
    label: 'Cargas em operação',
    value: '128',
    change: '+12,8%',
    detail: 'em relação ao mês passado',
  },
  {
    type: 'products',
    label: 'Produtos cadastrados',
    value: '346',
    change: '+8 novos',
    detail: 'adicionados este mês',
  },
  {
    type: 'volume',
    label: 'Volume movimentado',
    value: '2.840 t',
    change: '+6,2%',
    detail: 'em relação ao mês passado',
  },
  {
    type: 'attention',
    label: 'Atenção necessária',
    value: '03',
    change: '2 vencendo',
    detail: 'documentos precisam de revisão',
  },
];

export const loads: DashboardLoad[] = [
  {
    code: 'QP-2026-0481',
    product: 'Hidróxido de sódio',
    category: 'Corrosivo · Classe 8',
    origin: 'Porto de Santos',
    quantity: '24.500 kg',
    status: 'Em trânsito',
    updated: 'Hoje, 10:42',
  },
  {
    code: 'QP-2026-0479',
    product: 'Etanol industrial',
    category: 'Líquido inflamável · Classe 3',
    origin: 'Porto de Paranaguá',
    quantity: '18.200 L',
    status: 'Em análise',
    updated: 'Hoje, 09:18',
  },
  {
    code: 'QP-2026-0476',
    product: 'Ácido sulfúrico',
    category: 'Corrosivo · Classe 8',
    origin: 'Porto de Itajaí',
    quantity: '12.000 kg',
    status: 'Liberada',
    updated: 'Ontem, 16:35',
  },
  {
    code: 'QP-2026-0472',
    product: 'Amônia anidra',
    category: 'Gás tóxico · Classe 2',
    origin: 'Porto de Santos',
    quantity: '8.400 kg',
    status: 'Em trânsito',
    updated: 'Ontem, 14:06',
  },
];

export const movements: DashboardMovement[] = [
  { day: 'Seg', value: 42 },
  { day: 'Ter', value: 68 },
  { day: 'Qua', value: 53 },
  { day: 'Qui', value: 84 },
  { day: 'Sex', value: 62 },
  { day: 'Sáb', value: 38 },
  { day: 'Dom', value: 73 },
];

export const terminalCapacity: TerminalCapacityItem[] = [
  { label: 'Tanques', value: 72, color: 'bg-primary' },
  { label: 'Armazéns', value: 48, color: 'bg-chart-2' },
];

export const capacityWarning = {
  title: 'Área B próxima do limite',
  description: 'Ocupação em 89%. Revise a alocação das próximas cargas.',
};
