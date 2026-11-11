import type { RouteObject } from 'react-router';
import ProtectedRoute from '@/modules/auth/components/ProtectedRoute';
import ChemicalProductsLayout from '@/modules/chemical-products/components/ChemicalProductsLayout';
import CreateChemicalProductPage from '@/modules/chemical-products/pages/CreateChemicalProductPage';
import EditChemicalProductPage from '@/modules/chemical-products/pages/EditChemicalProductPage';
import ChemicalProductsPage from '@/modules/chemical-products/pages/ChemicalProductsPage';

export const chemicalProductRoutes: RouteObject[] = [
  {
    path: '/produtos',
    element: (
      <ProtectedRoute>
        <ChemicalProductsLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <ChemicalProductsPage /> },
      { path: 'novo', element: <CreateChemicalProductPage /> },
      { path: ':id/editar', element: <EditChemicalProductPage /> },
    ],
  },
];
