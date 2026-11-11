import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { deleteProduct } from '@/modules/chemical-products/use-cases/deleteChemicalProduct';
import { listChemicalProducts } from '@/modules/chemical-products/use-cases/listChemicalProducts';
import type { ChemicalProduct } from '@/modules/chemical-products/models/chemicalProduct';
import ChemicalProductsTable from '@/modules/chemical-products/components/ChemicalProductsTable';
import { Button } from '@/shared/components/ui/button';

function ChemicalProductsPage() {
  const [search, setSearch] = useState('');
  const [productToDelete, setProductToDelete] =
    useState<ChemicalProduct | null>(null);
  const products = listChemicalProducts();
  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');
  const filteredProducts = products.filter((product) =>
    `${product.nome} ${product.descricao} ${product.classeRisco}`
      .toLocaleLowerCase('pt-BR')
      .includes(normalizedSearch),
  );

  function handleDelete() {
    if (!productToDelete) return;
    deleteProduct(productToDelete.id);
    setProductToDelete(null);
  }

  return (
    <>
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-muted-foreground">
            Catálogo e classificação de risco
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">
            Produtos químicos
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre e mantenha os produtos utilizados nas operações.
          </p>
        </div>
        <Button asChild>
          <Link to="/produtos/novo">
            <Plus aria-hidden="true" />
            Novo produto
          </Link>
        </Button>
      </section>

      <ChemicalProductsTable
        products={filteredProducts}
        totalProducts={products.length}
        search={search}
        onSearchChange={setSearch}
        productToDelete={productToDelete}
        onDeleteRequest={setProductToDelete}
        onDeleteCancel={() => setProductToDelete(null)}
        onDeleteConfirm={handleDelete}
      />
    </>
  );
}

export default ChemicalProductsPage;
