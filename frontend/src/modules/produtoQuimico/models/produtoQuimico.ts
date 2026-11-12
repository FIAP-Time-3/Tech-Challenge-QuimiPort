export interface ProdutoQuimico {
  id: number;
  nome: string;
  descricao: string;
  classeRisco: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProdutoQuimicoInput = Pick<
  ProdutoQuimico,
  'nome' | 'descricao' | 'classeRisco' | 'status'
>;
