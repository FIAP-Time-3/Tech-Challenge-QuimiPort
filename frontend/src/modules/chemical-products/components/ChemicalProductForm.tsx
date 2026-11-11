import type { FormEvent } from 'react';
import { Link } from 'react-router';
import type { ChemicalProductInput } from '@/modules/chemical-products/models/chemicalProduct';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';

interface ChemicalProductFormProps {
  title: string;
  initialValue?: ChemicalProductInput;
  onSubmit: (input: ChemicalProductInput) => void;
}

function ChemicalProductForm({
  title,
  initialValue,
  onSubmit,
}: ChemicalProductFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nome = String(formData.get('nome') ?? '').trim();
    const descricao = String(formData.get('descricao') ?? '').trim();
    const classeRisco = Number(formData.get('classeRisco'));
    const status = formData.get('status') === 'on';

    onSubmit({ nome, descricao, classeRisco, status });
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="nome" className="text-sm font-medium">
                Nome do produto
              </label>
              <Input
                id="nome"
                name="nome"
                required
                defaultValue={initialValue?.nome}
                placeholder="Ex.: Acetona"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="classeRisco" className="text-sm font-medium">
                Classe de risco ONU
              </label>
              <select
                id="classeRisco"
                name="classeRisco"
                required
                defaultValue={initialValue?.classeRisco ?? ''}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="" disabled>
                  Selecione uma classe
                </option>
                {Array.from({ length: 9 }, (_, index) => index + 1).map(
                  (riskClass) => (
                    <option key={riskClass} value={riskClass}>
                      Classe {riskClass}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="descricao" className="text-sm font-medium">
                Descrição
              </label>
              <textarea
                id="descricao"
                name="descricao"
                rows={4}
                defaultValue={initialValue?.descricao}
                placeholder="Descrição ou observações sobre o produto"
                className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                name="status"
                defaultChecked={initialValue?.status ?? true}
                className="size-4 rounded border-input accent-primary"
              />
              Produto ativo
            </label>
          </div>
          <div className="flex justify-end gap-2 border-t border-border pt-5">
            <Button asChild variant="outline">
              <Link to="/produtos">Cancelar</Link>
            </Button>
            <Button type="submit">Salvar produto</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default ChemicalProductForm;
