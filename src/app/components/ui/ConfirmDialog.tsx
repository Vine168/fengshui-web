import React from 'react';
import { Button } from './Button';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './Dialog';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
  onConfirm,
  onOpenChange,
}) => {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription className="whitespace-pre-line">{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant="primary" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};
