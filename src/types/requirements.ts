export type RequirementStatus = 'not_started' | 'in_progress' | 'completed';

export interface Requirement {
  id: string;
  standardId: string;
  name: string;
  description: string;
  status: RequirementStatus;
  legendReg?: boolean;
  legendCon?: boolean;
  legendBp?: boolean;
  legendRc?: boolean;
  section?: string;
  code?: string;
  justification?: string;
} 