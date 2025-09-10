/**
 * 💾 Save Diagram Modal - Organization-based Save Dialog
 * Beautiful modal for saving diagrams with filename, overwrite options
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Save,
  FileText,
  AlertTriangle,
  Check,
  X,
  Folder,
  Building,
  Users,
  Calendar,
  Tag
} from 'lucide-react';

interface SaveDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (saveData: {
    projectName: string;
    projectDescription: string;
    isPublic: boolean;
    tags: string[];
    overwrite?: boolean;
  }) => void;
  initialName?: string;
  initialDescription?: string;
  existingDiagrams?: Array<{
    id: string;
    projectName: string;
    timestamp: string;
  }>;
}

const SaveDiagramModal: React.FC<SaveDiagramModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialName = '',
  initialDescription = '',
  existingDiagrams = []
}) => {
  const [projectName, setProjectName] = useState(initialName || 'Untitled Diagram');
  const [projectDescription, setProjectDescription] = useState(initialDescription || '');
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState<string[]>(['process-flow']);
  const [newTag, setNewTag] = useState('');
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);
  const [existingDiagram, setExistingDiagram] = useState<any>(null);

  // Check if filename already exists
  const checkExistingName = (name: string) => {
    const existing = existingDiagrams.find(d => 
      d.projectName.toLowerCase() === name.toLowerCase()
    );
    if (existing && existing.projectName !== initialName) {
      setExistingDiagram(existing);
      setShowOverwriteWarning(true);
    } else {
      setExistingDiagram(null);
      setShowOverwriteWarning(false);
    }
  };

  const handleNameChange = (value: string) => {
    setProjectName(value);
    if (value.trim()) {
      checkExistingName(value.trim());
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = (overwrite = false) => {
    if (!projectName.trim()) {
      return;
    }

    onSave({
      projectName: projectName.trim(),
      projectDescription: projectDescription.trim(),
      isPublic,
      tags,
      overwrite
    });
    
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (showOverwriteWarning) {
        handleSave(true);
      } else {
        handleSave();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 rounded-t-lg">
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Save className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  Save Diagram
                </DialogTitle>
                <DialogDescription className="text-blue-100 mt-1">
                  Save your diagram to the organization library
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagram Name *
            </label>
            <Input
              value={projectName}
              onChange={(e) => handleNameChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter diagram name..."
              className="bg-white"
              autoFocus
            />
          </div>

          {/* Overwrite Warning */}
          {showOverwriteWarning && existingDiagram && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-orange-100 border border-orange-200 rounded-lg"
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-orange-900 font-medium mb-1">
                    Diagram Already Exists
                  </h3>
                  <p className="text-orange-800 text-sm mb-2">
                    A diagram named "{existingDiagram.projectName}" already exists.
                    Last saved: {new Date(existingDiagram.timestamp).toLocaleString()}
                  </p>
                  <div className="text-orange-700 text-xs">
                    Saving will overwrite the existing diagram. This action cannot be undone.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <Textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Describe what this diagram represents..."
              className="bg-white resize-none"
              rows={3}
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Visibility
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Card 
                className={`cursor-pointer transition-all ${isPublic ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                onClick={() => setIsPublic(true)}
              >
                <CardContent className="p-4 text-center">
                  <Building className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <div className="font-medium text-gray-900">Organization</div>
                  <div className="text-xs text-gray-500 mt-1">Shared with team</div>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all ${!isPublic ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                onClick={() => setIsPublic(false)}
              >
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="font-medium text-gray-900">Private</div>
                  <div className="text-xs text-gray-500 mt-1">Only you can see</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                  onClick={() => handleRemoveTag(tag)}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tag..."
                className="bg-white"
                size="sm"
              />
              <Button
                onClick={handleAddTag}
                variant="outline"
                size="sm"
                disabled={!newTag.trim() || tags.includes(newTag.trim())}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Summary */}
          <Card className="bg-white/70">
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 mb-2">Save Summary</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  <span>Name: {projectName || 'Untitled Diagram'}</span>
                </div>
                <div className="flex items-center">
                  <Folder className="w-4 h-4 mr-2" />
                  <span>Location: Organization Library</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Date: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button variant="ghost" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            
            {showOverwriteWarning ? (
              <motion.div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleSave(false)}
                  disabled={!projectName.trim()}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Save As New
                </Button>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => handleSave(true)}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                    disabled={!projectName.trim()}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Overwrite Existing
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => handleSave()}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  disabled={!projectName.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Diagram
                </Button>
              </motion.div>
            )}
          </div>

          {/* Keyboard Hint */}
          <div className="text-center text-xs text-gray-500">
            Press ⌘+Enter to save quickly
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveDiagramModal;