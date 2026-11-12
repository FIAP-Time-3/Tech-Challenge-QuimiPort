import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
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
  const [products, setProducts] = useState<ChemicalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    listChemicalProducts()
      .then((data) => {
        if (active) setProducts(data);
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar os produtos.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');
  const filteredProducts = products.filter((product) =>
    `${product.nome} ${product.descricao} ${product.classeRisco}`
      .toLocaleLowerCase('pt-BR')
      .includes(normalizedSearch),
  );

  async function handleDelete() {
    if (!productToDelete || deleting) return;
    setDeleting(true);
    setError('');
    try {
      await deleteProduct(productToDelete.id);
      setProducts((current) =>
        current.filter((product) => product.id !== productToDelete.id),
      );
      setProductToDelete(null);
    } catch {
      setProductToDelete(null);
      setError(
        'Não foi possível excluir o produto. Verifique suas permissões e se há cargas associadas.',
      );
    } finally {
      setDeleting(false);
    }
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

      {loading && <p role="status">Carregando produtos...</p>}
      {error && (
        <div role="alert" className="space-y-2 text-destructive">
          <p>{error}</p>
          <Button
            variant="outline"
            onClick={() => {
              setError('');
              setLoading(true);
              setAttempt((value) => value + 1);
            }}
          >
            Tentar novamente
          </Button>
        </div>
      )}
      {!loading && (
        <ChemicalProductsTable
          deleting={deleting}
          products={filteredProducts}
          totalProducts={products.length}
          search={search}
          onSearchChange={setSearch}
          productToDelete={productToDelete}
          onDeleteRequest={setProductToDelete}
          onDeleteCancel={() => {
            if (!deleting) setProductToDelete(null);
          }}
          onDeleteConfirm={handleDelete}
        />
      )}
    </>
  );
}

export default ChemicalProductsPage;
