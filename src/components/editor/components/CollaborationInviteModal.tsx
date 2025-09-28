/**
 * 🤝 Collaboration Invite Modal - Invitation Flow for Real-time Collaboration
 * Beautiful modal for inviting team members to collaborate on diagrams
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Users,
  UserPlus,
  Mail,
  Link,
  Copy,
  Check,
  Crown,
  Eye,
  Edit,
  X,
  Globe,
  Lock,
  Clock,
  Send
} from 'lucide-react';

interface CollaborationInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
}

const CollaborationInviteModal: React.FC<CollaborationInviteModalProps> = ({
  isOpen,
  onClose,
  projectName
}) => {
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [shareUrl, setShareUrl] = useState(`${window.location.origin}/collaborate/abc123`);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [accessLevel, setAccessLevel] = useState<'view' | 'edit'>('edit');
  const [isPublicLink, setIsPublicLink] = useState(false);

  // Mock collaborators data
  const currentCollaborators = [
    { id: '1', name: 'John Doe', email: 'john@company.com', avatar: '', role: 'owner', status: 'online' },
    { id: '2', name: 'Sarah Wilson', email: 'sarah@company.com', avatar: '', role: 'editor', status: 'online' },
    { id: '3', name: 'Mike Johnson', email: 'mike@company.com', avatar: '', role: 'viewer', status: 'offline' },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleSendInvites = () => {
    const emails = inviteEmails.split(',').map(email => email.trim()).filter(email => email);
    console.log('Sending invites to:', emails);
    console.log('Message:', inviteMessage);
    console.log('Access level:', accessLevel);
    
    // Simulate invitation sending - replace with real API call
    console.log('Collaboration invites sent successfully');
    onClose();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto p-0 bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 rounded-t-lg">
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  Collaborate on "{projectName}"
                </DialogTitle>
                <DialogDescription className="text-blue-100 mt-1">
                  Invite team members to work together in real-time
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Collaborators */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Current Collaborators ({currentCollaborators.length})
            </h3>
            <div className="space-y-2">
              {currentCollaborators.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.role === 'owner' ? 'default' : 'secondary'} className="text-xs">
                      {user.role === 'owner' && <Crown className="w-3 h-3 mr-1" />}
                      {user.role === 'editor' && <Edit className="w-3 h-3 mr-1" />}
                      {user.role === 'viewer' && <Eye className="w-3 h-3 mr-1" />}
                      {user.role}
                    </Badge>
                    {user.status === 'online' && (
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                        Online
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invite by Email */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Invite by Email
            </h3>
            <Card className="bg-white/70">
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email addresses (comma-separated)
                  </label>
                  <Input
                    placeholder="colleague@company.com, team@company.com"
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                    className="bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access level
                  </label>
                  <div className="flex space-x-2">
                    <Button
                      variant={accessLevel === 'edit' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAccessLevel('edit')}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Can Edit
                    </Button>
                    <Button
                      variant={accessLevel === 'view' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAccessLevel('view')}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Can View
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (optional)
                  </label>
                  <Textarea
                    placeholder="Let's collaborate on this diagram..."
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    className="bg-white resize-none"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Share Link */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Link className="w-4 h-4 mr-2" />
              Share Link
            </h3>
            <Card className="bg-white/70">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="bg-white flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className={isLinkCopied ? 'bg-green-50 border-green-200 text-green-700' : ''}
                  >
                    {isLinkCopied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setIsPublicLink(!isPublicLink)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                    >
                      {isPublicLink ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      <span>{isPublicLink ? 'Public link' : 'Private link'}</span>
                    </button>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Expires in 7 days</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button variant="ghost" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSendInvites}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                disabled={!inviteEmails.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Invitations
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CollaborationInviteModal;