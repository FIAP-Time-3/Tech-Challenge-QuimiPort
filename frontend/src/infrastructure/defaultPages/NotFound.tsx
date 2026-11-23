import { Link } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/shared/components/ui/card';

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-sm font-medium text-muted-foreground">Erro 404</p>
          <h1 className="text-2xl font-semibold">Página não encontrada</h1>
          <CardDescription>O endereço informado não existe.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/">Voltar ao início</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
