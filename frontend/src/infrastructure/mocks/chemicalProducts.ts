import type { ChemicalProduct } from '@/modules/chemical-products/models/chemicalProduct';

export const chemicalProducts: ChemicalProduct[] = [
  {
    id: 1,
    nome: 'Acetona',
    descricao: 'Solvente industrial',
    classeRisco: 3,
    status: true,
  },
  {
    id: 2,
    nome: 'Ácido sulfúrico',
    descricao: 'Uso industrial',
    classeRisco: 8,
    status: true,
  },
  {
    id: 3,
    nome: 'Hidróxido de sódio',
    descricao: 'Soda cáustica',
    classeRisco: 8,
    status: true,
  },
  {
    id: 4,
    nome: 'Amônia anidra',
    descricao: 'Refrigerante industrial',
    classeRisco: 2,
    status: false,
  },
];
