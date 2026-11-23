import DetalhesProdutoQuimicoPage from '@/modules/produtoQuimico/pages/DetalhesProdutoQuimicoPage';
import type { RouteObject } from 'react-router';
import { UserRole } from '@/infrastructure/backend/dtos/user.dtos';
import ProtectedRoute from '@/modules/auth/components/ProtectedRoute';
import CriarProdutoQuimicoPage from '@/modules/produtoQuimico/pages/CriarProdutoQuimicoPage';
import EditarProdutoQuimicoPage from '@/modules/produtoQuimico/pages/EditarProdutoQuimicoPage';
import ListarProdutosQuimicosPage from '@/modules/produtoQuimico/pages/ListarProdutosQuimicosPage';

const productEditors = [UserRole.ADMINISTRADOR, UserRole.OPERADOR];

export const produtoQuimicoRoutes: RouteObject[] = [
  {
    path: '/produtos',
    children: [
      { index: true, element: <ListarProdutosQuimicosPage /> },
      {
        path: 'novo',
        element: (
          <ProtectedRoute allowedRoles={productEditors}>
            <CriarProdutoQuimicoPage />
          </ProtectedRoute>
        ),
      },
      { path: ':id', element: <DetalhesProdutoQuimicoPage /> },
      {
        path: ':id/editar',
        element: (
          <ProtectedRoute allowedRoles={productEditors}>
            <EditarProdutoQuimicoPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
];
