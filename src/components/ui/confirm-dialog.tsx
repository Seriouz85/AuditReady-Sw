import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Info, Trash2, CheckCircle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'default' | 'destructive' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Continue',
  cancelText = 'Cancel',
  onConfirm,
  variant = 'default'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return <Trash2 className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-600" />;
      default:
        return <CheckCircle className="w-6 h-6 text-green-600" />;
    }
  };

  const getButtonClass = () => {
    switch (variant) {
      case 'destructive':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700';
      default:
        return '';
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className={getButtonClass()}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Hook for easier usage
export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = React.useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive' | 'warning' | 'info';
    confirmText?: string;
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const confirm = (options: {
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive' | 'warning' | 'info';
    confirmText?: string;
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
    confirm,
    dialogProps: {
      open: dialogState.open,
      onOpenChange: closeDialog,
      title: dialogState.title,
      description: dialogState.description,
      onConfirm: dialogState.onConfirm,
      variant: dialogState.variant,
      confirmText: dialogState.confirmText,
    },
  };
};
