import { listarProdutosQuimicos as list } from '@/modules/produtoQuimico/services/produtoQuimico.service';

export function listarProdutosQuimicos() {
  return list();
}
