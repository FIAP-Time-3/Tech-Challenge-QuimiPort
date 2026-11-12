import { productErrorMessage } from '@/modules/chemical-products/services/productErrorMessage';
import { Title } from '@/shared/components/layout/Title';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { deleteProduct } from '@/modules/chemical-products/use-cases/deleteChemicalProduct';
import { listChemicalProducts } from '@/modules/chemical-products/use-cases/listChemicalProducts';
import type { ChemicalProduct } from '@/modules/chemical-products/models/chemicalProduct';
import ChemicalProductsTable from '@/modules/chemical-products/components/ChemicalProductsTable';
import { Button } from '@/shared/components/ui/button';

function ChemicalProductsPage() {
  const location = useLocation();
  const [success, setSuccess] = useState(() => {
    const state = location.state as { productMessage?: unknown } | null;
    return typeof state?.productMessage === 'string'
      ? state.productMessage
      : '';
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [loadError, setLoadError] = useState('');
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
      .catch((error: unknown) => {
        if (active)
          setLoadError(
            productErrorMessage(
              error,
              'Não foi possível carregar os produtos.',
            ),
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');
  const filteredProducts = products.filter(
    (product) =>
      (statusFilter === 'all' ||
        product.status === (statusFilter === 'active')) &&
      `${product.nome} ${product.descricao} ${product.classeRisco}`
        .toLocaleLowerCase('pt-BR')
        .includes(normalizedSearch),
  );

  async function handleDelete() {
    if (!productToDelete || deleting) return;
    setDeleting(true);
    setError('');
    setSuccess('');
    try {
      await deleteProduct(productToDelete.id);
      setProducts((current) =>
        current.filter((product) => product.id !== productToDelete.id),
      );
      setSuccess(`Produto ${productToDelete.nome} excluído com sucesso.`);
      setProductToDelete(null);
    } catch (error) {
      setProductToDelete(null);
      setError(
        productErrorMessage(
          error,
          'Não foi possível excluir o produto. Tente novamente.',
        ),
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Title
        eyebrow="Catálogo e classificação de risco"
        description="Cadastre e mantenha os produtos utilizados nas operações."
        actions={
          <Button asChild>
            <Link to="/produtos/novo">
              <Plus aria-hidden="true" />
              Novo produto
            </Link>
          </Button>
        }
      >
        Produtos químicos
      </Title>

      {success && (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {success}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {loading && <p role="status">Carregando produtos...</p>}
      {loadError && (
        <div
          role="alert"
          className="space-y-3 rounded-xl border border-destructive/20 bg-card p-6"
        >
          <p>{loadError}</p>
          <Button
            variant="outline"
            onClick={() => {
              setLoadError('');
              setLoading(true);
              setAttempt((value) => value + 1);
            }}
          >
            Tentar novamente
          </Button>
        </div>
      )}
      {!loading && !loadError && (
        <ChemicalProductsTable
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
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
