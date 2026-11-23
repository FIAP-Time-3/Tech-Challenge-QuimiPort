import { useId, useState } from 'react';
import ConfirmButton from '@/shared/components/feedback/ConfirmButton';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';

export type CargaAction = 'bloquear' | 'cancelar';

export default function CargaActionButton({
  action,
  code,
  onConfirm,
}: {
  action: CargaAction;
  code: string;
  onConfirm: (reason: string) => Promise<void>;
}) {
  const id = useId();
  const [reason, setReason] = useState('');
  const label = action === 'bloquear' ? 'Bloquear' : 'Cancelar';
  const consequence =
    action === 'bloquear'
      ? 'A carga ficará bloqueada até ser regularizada.'
      : 'O cancelamento encerra a operação da carga.';

  return (
    <ConfirmButton
      size="sm"
      variant="outline"
      message={`${label} a carga ${code}? ${consequence}`}
      details={
        <div className="space-y-2">
          <Label htmlFor={id}>Motivo</Label>
          <Input
            id={id}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required
          />
        </div>
      }
      confirmDisabled={!reason.trim()}
      onConfirm={async () => {
        await onConfirm(reason.trim());
        setReason('');
      }}
    >
      {label} carga
    </ConfirmButton>
  );
}
