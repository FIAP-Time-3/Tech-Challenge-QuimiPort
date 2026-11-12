export interface ChemicalProduct {
  id: number;
  nome: string;
  descricao: string;
  classeRisco: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ChemicalProductInput = Pick<
  ChemicalProduct,
  'nome' | 'descricao' | 'classeRisco' | 'status'
>;
