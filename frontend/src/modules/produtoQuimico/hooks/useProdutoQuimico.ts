import { useEffect, useState } from 'react';
import { buscarProdutoQuimico } from '@/modules/produtoQuimico/use-cases/buscarProdutoQuimico';
import { mensagemErroProdutoQuimico } from '@/modules/produtoQuimico/services/produtoQuimico.errors';
import type { ProdutoQuimico } from '@/modules/produtoQuimico/models/produtoQuimico';

type ProductState =
  | { kind: 'loading' }
  | { kind: 'loaded'; product: ProdutoQuimico }
  | { kind: 'not-found' }
  | { kind: 'error'; message: string };

export function useProdutoQuimico(id: number) {
  const [state, setState] = useState<ProductState>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const validId = Number.isSafeInteger(id) && id > 0;
  useEffect(() => {
    if (!validId) return;
    let active = true;
    buscarProdutoQuimico(id)
      .then((product) => {
        if (active)
          setState(
            product ? { kind: 'loaded', product } : { kind: 'not-found' },
          );
      })
      .catch((error: unknown) => {
        if (active)
          setState({
            kind: 'error',
            message: mensagemErroProdutoQuimico(
              error,
              'Não foi possível carregar o produto.',
            ),
          });
      });
    return () => {
      active = false;
    };
  }, [id, validId, attempt]);

  function retry() {
    setState({ kind: 'loading' });
    setAttempt((value) => value + 1);
  }
  return {
    state: validId ? state : ({ kind: 'not-found' } as ProductState),
    retry,
  };
}
