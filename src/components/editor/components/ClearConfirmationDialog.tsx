/**
 * 🗑️ Clear Confirmation Dialog - Beautiful Confirmation Modal
 * Elegant confirmation dialog for clearing the canvas with warnings
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Trash2,
  Eraser,
  FileX,
  RotateCcw,
  X
} from 'lucide-react';

interface ClearConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nodeCount: number;
  edgeCount: number;
}

const ClearConfirmationDialog: React.FC<ClearConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  nodeCount,
  edgeCount
}) => {
  const totalElements = nodeCount + edgeCount;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 rounded-t-lg">
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  Clear Canvas
                </DialogTitle>
                <DialogDescription className="text-orange-100 mt-1">
                  This action cannot be undone
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning message */}
          <div className="mb-6">
            <div className="flex items-start space-x-3 p-4 bg-orange-100 border border-orange-200 rounded-lg">
              <FileX className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-orange-900 font-medium mb-2">
                  You're about to clear the entire canvas
                </p>
                <p className="text-orange-700 text-sm leading-relaxed">
                  All shapes, connections, and work will be permanently removed. 
                  Make sure you have saved your diagram if you want to keep it.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          {totalElements > 0 && (
            <div className="mb-6">
              <p className="text-gray-700 font-medium mb-3">Items to be removed:</p>
              <div className="flex items-center space-x-3">
                {nodeCount > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                    <Eraser className="w-3 h-3 mr-1" />
                    {nodeCount} shape{nodeCount !== 1 ? 's' : ''}
                  </Badge>
                )}
                {edgeCount > 0 && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-3 py-1">
                    <RotateCcw className="w-3 h-3 mr-1" />
                    {edgeCount} connection{edgeCount !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleConfirm}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Yes, Clear Canvas
              </Button>
            </motion.div>
          </div>

          {/* Tip */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-xs flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              <strong>Tip:</strong> Use Save (⌘S) before clearing to backup your work
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClearConfirmationDialog;