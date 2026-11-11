import { useNavigate, useParams } from 'react-router';
import ChemicalProductForm from '@/modules/chemical-products/components/ChemicalProductForm';
import { getChemicalProduct } from '@/modules/chemical-products/use-cases/getChemicalProduct';
import { updateProduct } from '@/modules/chemical-products/use-cases/saveChemicalProduct';
import type {
  ChemicalProduct,
  ChemicalProductInput,
} from '@/modules/chemical-products/models/chemicalProduct';
import { Button } from '@/shared/components/ui/button';

function EditChemicalProductPage() {
  const { id } = useParams();
  const productId = Number(id);
  const navigate = useNavigate();
  const product: ChemicalProduct | null = Number.isInteger(productId)
    ? (getChemicalProduct(productId) ?? null)
    : null;

  function handleSubmit(input: ChemicalProductInput) {
    const updated = updateProduct(productId, input);
    if (updated) {
      navigate('/produtos');
    }
  }

  if (!product) {
    return (
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Produto não encontrado</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          O produto pode ter sido removido ou o endereço está incorreto.
        </p>
        <Button className="mt-4" onClick={() => navigate('/produtos')}>
          Voltar para produtos
        </Button>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">Produtos químicos</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          Editar produto
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Atualize as informações de {product.nome}.
        </p>
      </div>
      <ChemicalProductForm
        title="Dados do produto"
        initialValue={{
          nome: product.nome,
          descricao: product.descricao,
          classeRisco: product.classeRisco,
          status: product.status,
        }}
        onSubmit={handleSubmit}
      />
    </section>
  );
}

export default EditChemicalProductPage;
