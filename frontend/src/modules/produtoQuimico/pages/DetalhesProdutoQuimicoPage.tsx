import { ArrowLeft, Pencil, PowerOff } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Title } from '@/shared/components/layout/Title';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/Card';
import ConfirmDialog from '@/shared/components/feedback/ConfirmDialog';
import { ProdutoQuimicoLoadState } from '@/modules/produtoQuimico/components/ProdutoQuimicoLoadState';
import { useProdutoQuimico } from '@/modules/produtoQuimico/hooks/useProdutoQuimico';
import { inativarProdutoQuimico } from '@/modules/produtoQuimico/use-cases/inativarProdutoQuimico';
import { mensagemErroProdutoQuimico } from '@/modules/produtoQuimico/services/produtoQuimico.errors';

export default function DetalhesProdutoQuimicoPage() {
  const { id } = useParams();
  return <DetalhesProdutoQuimico key={id} id={Number(id)} />;
}

function DetalhesProdutoQuimico({ id }: { id: number }) {
  const { state, retry } = useProdutoQuimico(id);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  async function deactivate() {
    if (saving) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await inativarProdutoQuimico(id);
      setSuccess('Produto inativado com sucesso.');
      retry();
    } catch (error) {
      setError(
        mensagemErroProdutoQuimico(
          error,
          'Não foi possível inativar o produto.',
        ),
      );
    } finally {
      setSaving(false);
      setConfirming(false);
    }
  }
  return (
    <>
      <Title
        eyebrow="Produtos químicos"
        description="Consulte os dados e a classificação do produto."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/produtos">
                <ArrowLeft aria-hidden="true" />
                Voltar
              </Link>
            </Button>
            {state.kind === 'loaded' && (
              <Button asChild>
                <Link to={`/produtos/${id}/editar`}>
                  <Pencil aria-hidden="true" />
                  Editar produto
                </Link>
              </Button>
            )}
          </>
        }
      >
        {state.kind === 'loaded' ? state.product.nome : 'Detalhes do produto'}
      </Title>
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {success && (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {success}
        </p>
      )}
      {state.kind !== 'loaded' ? (
        <ProdutoQuimicoLoadState
          kind={state.kind}
          message={state.kind === 'error' ? state.message : undefined}
          onRetry={retry}
        />
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Informações do produto</CardTitle>
              <Badge variant={state.product.status ? 'default' : 'secondary'}>
                {state.product.status ? 'Ativo' : 'Inativo'}
              </Badge>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Nome</dt>
                  <dd className="mt-1 font-medium">{state.product.nome}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Classe de risco ONU
                  </dt>
                  <dd className="mt-1 font-medium">
                    Classe {state.product.classeRisco}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm text-muted-foreground">Descrição</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-sm">
                    {state.product.descricao || 'Nenhuma descrição informada.'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Cadastrado em
                  </dt>
                  <dd className="mt-1 text-sm">
                    {new Date(state.product.createdAt).toLocaleString('pt-BR')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Última atualização
                  </dt>
                  <dd className="mt-1 text-sm">
                    {new Date(state.product.updatedAt).toLocaleString('pt-BR')}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          {state.product.status && (
            <Card>
              <CardHeader>
                <CardTitle>Disponibilidade para novas cargas</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Inative o produto para impedir seu uso em novas cargas. Os
                  registros e as cargas existentes serão preservados.
                </p>
                <Button variant="outline" onClick={() => setConfirming(true)}>
                  <PowerOff aria-hidden="true" />
                  Inativar produto
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
      <ConfirmDialog
        open={confirming}
        title="Inativar produto?"
        description="O produto deixará de estar disponível para novas cargas. Você pode reativá-lo pela edição."
        confirmLabel={saving ? 'Inativando...' : 'Inativar produto'}
        pending={saving}
        onOpenChange={(open) => {
          if (!saving) setConfirming(open);
        }}
        onConfirm={deactivate}
      />
    </>
  );
}
