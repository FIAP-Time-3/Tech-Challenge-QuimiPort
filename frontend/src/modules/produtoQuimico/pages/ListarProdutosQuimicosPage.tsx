import { Feedback, LoadingState } from '@/shared/components/feedback/Feedback';
import { mensagemErroProdutoQuimico } from '@/modules/produtoQuimico/services/produtoQuimico.errors';
import { Title } from '@/shared/components/layout/Title';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { excluirProdutoQuimico } from '@/modules/produtoQuimico/use-cases/excluirProdutoQuimico';
import { listarProdutosQuimicos } from '@/modules/produtoQuimico/use-cases/listarProdutosQuimicos';
import type { ProdutoQuimico } from '@/modules/produtoQuimico/models/produtoQuimico';
import ProdutoQuimicoTable from '@/modules/produtoQuimico/components/ProdutoQuimicoTable';
import { UserRole } from '@/infrastructure/backend/dtos/user.dtos';
import { useCurrentUser } from '@/modules/auth/hooks/useCurrentUser';
import { Button } from '@/shared/components/ui/button';

function ListarProdutosQuimicosPage() {
  const location = useLocation();
  const { role } = useCurrentUser();
  const canManage =
    role === UserRole.ADMINISTRADOR || role === UserRole.OPERADOR;
  const [success, setSuccess] = useState(() => {
    const state = location.state as { productMessage?: unknown } | null;
    return typeof state?.productMessage === 'string'
      ? state.productMessage
      : '';
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<ProdutoQuimico[]>([]);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let isEffectActive = true;
    listarProdutosQuimicos()
      .then((data) => {
        if (isEffectActive) setProducts(data);
      })
      .catch((error: unknown) => {
        if (isEffectActive)
          setLoadError(
            mensagemErroProdutoQuimico(
              error,
              'Não foi possível carregar os produtos.',
            ),
          );
      })
      .finally(() => {
        if (isEffectActive) setLoading(false);
      });
    return () => {
      isEffectActive = false;
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

  async function handleDelete(product: ProdutoQuimico) {
    setSuccess('');
    try {
      await excluirProdutoQuimico(product.id);
      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );
      setSuccess(`Produto ${product.nome} excluído com sucesso.`);
    } catch (error) {
      throw new Error(
        mensagemErroProdutoQuimico(
          error,
          'Não foi possível excluir o produto. Tente novamente.',
        ),
        { cause: error },
      );
    }
  }

  return (
    <>
      <Title
        eyebrow="Catálogo e classificação de risco"
        description="Cadastre e mantenha os produtos utilizados nas operações."
        actions={
          canManage && (
            <Button asChild>
              <Link to="/produtos/novo">
                <Plus aria-hidden="true" />
                Novo produto
              </Link>
            </Button>
          )
        }
      >
        Produtos químicos
      </Title>

      {success && <Feedback variant="success">{success}</Feedback>}
      {loading && <LoadingState>Carregando produtos...</LoadingState>}
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
        <ProdutoQuimicoTable
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          canManage={canManage}
          products={filteredProducts}
          totalProducts={products.length}
          search={search}
          onSearchChange={setSearch}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}

export default ListarProdutosQuimicosPage;
