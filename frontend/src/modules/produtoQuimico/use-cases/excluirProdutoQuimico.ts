import { excluirProdutoQuimico } from '@/modules/produtoQuimico/services/produtoQuimico.service';

export function excluirProduto(id: number) {
  return excluirProdutoQuimico(id);
}
