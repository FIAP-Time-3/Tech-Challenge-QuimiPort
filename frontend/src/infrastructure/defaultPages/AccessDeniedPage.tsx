import { Link } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';

export default function AccessDeniedPage() {
  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-semibold">Acesso Negado</h1>
        <p className="text-sm text-muted-foreground">
          Seu perfil não tem permissão para acessar esta página.
        </p>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link to="/">Voltar à Visão Geral</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
