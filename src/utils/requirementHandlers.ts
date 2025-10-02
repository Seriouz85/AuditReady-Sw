import { RequirementWithStatus, RequirementsService, ConflictResolution } from '@/services/requirements/RequirementsService';
import { RequirementsRealTimeService } from '@/services/requirements/RequirementsRealTimeService';
import { RequirementStatus, RequirementPriority } from '@/types';
import { toast } from '@/utils/toast';

interface UpdateRequirementOptions {
  requirementsService: RequirementsService;
  realTimeService: RequirementsRealTimeService;
  organizationId: string;
  isDemo: boolean;
  localRequirements: RequirementWithStatus[];
  onConflict: (conflict: ConflictResolution) => void;
  onSuccess: (updatedReq: RequirementWithStatus) => void;
}

export async function updateRequirement(
  requirementId: string,
  updates: {
    status?: string;
    fulfillmentPercentage?: number;
    evidence?: string;
    notes?: string;
    responsibleParty?: string;
    tags?: string[];
    riskLevel?: string;
  },
  options: UpdateRequirementOptions
): Promise<{ success: boolean; data?: any; error?: string }> {
  const { requirementsService, realTimeService, organizationId, isDemo, localRequirements, onConflict, onSuccess } = options;

  try {
    let result;

    if (!isDemo) {
      const currentReq = localRequirements.find(r => r.id === requirementId);
      result = await realTimeService.updateRequirementWithConflictDetection(
        organizationId,
        requirementId,
        updates,
        {
          expectedVersion: currentReq?.version,
          optimisticUpdate: true
        }
      );

      if (result.conflict) {
        onConflict(result.conflict);
        return { success: false, error: 'Conflict detected' };
      }
    } else {
      result = await requirementsService.updateRequirement(requirementId, updates);
    }

    if (result.success) {
      const currentReq = localRequirements.find(r => r.id === requirementId);
      if (currentReq) {
        const updatedReq = {
          ...currentReq,
          status: (updates.status as any) || currentReq.status,
          organizationStatus: updates.status || currentReq.organizationStatus,
          fulfillmentPercentage: updates.fulfillmentPercentage ?? currentReq.fulfillmentPercentage,
          evidence: updates.evidence ?? currentReq.evidence,
          notes: updates.notes ?? currentReq.notes,
          responsibleParty: updates.responsibleParty ?? currentReq.responsibleParty,
          organizationTags: updates.tags ?? currentReq.organizationTags,
          riskLevel: updates.riskLevel ?? currentReq.riskLevel,
          lastUpdated: new Date().toISOString(),
          version: result.data?.version || currentReq.version
        };
        onSuccess(updatedReq);
      }

      toast.success(
        isDemo
          ? 'Changes saved locally (demo mode)'
          : 'Requirement updated successfully'
      );
      return result;
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error('Error updating requirement:', error);
    toast.error('Failed to update requirement');
    return { success: false, error: 'Update failed' };
  }
}

export function initializeDemoPriorities(requirements: RequirementWithStatus[]): RequirementWithStatus[] {
  const needsPriorities = requirements.some(req => !req.priority);

  if (!needsPriorities) return requirements;

  return requirements.map((req, index) => {
    if (req.priority) return req;

    let priority: RequirementPriority = 'default';
    if (index % 10 === 0) priority = 'high';
    else if (index % 5 === 0) priority = 'medium';
    else if (index % 3 === 0) priority = 'low';

    return { ...req, priority };
  });
}
