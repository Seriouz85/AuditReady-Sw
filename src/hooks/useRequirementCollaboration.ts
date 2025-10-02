import { useState, useEffect } from 'react';
import { RequirementsRealTimeService } from '@/services/requirements/RequirementsRealTimeService';
import { ConflictResolution } from '@/services/requirements/RequirementsService';
import { toast } from '@/utils/toast';

export function useRequirementCollaboration(
  organizationId: string,
  isDemo: boolean
) {
  const [collaborationSessionId, setCollaborationSessionId] = useState<string | null>(null);
  const realTimeService = RequirementsRealTimeService.getInstance();

  const startCollaboration = async (actionType: 'viewing' | 'editing' | 'commenting') => {
    if (isDemo) return;

    try {
      const sessionId = await realTimeService.startCollaboration(
        organizationId,
        'general',
        '',
        actionType
      );
      if (sessionId) {
        setCollaborationSessionId(sessionId);
      }
    } catch (error) {
      console.error('Error starting collaboration:', error);
    }
  };

  const endCollaboration = async () => {
    if (collaborationSessionId && !isDemo) {
      await realTimeService.endCollaboration(collaborationSessionId);
    }
  };

  return { collaborationSessionId, startCollaboration, endCollaboration };
}
