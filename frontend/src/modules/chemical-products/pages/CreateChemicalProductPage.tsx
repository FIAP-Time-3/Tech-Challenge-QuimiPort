import { useNavigate } from 'react-router';
import ChemicalProductForm from '@/modules/chemical-products/components/ChemicalProductForm';
import { createProduct } from '@/modules/chemical-products/use-cases/saveChemicalProduct';
import type { ChemicalProductInput } from '@/modules/chemical-products/models/chemicalProduct';

function CreateChemicalProductPage() {
  const navigate = useNavigate();

  async function handleSubmit(input: ChemicalProductInput) {
    await createProduct(input);
    navigate('/produtos');
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">Produtos químicos</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          Cadastrar produto
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Informe os dados do produto e sua classe de risco.
        </p>
      </div>
      <ChemicalProductForm title="Dados do produto" onSubmit={handleSubmit} />
    </section>
  );
}

export default CreateChemicalProductPage;
