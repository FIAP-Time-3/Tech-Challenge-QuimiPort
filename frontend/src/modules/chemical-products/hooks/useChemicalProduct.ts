import { useEffect, useState } from 'react';
import { getChemicalProduct } from '@/modules/chemical-products/use-cases/getChemicalProduct';
import { productErrorMessage } from '@/modules/chemical-products/services/productErrorMessage';
import type { ChemicalProduct } from '@/modules/chemical-products/models/chemicalProduct';

type ProductState =
  | { kind: 'loading' }
  | { kind: 'loaded'; product: ChemicalProduct }
  | { kind: 'not-found' }
  | { kind: 'error'; message: string };

export function useChemicalProduct(id: number) {
  const [state, setState] = useState<ProductState>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const validId = Number.isSafeInteger(id) && id > 0;
  useEffect(() => {
    if (!validId) return;
    let active = true;
    getChemicalProduct(id)
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
            message: productErrorMessage(
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
