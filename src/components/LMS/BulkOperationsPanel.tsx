import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Copy, 
  Move, 
  Trash2, 
  Edit3, 
  FileText, 
  Video, 
  FileQuestion, 
  Link as LinkIcon, 
  PenTool,
  CheckCircle,
  X,
  ArrowRight,
  Package,
  Layers
} from 'lucide-react';
import { toast } from '@/utils/toast';

interface BulkOperationsPanelProps {
  selectedItems: string[];
  onClearSelection: () => void;
  onBulkDelete: (itemIds: string[]) => void;
  onBulkDuplicate: (itemIds: string[]) => void;
  onBulkMove: (itemIds: string[], targetSectionId: string) => void;
  onBulkUpdate: (itemIds: string[], updates: any) => void;
  sections: Array<{
    id: string;
    title: string;
    modules: Array<{
      id: string;
      title: string;
      type: 'text' | 'video' | 'quiz' | 'link' | 'assignment';
    }>;
  }>;
  className?: string;
}

const moduleTypeConfig = {
  text: { icon: FileText, label: 'Text Content', color: 'bg-blue-500' },
  video: { icon: Video, label: 'Video', color: 'bg-red-500' },
  quiz: { icon: FileQuestion, label: 'Quiz', color: 'bg-green-500' },
  link: { icon: LinkIcon, label: 'External Link', color: 'bg-purple-500' },
  assignment: { icon: PenTool, label: 'Assignment', color: 'bg-orange-500' }
};

export const BulkOperationsPanel: React.FC<BulkOperationsPanelProps> = ({
  selectedItems,
  onClearSelection,
  onBulkDelete,
  onBulkDuplicate,
  onBulkMove,
  onBulkUpdate,
  sections,
  className = ''
}) => {
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState('');
  const [bulkUpdates, setBulkUpdates] = useState({
    title: '',
    content: '',
    difficulty: '',
    duration: ''
  });

  const selectedModules = sections.flatMap(section => 
    section.modules.filter(module => selectedItems.includes(module.id))
  );

  const getModuleTypeStats = () => {
    const stats = selectedModules.reduce((acc, module) => {
      acc[module.type] = (acc[module.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} selected items?`)) {
      onBulkDelete(selectedItems);
      onClearSelection();
      toast.success(`${selectedItems.length} items deleted successfully`);
    }
  };

  const handleBulkDuplicate = () => {
    onBulkDuplicate(selectedItems);
    onClearSelection();
    toast.success(`${selectedItems.length} items duplicated successfully`);
  };

  const handleBulkMove = () => {
    if (!targetSectionId) {
      toast.error('Please select a target section');
      return;
    }
    
    const targetSection = sections.find(s => s.id === targetSectionId);
    if (!targetSection) {
      toast.error('Target section not found');
      return;
    }

    onBulkMove(selectedItems, targetSectionId);
    onClearSelection();
    setShowMoveDialog(false);
    setTargetSectionId('');
    toast.success(`${selectedItems.length} items moved to "${targetSection.title}"`);
  };

  const handleBulkUpdate = () => {
    const updates = Object.entries(bulkUpdates).reduce((acc, [key, value]) => {
      if (value.trim()) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    if (Object.keys(updates).length === 0) {
      toast.error('Please provide at least one update');
      return;
    }

    onBulkUpdate(selectedItems, updates);
    onClearSelection();
    setShowUpdateDialog(false);
    setBulkUpdates({ title: '', content: '', difficulty: '', duration: '' });
    toast.success(`${selectedItems.length} items updated successfully`);
  };

  if (selectedItems.length === 0) {
    return null;
  }

  const typeStats = getModuleTypeStats();

  return (
    <>
      <Card className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border-2 border-blue-200 shadow-lg z-50 ${className}`}>
        <div className="flex items-center gap-4 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">{selectedItems.length} items selected</span>
          </div>

          <div className="flex items-center gap-2">
            {Object.entries(typeStats).map(([type, count]) => {
              const config = moduleTypeConfig[type as keyof typeof moduleTypeConfig];
              const Icon = config.icon;
              return (
                <Badge key={type} variant="secondary" className="flex items-center gap-1">
                  <Icon className="h-3 w-3" />
                  {count}
                </Badge>
              );
            })}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDuplicate}
              className="gap-1"
            >
              <Copy className="h-4 w-4" />
              Duplicate
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMoveDialog(true)}
              className="gap-1"
            >
              <Move className="h-4 w-4" />
              Move
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUpdateDialog(true)}
              className="gap-1"
            >
              <Edit3 className="h-4 w-4" />
              Update
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="gap-1"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Move Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Move className="h-5 w-5" />
              Move {selectedItems.length} Items
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Target Section</Label>
              <div className="space-y-2 mt-2">
                {sections.map(section => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={section.id}
                      checked={targetSectionId === section.id}
                      onCheckedChange={(checked) => {
                        setTargetSectionId(checked ? section.id : '');
                      }}
                    />
                    <Label htmlFor={section.id} className="flex items-center gap-2 cursor-pointer">
                      <Layers className="h-4 w-4" />
                      {section.title}
                      <Badge variant="outline" className="text-xs">
                        {section.modules.length} modules
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowMoveDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkMove}
                disabled={!targetSectionId}
                className="flex-1"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Move Items
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Update {selectedItems.length} Items
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Only filled fields will be updated. Leave empty to keep existing values.
            </div>
            
            <div>
              <Label>Title Prefix/Suffix</Label>
              <Input
                value={bulkUpdates.title}
                onChange={(e) => setBulkUpdates(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Add prefix or suffix to titles"
              />
            </div>
            
            <div>
              <Label>Duration</Label>
              <Input
                value={bulkUpdates.duration}
                onChange={(e) => setBulkUpdates(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 5 min, 10 min"
              />
            </div>
            
            <div>
              <Label>Additional Content</Label>
              <Textarea
                value={bulkUpdates.content}
                onChange={(e) => setBulkUpdates(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Append to existing content"
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowUpdateDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkUpdate}
                className="flex-1"
              >
                <Package className="h-4 w-4 mr-2" />
                Update Items
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};