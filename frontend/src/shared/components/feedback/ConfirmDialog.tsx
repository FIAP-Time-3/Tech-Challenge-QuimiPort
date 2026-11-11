import { useEffect, useRef } from 'react';
import { Button } from '@/shared/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onOpenChange,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onOpenChange(false);
        }
      }}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl border border-border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/50"
    >
      <div className="space-y-2 p-6">
        <h2 id="confirm-dialog-title" className="text-lg font-semibold">
          {title}
        </h2>
        <p
          id="confirm-dialog-description"
          className="text-sm leading-relaxed text-muted-foreground"
        >
          {description}
        </p>
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

export default ConfirmDialog;
