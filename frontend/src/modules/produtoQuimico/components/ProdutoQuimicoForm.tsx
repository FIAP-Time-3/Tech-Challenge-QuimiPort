import { Feedback } from '@/shared/components/feedback/Feedback';
import { mensagemErroProdutoQuimico } from '@/modules/produtoQuimico/services/produtoQuimico.errors';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import type { ProdutoQuimicoInput } from '@/modules/produtoQuimico/models/produtoQuimico';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { NativeSelect } from '@/shared/components/ui/native-select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';

interface ProdutoQuimicoFormProps {
  title: string;
  initialValue?: ProdutoQuimicoInput;
  onSubmit: (input: ProdutoQuimicoInput) => Promise<void>;
}

function ProdutoQuimicoForm({
  title,
  initialValue,
  onSubmit,
}: ProdutoQuimicoFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nome = String(formData.get('nome') ?? '').trim();
    const descricao = String(formData.get('descricao') ?? '').trim();
    const classeRisco = Number(formData.get('classeRisco'));
    const status = formData.get('status') === 'on';

    if (saving) return;
    setError('');
    if (
      !nome ||
      !Number.isInteger(classeRisco) ||
      classeRisco < 1 ||
      classeRisco > 9
    ) {
      setError('Informe o nome e uma classe de risco entre 1 e 9.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ nome, descricao, classeRisco, status });
    } catch (error) {
      setError(
        mensagemErroProdutoQuimico(
          error,
          'Não foi possível salvar o produto. Tente novamente.',
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit} aria-busy={saving}>
          <fieldset disabled={saving} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-sm font-medium">
                  Nome do produto
                </Label>
                <Input
                  id="nome"
                  name="nome"
                  required
                  defaultValue={initialValue?.nome}
                  placeholder="Ex.: Acetona"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classeRisco" className="text-sm font-medium">
                  Classe de risco ONU
                </Label>
                <NativeSelect
                  id="classeRisco"
                  name="classeRisco"
                  required
                  defaultValue={initialValue?.classeRisco ?? ''}
                  className="w-full"
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
                </NativeSelect>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="descricao" className="text-sm font-medium">
                  Descrição
                </Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  rows={4}
                  defaultValue={initialValue?.descricao}
                  placeholder="Descrição ou observações sobre o produto"
                  className="resize-y bg-background"
                />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <Checkbox
                  id="status"
                  disabled={saving}
                  name="status"
                  defaultChecked={initialValue?.status ?? true}
                />
                <Label htmlFor="status">Produto ativo</Label>
              </div>
            </div>
            {error && <Feedback>{error}</Feedback>}
            <div className="flex justify-end gap-2 border-t border-border pt-5">
              <Button asChild variant="outline">
                <Link to="/produtos">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar produto'}
              </Button>
            </div>
          </fieldset>
        </form>
      </CardContent>
    </Card>
  );
}

export default ProdutoQuimicoForm;
