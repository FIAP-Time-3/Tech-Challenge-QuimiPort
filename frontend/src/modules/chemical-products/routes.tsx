import ChemicalProductDetailsPage from '@/modules/chemical-products/pages/ChemicalProductDetailsPage';
import type { RouteObject } from 'react-router';
import CreateChemicalProductPage from '@/modules/chemical-products/pages/CreateChemicalProductPage';
import EditChemicalProductPage from '@/modules/chemical-products/pages/EditChemicalProductPage';
import ChemicalProductsPage from '@/modules/chemical-products/pages/ChemicalProductsPage';

export const chemicalProductRoutes: RouteObject[] = [
  {
    path: '/produtos',
    children: [
      { index: true, element: <ChemicalProductsPage /> },
      { path: 'novo', element: <CreateChemicalProductPage /> },
      { path: ':id', element: <ChemicalProductDetailsPage /> },
      { path: ':id/editar', element: <EditChemicalProductPage /> },
    ],
  },
];
