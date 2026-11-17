import DetalhesProdutoQuimicoPage from '@/modules/produtoQuimico/pages/DetalhesProdutoQuimicoPage';
import type { RouteObject } from 'react-router';
import CriarProdutoQuimicoPage from '@/modules/produtoQuimico/pages/CriarProdutoQuimicoPage';
import EditarProdutoQuimicoPage from '@/modules/produtoQuimico/pages/EditarProdutoQuimicoPage';
import ListarProdutosQuimicosPage from '@/modules/produtoQuimico/pages/ListarProdutosQuimicosPage';

export const produtoQuimicoRoutes: RouteObject[] = [
  {
    path: '/produtos',
    children: [
      { index: true, element: <ListarProdutosQuimicosPage /> },
      { path: 'novo', element: <CriarProdutoQuimicoPage /> },
      { path: ':id', element: <DetalhesProdutoQuimicoPage /> },
      { path: ':id/editar', element: <EditarProdutoQuimicoPage /> },
    ],
  },
];
