import { Title } from '@/shared/components/layout/Title';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Link, useNavigate } from 'react-router';
import ChemicalProductForm from '@/modules/chemical-products/components/ChemicalProductForm';
import { createProduct } from '@/modules/chemical-products/use-cases/saveChemicalProduct';
import type { ChemicalProductInput } from '@/modules/chemical-products/models/chemicalProduct';

function CreateChemicalProductPage() {
  const navigate = useNavigate();

  async function handleSubmit(input: ChemicalProductInput) {
    await createProduct(input);
    navigate('/produtos', {
      state: { productMessage: 'Produto cadastrado com sucesso.' },
    });
  }

  return (
    <>
      <Title
        eyebrow="Produtos químicos"
        actions={
          <Button asChild variant="outline">
            <Link to="/produtos">
              <ArrowLeft aria-hidden="true" />
              Voltar
            </Link>
          </Button>
        }
        description="Informe os dados do produto e sua classe de risco."
      >
        Cadastrar produto
      </Title>
      <ChemicalProductForm title="Dados do produto" onSubmit={handleSubmit} />
    </>
  );
}

export default CreateChemicalProductPage;
