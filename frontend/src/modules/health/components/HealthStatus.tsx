import { statusStyles } from '@/shared/components/feedback/statusStyles';
import { Activity, Clock3, Database, Server } from 'lucide-react';
import type { Health } from '@/modules/health/models/health';
import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

export function HealthStatus({ data }: { data: Health }) {
  const healthy = data.status === 'ok';
  const timestamp = new Date(data.timestamp);

  return (
    <div className="space-y-5">
      <Card
        className={
          healthy
            ? 'border border-primary/20 bg-secondary/40'
            : `border ${statusStyles.warning}`
        }
      >
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <span
              className={`flex size-12 items-center justify-center rounded-xl ${healthy ? 'bg-primary text-primary-foreground' : statusStyles.warning}`}
            >
              <Activity className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg font-semibold">
                {healthy
                  ? 'Serviços operacionais'
                  : 'Serviços com instabilidade'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Status geral informado pela API
              </p>
            </div>
          </div>
          <Badge variant={healthy ? 'secondary' : 'outline'}>
            {healthy ? 'Operacional' : 'Degradado'}
          </Badge>
        </CardContent>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-secondary text-primary">
              <Server className="size-5" aria-hidden="true" />
            </div>
            <CardTitle>API</CardTitle>
            <CardDescription>Serviço de aplicação</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant={data.api === 'ok' ? 'secondary' : 'destructive'}>
              {data.api === 'ok' ? 'Operacional' : data.api}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-secondary text-primary">
              <Database className="size-5" aria-hidden="true" />
            </div>
            <CardTitle>Banco de dados</CardTitle>
            <CardDescription>Conexão com o banco</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge
              variant={data.services.database ? 'secondary' : 'destructive'}
            >
              {data.services.database ? 'Conectado' : 'Indisponível'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da verificação</CardTitle>
          <CardDescription>
            Informações retornadas pela API nesta consulta.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="size-4" aria-hidden="true" /> Tempo em
              atividade
            </p>
            <p className="mt-2 font-medium">{data.uptime}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data da verificação</p>
            <p className="mt-2 font-medium">
              {timestamp && !Number.isNaN(timestamp.getTime())
                ? timestamp.toLocaleString('pt-BR')
                : data.timestamp}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
