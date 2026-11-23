import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { Title } from '@/shared/components/layout/Title';
import { Button } from '@/shared/components/ui/button';
import ProdutoQuimicoForm from '@/modules/produtoQuimico/components/ProdutoQuimicoForm';
import { ProdutoQuimicoLoadState } from '@/modules/produtoQuimico/components/ProdutoQuimicoLoadState';
import { useProdutoQuimico } from '@/modules/produtoQuimico/hooks/useProdutoQuimico';
import { atualizarProdutoQuimico } from '@/modules/produtoQuimico/use-cases/atualizarProdutoQuimico';
import type { ProdutoQuimicoInput } from '@/modules/produtoQuimico/models/produtoQuimico';

function EditarProdutoQuimicoPage() {
  const { id } = useParams();
  return <EditarProdutoQuimico key={id} productId={Number(id)} />;
}

function EditarProdutoQuimico({ productId }: { productId: number }) {
  const navigate = useNavigate();
  const { state, retry } = useProdutoQuimico(productId);
  async function handleSubmit(input: ProdutoQuimicoInput) {
    await atualizarProdutoQuimico(productId, input);
    navigate('/produtos', {
      state: { productMessage: 'Produto atualizado com sucesso.' },
    });
  }
  return (
    <>
      <Title
        eyebrow="Produtos químicos"
        description={
          state.kind === 'loaded'
            ? `Atualize as informações de ${state.product.nome}.`
            : 'Atualize as informações do produto.'
        }
        actions={
          <Button asChild variant="outline">
            <Link to="/produtos">
              <ArrowLeft aria-hidden="true" />
              Voltar
            </Link>
          </Button>
        }
      >
        Editar produto
      </Title>
      {state.kind === 'loaded' ? (
        <ProdutoQuimicoForm
          title="Dados do produto"
          initialValue={{
            nome: state.product.nome,
            descricao: state.product.descricao,
            classeRisco: state.product.classeRisco,
            status: state.product.status,
          }}
          onSubmit={handleSubmit}
        />
      ) : (
        <ProdutoQuimicoLoadState
          kind={state.kind}
          message={state.kind === 'error' ? state.message : undefined}
          onRetry={retry}
        />
      )}
    </>
  );
}
export default EditarProdutoQuimicoPage;
