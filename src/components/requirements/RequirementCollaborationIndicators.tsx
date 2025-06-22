import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, Edit3, MessageCircle, Lock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RequirementCollaborator {
  id: string;
  user_id: string;
  action_type: 'viewing' | 'editing' | 'commenting';
  started_at: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface RequirementCollaborationIndicatorsProps {
  requirementId: string;
  activeCollaborators: RequirementCollaborator[];
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  hasConflict: boolean;
  className?: string;
}

export const RequirementCollaborationIndicators: React.FC<RequirementCollaborationIndicatorsProps> = ({
  requirementId,
  activeCollaborators,
  isLocked,
  lockedBy,
  lockedAt,
  hasConflict,
  className = ''
}) => {
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'viewing':
        return <Eye className=\"h-3 w-3\" />;
      case 'editing':
        return <Edit3 className=\"h-3 w-3\" />;
      case 'commenting':
        return <MessageCircle className=\"h-3 w-3\" />;
      default:
        return <Eye className=\"h-3 w-3\" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'viewing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'editing':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'commenting':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getTimeAgo = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  if (activeCollaborators.length === 0 && !isLocked && !hasConflict) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Conflict indicator */}
      {hasConflict && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant=\"destructive\" className=\"flex items-center gap-1\">
                <AlertTriangle className=\"h-3 w-3\" />
                Conflict
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>This requirement has been modified by another user. Please resolve the conflict.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Lock indicator */}
      {isLocked && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant=\"secondary\" className=\"flex items-center gap-1\">
                <Lock className=\"h-3 w-3\" />
                Locked
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Locked for editing
                {lockedAt && ` ${getTimeAgo(lockedAt)}`}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Active collaborators */}
      <div className=\"flex items-center gap-1\">
        {activeCollaborators.slice(0, 3).map((collaborator) => (
          <TooltipProvider key={collaborator.id}>
            <Tooltip>
              <TooltipTrigger>
                <div className=\"relative\">
                  <Avatar className=\"h-6 w-6 border-2 border-white\">
                    <AvatarImage 
                      src={collaborator.user.avatar_url} 
                      alt={`${collaborator.user.first_name} ${collaborator.user.last_name}`} 
                    />
                    <AvatarFallback className=\"text-xs\">
                      {getUserInitials(collaborator.user.first_name, collaborator.user.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Action indicator */}
                  <div 
                    className={`absolute -bottom-1 -right-1 rounded-full p-0.5 border ${getActionColor(collaborator.action_type)}`}
                  >
                    {getActionIcon(collaborator.action_type)}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className=\"text-center\">
                  <p className=\"font-medium\">
                    {collaborator.user.first_name} {collaborator.user.last_name}
                  </p>
                  <p className=\"text-sm text-muted-foreground\">
                    {collaborator.action_type} • {getTimeAgo(collaborator.started_at)}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}

        {/* Show count if more than 3 collaborators */}
        {activeCollaborators.length > 3 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className=\"h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center\">
                  <span className=\"text-xs font-medium text-gray-600\">
                    +{activeCollaborators.length - 3}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div>
                  <p className=\"font-medium mb-1\">Other active users:</p>
                  {activeCollaborators.slice(3).map((collaborator) => (
                    <p key={collaborator.id} className=\"text-sm\">
                      {collaborator.user.first_name} {collaborator.user.last_name} ({collaborator.action_type})
                    </p>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Activity summary */}
      {activeCollaborators.length > 0 && (
        <div className=\"flex gap-1\">
          {['viewing', 'editing', 'commenting'].map((actionType) => {
            const count = activeCollaborators.filter(c => c.action_type === actionType).length;
            if (count === 0) return null;

            return (
              <Badge 
                key={actionType}
                variant=\"outline\" 
                className={`text-xs ${getActionColor(actionType)}`}
              >
                {getActionIcon(actionType)}
                <span className=\"ml-1\">{count}</span>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};