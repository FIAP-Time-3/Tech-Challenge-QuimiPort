export interface CreateOrUpdateProdutoQuimicoRequestDto {
  nome: string;
  descricao?: string;
  classeRisco: number;
  status?: boolean;
}

export interface ProdutoQuimicoResponseDto {
  id: number;
  nome: string;
  descricao: string | null;
  classeRisco: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RemoveProdutoQuimicoResponseDto {
  id: number;
}
