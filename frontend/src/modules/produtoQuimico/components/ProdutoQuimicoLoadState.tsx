import { Feedback, LoadingState } from '@/shared/components/feedback/Feedback';
import { Link } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

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
        {kind === 'loading' ? (
          <LoadingState>Carregando produto...</LoadingState>
        ) : kind === 'error' ? (
          <Feedback>{message}</Feedback>
        ) : (
          <p role="status" className="text-sm text-muted-foreground">
            Produto não encontrado. Verifique o endereço ou retorne à lista.
          </p>
        )}
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
