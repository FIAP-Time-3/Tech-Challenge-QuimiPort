export interface ChemicalProduct {
  id: number;
  nome: string;
  descricao: string;
  classeRisco: number;
  status: boolean;
}

export type ChemicalProductInput = Omit<ChemicalProduct, 'id'>;
