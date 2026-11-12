import { Title } from '@/shared/components/layout/Title';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Link, useNavigate } from 'react-router';
import ProdutoQuimicoForm from '@/modules/produtoQuimico/components/ProdutoQuimicoForm';
import { criarProduto } from '@/modules/produtoQuimico/use-cases/salvarProdutoQuimico';
import type { ProdutoQuimicoInput } from '@/modules/produtoQuimico/models/produtoQuimico';

function CriarProdutoQuimicoPage() {
  const navigate = useNavigate();

  async function handleSubmit(input: ProdutoQuimicoInput) {
    await criarProduto(input);
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
      <ProdutoQuimicoForm title="Dados do produto" onSubmit={handleSubmit} />
    </>
  );
}

export default CriarProdutoQuimicoPage;
