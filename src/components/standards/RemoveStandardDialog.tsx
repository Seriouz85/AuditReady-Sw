import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Trash2 } from "lucide-react";

interface RemoveStandardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  standardName: string;
  onConfirm: () => void;
}

export function RemoveStandardDialog({
  open,
  onOpenChange,
  standardName,
  onConfirm
}: RemoveStandardDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">Remove Standard</AlertDialogTitle>
              <AlertDialogDescription className="text-left text-sm">
                Are you sure you want to remove "{standardName}"?
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        
        <div className="py-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
              This action will permanently delete:
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
              <li>• All current settings and configurations</li>
              <li>• All requirement fulfillment levels and progress</li>
              <li>• All notes and custom data</li>
              <li>• All assessment history related to this standard</li>
            </ul>
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mt-3">
              This action cannot be undone!
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove Standard
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}