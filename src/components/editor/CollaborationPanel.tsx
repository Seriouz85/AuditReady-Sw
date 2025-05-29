/**
 * Collaboration Panel Component
 * Real-time collaboration features with user presence
 */
import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, UserPlus, Share2, MessageCircle, Eye, 
  EyeOff, Wifi, WifiOff, Crown, Settings
} from 'lucide-react';
import { 
  GlassPanel, 
  GlassButton,
  GlassInput,
  MermaidDesignTokens 
} from '../ui';
import { CollaborationService, User, CollaborationSession } from '../../services/collaboration/CollaborationService';

interface CollaborationPanelProps {
  onCollaborationStart: (session: CollaborationSession) => void;
  onCollaborationEnd: () => void;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  onCollaborationStart,
  onCollaborationEnd
}) => {
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const collaborationService = useRef(CollaborationService.getInstance());

  useEffect(() => {
    const service = collaborationService.current;

    // Set up event listeners
    service.on('session-initialized', handleSessionInitialized);
    service.on('user-joined', handleUserJoined);
    service.on('user-left', handleUserLeft);
    service.on('connected', () => setIsConnected(true));
    service.on('connection-failed', () => setIsConnected(false));

    return () => {
      service.off('session-initialized', handleSessionInitialized);
      service.off('user-joined', handleUserJoined);
      service.off('user-left', handleUserLeft);
    };
  }, []);

  const handleSessionInitialized = (session: CollaborationSession) => {
    setCurrentSession(session);
    setUsers(session.users);
    setIsCollaborating(true);
    setIsConnected(true);
    generateShareUrl(session.id);
    onCollaborationStart(session);
  };

  const handleUserJoined = (user: User) => {
    setUsers(prev => [...prev.filter(u => u.id !== user.id), user]);
  };

  const handleUserLeft = (user: User) => {
    setUsers(prev => prev.filter(u => u.id !== user.id));
  };

  const generateShareUrl = (sessionId: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}?collaborate=${sessionId}`;
    setShareUrl(url);
  };

  const startCollaboration = async () => {
    if (!userName.trim()) {
      alert('Please enter your name to start collaboration');
      return;
    }

    try {
      const user = CollaborationService.createUser(userName, userEmail);
      const diagramId = `diagram-${Date.now()}`;
      
      await collaborationService.current.initializeSession(diagramId, user);
    } catch (error) {
      console.error('Failed to start collaboration:', error);
      alert('Failed to start collaboration. Please try again.');
    }
  };

  const endCollaboration = async () => {
    try {
      await collaborationService.current.leaveSession();
      setIsCollaborating(false);
      setCurrentSession(null);
      setUsers([]);
      setIsConnected(false);
      setShareUrl('');
      onCollaborationEnd();
    } catch (error) {
      console.error('Failed to end collaboration:', error);
    }
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Share URL copied to clipboard!');
  };

  const getUserInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!isCollaborating) {
    return (
      <GlassPanel variant="elevated" padding="4">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: MermaidDesignTokens.spacing[2],
          marginBottom: MermaidDesignTokens.spacing[3]
        }}>
          <Users size={20} style={{ color: MermaidDesignTokens.colors.accent.blue }} />
          <h4 style={{
            fontSize: MermaidDesignTokens.typography.fontSize.base,
            fontWeight: MermaidDesignTokens.typography.fontWeight.semibold,
            margin: 0,
            color: MermaidDesignTokens.colors.text.primary
          }}>
            Start Collaboration
          </h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: MermaidDesignTokens.spacing[3] }}>
          <GlassInput
            label="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
          />
          
          <GlassInput
            label="Email (Optional)"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="Enter your email"
            type="email"
          />

          <GlassButton
            variant="primary"
            onClick={startCollaboration}
            icon={<UserPlus size={16} />}
            style={{ width: '100%' }}
            glow
          >
            Start Collaboration
          </GlassButton>

          <div style={{
            fontSize: MermaidDesignTokens.typography.fontSize.sm,
            color: MermaidDesignTokens.colors.text.tertiary,
            textAlign: 'center',
            padding: MermaidDesignTokens.spacing[2],
            background: MermaidDesignTokens.colors.glass.primary,
            borderRadius: MermaidDesignTokens.borderRadius.lg,
            border: `1px solid ${MermaidDesignTokens.colors.glass.border}`
          }}>
            💡 Start a collaboration session to work together with your team in real-time
          </div>
        </div>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel variant="elevated" padding="4">
      {/* Collaboration Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: MermaidDesignTokens.spacing[3]
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: MermaidDesignTokens.spacing[2] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: MermaidDesignTokens.spacing[1] }}>
            {isConnected ? (
              <Wifi size={16} style={{ color: MermaidDesignTokens.colors.semantic.success[500] }} />
            ) : (
              <WifiOff size={16} style={{ color: MermaidDesignTokens.colors.semantic.error[500] }} />
            )}
            <span style={{
              fontSize: MermaidDesignTokens.typography.fontSize.sm,
              color: isConnected ? MermaidDesignTokens.colors.semantic.success[500] : MermaidDesignTokens.colors.semantic.error[500]
            }}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <GlassButton
          variant="ghost"
          size="sm"
          icon={<Settings size={14} />}
          onClick={endCollaboration}
          title="End Collaboration"
        />
      </div>

      {/* Active Users */}
      <div style={{ marginBottom: MermaidDesignTokens.spacing[3] }}>
        <div style={{
          fontSize: MermaidDesignTokens.typography.fontSize.sm,
          color: MermaidDesignTokens.colors.text.secondary,
          marginBottom: MermaidDesignTokens.spacing[2]
        }}>
          Active Users ({users.length})
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: MermaidDesignTokens.spacing[2] }}>
          {users.map((user, index) => (
            <div
              key={user.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: MermaidDesignTokens.spacing[2],
                padding: MermaidDesignTokens.spacing[2],
                background: MermaidDesignTokens.colors.glass.primary,
                borderRadius: MermaidDesignTokens.borderRadius.lg,
                border: `1px solid ${MermaidDesignTokens.colors.glass.border}`
              }}
            >
              {/* User Avatar */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: user.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: MermaidDesignTokens.typography.fontSize.sm,
                fontWeight: MermaidDesignTokens.typography.fontWeight.bold,
                color: 'white'
              }}>
                {getUserInitials(user.name)}
              </div>

              {/* User Info */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: MermaidDesignTokens.typography.fontSize.sm,
                  fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                  color: MermaidDesignTokens.colors.text.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: MermaidDesignTokens.spacing[1]
                }}>
                  {user.name}
                  {index === 0 && <Crown size={12} style={{ color: MermaidDesignTokens.colors.accent.blue }} />}
                </div>
                {user.email && (
                  <div style={{
                    fontSize: MermaidDesignTokens.typography.fontSize.xs,
                    color: MermaidDesignTokens.colors.text.tertiary
                  }}>
                    {user.email}
                  </div>
                )}
              </div>

              {/* User Status */}
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: MermaidDesignTokens.colors.semantic.success[500]
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Share Section */}
      <div style={{ marginBottom: MermaidDesignTokens.spacing[3] }}>
        <GlassButton
          variant="secondary"
          size="sm"
          icon={<Share2 size={14} />}
          onClick={() => setShowShareDialog(!showShareDialog)}
          style={{ width: '100%' }}
        >
          Share Session
        </GlassButton>

        {showShareDialog && (
          <div style={{
            marginTop: MermaidDesignTokens.spacing[2],
            padding: MermaidDesignTokens.spacing[3],
            background: MermaidDesignTokens.colors.glass.secondary,
            borderRadius: MermaidDesignTokens.borderRadius.lg,
            border: `1px solid ${MermaidDesignTokens.colors.glass.border}`
          }}>
            <div style={{
              fontSize: MermaidDesignTokens.typography.fontSize.sm,
              color: MermaidDesignTokens.colors.text.secondary,
              marginBottom: MermaidDesignTokens.spacing[2]
            }}>
              Share this URL with your team:
            </div>
            
            <div style={{
              display: 'flex',
              gap: MermaidDesignTokens.spacing[2]
            }}>
              <input
                type="text"
                value={shareUrl}
                readOnly
                style={{
                  flex: 1,
                  padding: MermaidDesignTokens.spacing[2],
                  background: MermaidDesignTokens.colors.glass.primary,
                  border: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
                  borderRadius: MermaidDesignTokens.borderRadius.base,
                  color: MermaidDesignTokens.colors.text.primary,
                  fontSize: MermaidDesignTokens.typography.fontSize.xs,
                  fontFamily: MermaidDesignTokens.typography.fontFamily.mono
                }}
              />
              
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={copyShareUrl}
              >
                Copy
              </GlassButton>
            </div>
          </div>
        )}
      </div>

      {/* Session Info */}
      <div style={{
        fontSize: MermaidDesignTokens.typography.fontSize.xs,
        color: MermaidDesignTokens.colors.text.tertiary,
        textAlign: 'center',
        padding: MermaidDesignTokens.spacing[2],
        background: MermaidDesignTokens.colors.glass.primary,
        borderRadius: MermaidDesignTokens.borderRadius.lg,
        border: `1px solid ${MermaidDesignTokens.colors.glass.border}`
      }}>
        Session ID: {currentSession?.id.slice(-8)}
        <br />
        Started: {currentSession?.createdAt.toLocaleTimeString()}
      </div>
    </GlassPanel>
  );
};

export default CollaborationPanel;
