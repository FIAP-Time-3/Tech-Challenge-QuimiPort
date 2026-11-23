import { useState, type ComponentProps, type ReactNode } from 'react';
import { Feedback } from './Feedback';
import { Button } from '@/shared/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';

type ConfirmButtonProps = Omit<
  ComponentProps<typeof Button>,
  'asChild' | 'onClick' | 'pending' | 'type'
> & {
  message: string;
  details?: ReactNode;
  confirmDisabled?: boolean;
  onConfirm: () => void | Promise<void>;
};

export default function ConfirmButton({
  message,
  details,
  confirmDisabled = false,
  onConfirm,
  children,
  ...buttonProps
}: ConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function accept() {
    if (pending || confirmDisabled) return;

    setPending(true);
    setErrorMessage('');
    try {
      await onConfirm();
      setOpen(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : 'Não foi possível concluir a ação.',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (pending) return;
        setOpen(nextOpen);
        setErrorMessage('');
      }}
    >
      <AlertDialogTrigger asChild>
        <Button {...buttonProps} type="button">
          {children}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar ação</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        {details && <fieldset disabled={pending}>{details}</fieldset>}
        {errorMessage && <Feedback>{errorMessage}</Feedback>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <Button
            type="button"
            pending={pending}
            disabled={confirmDisabled}
            onClick={accept}
          >
            Aceitar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
