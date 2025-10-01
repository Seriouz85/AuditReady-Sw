import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface InputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  onConfirm: (value: string) => void;
  type?: 'text' | 'textarea';
  required?: boolean;
}

export const InputDialog: React.FC<InputDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  label,
  placeholder,
  defaultValue = '',
  onConfirm,
  type = 'text',
  required = false,
}) => {
  const [value, setValue] = useState(defaultValue);

  React.useEffect(() => {
    if (open) {
      setValue(defaultValue);
    }
  }, [open, defaultValue]);

  const handleConfirm = () => {
    if (required && !value.trim()) {
      return;
    }
    onConfirm(value);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type === 'text') {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="input-field">{label}</Label>
            {type === 'textarea' ? (
              <Textarea
                id="input-field"
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                rows={4}
                autoFocus
              />
            ) : (
              <Input
                id="input-field"
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={required && !value.trim()}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Hook for easier usage
export const useInputDialog = () => {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    title: string;
    description?: string;
    label: string;
    placeholder?: string;
    defaultValue?: string;
    onConfirm: (value: string) => void;
    type?: 'text' | 'textarea';
    required?: boolean;
  }>({
    open: false,
    title: '',
    label: '',
    onConfirm: () => {},
  });

  const prompt = (options: {
    title: string;
    description?: string;
    label: string;
    placeholder?: string;
    defaultValue?: string;
    onConfirm: (value: string) => void;
    type?: 'text' | 'textarea';
    required?: boolean;
  }) => {
    setDialogState({
      open: true,
      ...options,
    });
  };

  const closeDialog = () => {
    setDialogState((prev) => ({ ...prev, open: false }));
  };

  return {
    prompt,
    dialogProps: {
      ...dialogState,
      onOpenChange: closeDialog,
    },
  };
};
