import {
  criarProdutoQuimico,
  inativarProdutoQuimico,
  atualizarProdutoQuimico,
} from '@/modules/produtoQuimico/services/produtoQuimico.service';
import type { ProdutoQuimicoInput } from '@/modules/produtoQuimico/models/produtoQuimico';

export function criarProduto(input: ProdutoQuimicoInput) {
  return criarProdutoQuimico(input);
}

export function atualizarProduto(id: number, input: ProdutoQuimicoInput) {
  return atualizarProdutoQuimico(id, input);
}

export function inativarProduto(id: number) {
  return inativarProdutoQuimico(id);
}
