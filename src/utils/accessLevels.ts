// Utility functions for customizable access levels

export interface AccessLevelConfig {
  public: string;
  internal: string;
  confidential: string;
  restricted: string;
}

export const defaultAccessLevels: AccessLevelConfig = {
  public: 'Public',
  internal: 'Internal',
  confidential: 'Confidential',
  restricted: 'Restricted'
};

export function getAccessLevelLabels(): AccessLevelConfig {
  try {
    const stored = localStorage.getItem('organizationAccessLevels');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure all required levels exist, falling back to defaults
      return {
        public: parsed.public || defaultAccessLevels.public,
        internal: parsed.internal || defaultAccessLevels.internal,
        confidential: parsed.confidential || defaultAccessLevels.confidential,
        restricted: parsed.restricted || defaultAccessLevels.restricted
      };
    }
  } catch (error) {
    console.warn('Failed to parse access level labels, using defaults', error);
  }
  
  return defaultAccessLevels;
}

export function getAccessLevelLabel(level: keyof AccessLevelConfig): string {
  const labels = getAccessLevelLabels();
  return labels[level] || defaultAccessLevels[level];
}

export function getAccessLevelColor(level: keyof AccessLevelConfig): string {
  switch (level) {
    case 'public': return 'bg-green-100 text-green-800';
    case 'internal': return 'bg-blue-100 text-blue-800';
    case 'confidential': return 'bg-orange-100 text-orange-800';
    case 'restricted': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}