import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { Title } from '@/shared/components/layout/Title';
import { Button } from '@/shared/components/ui/button';
import ChemicalProductForm from '@/modules/chemical-products/components/ChemicalProductForm';
import { ProductLoadState } from '@/modules/chemical-products/components/ProductLoadState';
import { useChemicalProduct } from '@/modules/chemical-products/hooks/useChemicalProduct';
import { updateProduct } from '@/modules/chemical-products/use-cases/saveChemicalProduct';
import type { ChemicalProductInput } from '@/modules/chemical-products/models/chemicalProduct';

function EditChemicalProductPage() {
  const { id } = useParams();
  return <EditChemicalProduct key={id} productId={Number(id)} />;
}

function EditChemicalProduct({ productId }: { productId: number }) {
  const navigate = useNavigate();
  const { state, retry } = useChemicalProduct(productId);
  async function handleSubmit(input: ChemicalProductInput) {
    await updateProduct(productId, input);
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
        <ChemicalProductForm
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
        <ProductLoadState
          kind={state.kind}
          message={state.kind === 'error' ? state.message : undefined}
          onRetry={retry}
        />
      )}
    </>
  );
}
export default EditChemicalProductPage;
