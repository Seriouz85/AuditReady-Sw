import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  UserMinus,
  Eye,
  EyeOff,
  Crown,
  Circle,
  X,
  Settings,
  Share2,
  MessageCircle
} from 'lucide-react';
import { useFabricCanvasStore } from '../core/FabricCanvasStore';
import { getCollaborationManager, CollaboratorInfo } from '../core/CollaborationManager';
import { AUDIT_COLORS } from '../core/fabric-utils';

interface CollaborationPanelProps {
  visible: boolean;
  onClose: () => void;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ visible, onClose }) => {
  const { canvas } = useFabricCanvasStore();
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
  const [currentUser, setCurrentUser] = useState<CollaboratorInfo | null>(null);
  const [isCollaborationEnabled, setIsCollaborationEnabled] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const collaborationManager = getCollaborationManager();

  useEffect(() => {
    if (!visible || !collaborationManager) return;

    // Load current collaborators
    const currentCollaborators = collaborationManager.getCollaborators();
    setCollaborators(currentCollaborators);
    setIsCollaborationEnabled(collaborationManager.isCollaborationEnabled());

    // Set up event listeners
    const handleCollaboratorJoined = (collaborator: CollaboratorInfo) => {
      setCollaborators(prev => [...prev, collaborator]);
    };

    const handleCollaboratorLeft = (collaborator: CollaboratorInfo) => {
      setCollaborators(prev => prev.filter(c => c.id !== collaborator.id));
    };

    const handleCollaboratorUpdated = (collaborator: CollaboratorInfo) => {
      setCollaborators(prev => prev.map(c => c.id === collaborator.id ? collaborator : c));
    };

    collaborationManager.on('collaborator:joined', handleCollaboratorJoined);
    collaborationManager.on('collaborator:left', handleCollaboratorLeft);
    collaborationManager.on('collaborator:updated', handleCollaboratorUpdated);

    return () => {
      collaborationManager.off('collaborator:joined', handleCollaboratorJoined);
      collaborationManager.off('collaborator:left', handleCollaboratorLeft);
      collaborationManager.off('collaborator:updated', handleCollaboratorUpdated);
    };
  }, [visible, collaborationManager]);

  const handleEnableCollaboration = () => {
    if (!collaborationManager) return;

    if (!currentUser) {
      // Set up current user first
      const user: Omit<CollaboratorInfo, 'isActive' | 'lastSeen'> = {
        id: `user_${Date.now()}`,
        name: 'You',
        email: 'user@example.com',
        color: '#3b82f6'
      };
      
      collaborationManager.setCurrentUser(user);
      setCurrentUser({ ...user, isActive: true, lastSeen: new Date() });
    }

    collaborationManager.setEnabled(true);
    setIsCollaborationEnabled(true);
    console.log('Collaboration enabled');
  };

  const handleDisableCollaboration = () => {
    if (!collaborationManager) return;

    collaborationManager.setEnabled(false);
    setIsCollaborationEnabled(false);
    setCollaborators([]);
    console.log('Collaboration disabled');
  };

  const handleInviteUser = () => {
    if (!collaborationManager || !inviteEmail.trim()) return;

    // Simulate adding a collaborator
    const newCollaborator: CollaboratorInfo = {
      id: `user_${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      color: getRandomColor(),
      isActive: true,
      lastSeen: new Date()
    };

    collaborationManager.addCollaborator(newCollaborator);
    setInviteEmail('');
    setShowInviteDialog(false);
  };

  const handleRemoveCollaborator = (collaboratorId: string) => {
    if (!collaborationManager) return;
    collaborationManager.removeCollaborator(collaboratorId);
  };

  const getRandomColor = (): string => {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const formatLastSeen = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (!visible) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const panelStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '450px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  };

  const headerStyle: React.CSSProperties = {
    padding: '24px',
    borderBottom: `1px solid ${AUDIT_COLORS.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const contentStyle: React.CSSProperties = {
    padding: '24px',
    overflowY: 'auto',
    flex: 1
  };

  const collaboratorItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '8px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0'
  };

  const avatarStyle = (color: string): React.CSSProperties => ({
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    marginRight: '12px'
  });

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: AUDIT_COLORS.primary,
    color: 'white'
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0'
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={24} color={AUDIT_COLORS.primary} />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#111827' }}>
              Collaboration
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {!isCollaborationEnabled ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Users size={48} color="#9ca3af" style={{ marginBottom: '16px' }} />
              <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>Enable Collaboration</h3>
              <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: '14px' }}>
                Work together in real-time with your team. See live cursors, selections, and changes.
              </p>
              <button onClick={handleEnableCollaboration} style={primaryButtonStyle}>
                <Share2 size={16} />
                Enable Collaboration
              </button>
            </div>
          ) : (
            <>
              {/* Collaboration Status */}
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#ecfdf5', 
                border: '1px solid #d1fae5', 
                borderRadius: '8px', 
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Circle size={8} fill="#10b981" color="#10b981" />
                <span style={{ fontSize: '14px', color: '#065f46', fontWeight: '500' }}>
                  Collaboration Active
                </span>
                <button 
                  onClick={handleDisableCollaboration}
                  style={{
                    marginLeft: 'auto',
                    background: 'none',
                    border: 'none',
                    color: '#065f46',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Disable
                </button>
              </div>

              {/* Current User */}
              {currentUser && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    You
                  </h4>
                  <div style={collaboratorItemStyle}>
                    <div style={avatarStyle(currentUser.color)}>
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', color: '#111827' }}>{currentUser.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{currentUser.email}</div>
                    </div>
                    <Crown size={16} color="#f59e0b" />
                  </div>
                </div>
              )}

              {/* Collaborators */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Collaborators ({collaborators.filter(c => c.id !== currentUser?.id).length})
                  </h4>
                  <button onClick={() => setShowInviteDialog(true)} style={secondaryButtonStyle}>
                    <UserPlus size={14} />
                    Invite
                  </button>
                </div>

                {collaborators.filter(c => c.id !== currentUser?.id).length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '20px', 
                    color: '#6b7280', 
                    fontSize: '14px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px dashed #d1d5db'
                  }}>
                    No collaborators yet. Invite team members to start collaborating!
                  </div>
                ) : (
                  collaborators
                    .filter(c => c.id !== currentUser?.id)
                    .map(collaborator => (
                      <div key={collaborator.id} style={collaboratorItemStyle}>
                        <div style={avatarStyle(collaborator.color)}>
                          {collaborator.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '500', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {collaborator.name}
                            {collaborator.isActive ? (
                              <Circle size={6} fill="#10b981" color="#10b981" />
                            ) : (
                              <Circle size={6} fill="#6b7280" color="#6b7280" />
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {collaborator.email} • {formatLastSeen(collaborator.lastSeen)}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveCollaborator(collaborator.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          <UserMinus size={16} />
                        </button>
                      </div>
                    ))
                )}
              </div>

              {/* Invite Dialog */}
              {showInviteDialog && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 10001,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    width: '400px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
                  }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
                      Invite Collaborator
                    </h3>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        marginBottom: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => setShowInviteDialog(false)}
                        style={secondaryButtonStyle}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleInviteUser}
                        style={primaryButtonStyle}
                        disabled={!inviteEmail.trim()}
                      >
                        Send Invite
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaborationPanel;
