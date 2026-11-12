import { Link } from 'react-router';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardContent } from '@/shared/components/ui/Card';

export function ProdutoQuimicoLoadState({
  kind,
  message,
  onRetry,
}: {
  kind: 'loading' | 'not-found' | 'error';
  message?: string;
  onRetry: () => void;
}) {
  return (
    <Card>
      <CardContent className="space-y-4 py-6">
        <p
          role={kind === 'error' ? 'alert' : 'status'}
          className="text-sm text-muted-foreground"
        >
          {kind === 'loading'
            ? 'Carregando produto...'
            : kind === 'not-found'
              ? 'Produto não encontrado. Verifique o endereço ou retorne à lista.'
              : message}
        </p>
        {kind === 'error' && (
          <Button variant="outline" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
        {kind === 'not-found' && (
          <Button asChild variant="outline">
            <Link to="/produtos">Voltar para produtos</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
