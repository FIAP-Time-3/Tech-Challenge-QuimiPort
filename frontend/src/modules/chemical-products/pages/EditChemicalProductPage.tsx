import { useEffect, useState } from 'react';
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
  return <EditChemicalProduct key={id} productId={Number(id)} />;
}

function EditChemicalProduct({ productId }: { productId: number }) {
  const navigate = useNavigate();
  const [product, setProduct] = useState<ChemicalProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    if (!Number.isInteger(productId) || productId <= 0) return;
    getChemicalProduct(productId)
      .then((data) => {
        if (active) setProduct(data);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [productId, attempt]);

  async function handleSubmit(input: ChemicalProductInput) {
    await updateProduct(productId, input);
    navigate('/produtos');
  }

  if (Number.isInteger(productId) && productId > 0 && loading)
    return <p role="status">Carregando produto...</p>;
  if (error)
    return (
      <div role="alert">
        <p>Não foi possível carregar o produto.</p>
        <Button
          onClick={() => {
            setError(false);
            setLoading(true);
            setAttempt((value) => value + 1);
          }}
        >
          Tentar novamente
        </Button>
      </div>
    );

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
        key={product.id}
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
