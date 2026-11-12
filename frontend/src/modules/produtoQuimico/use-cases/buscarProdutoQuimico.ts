import { buscarProdutoQuimico as get } from '@/modules/produtoQuimico/services/produtoQuimico.service';

export function buscarProdutoQuimico(id: number) {
  return get(id);
}
