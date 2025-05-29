/**
 * Project utility functions for managing project names and state
 */

/**
 * Generate a unique project name that doesn't conflict with existing projects
 */
export const generateUniqueProjectName = (): string => {
  const existingProjects = JSON.parse(localStorage.getItem('mermaid-projects') || '[]');
  const existingNames = existingProjects.map((project: any) => project.name.toLowerCase());
  
  const baseNames = [
    'Untitled Project',
    'New Diagram',
    'Process Flow',
    'Workflow Diagram',
    'Business Process',
    'System Flow',
    'Decision Tree',
    'Project Plan'
  ];
  
  // Try base names first
  for (const baseName of baseNames) {
    if (!existingNames.includes(baseName.toLowerCase())) {
      return baseName;
    }
  }
  
  // If all base names are taken, use numbered versions
  let counter = 1;
  while (true) {
    const candidateName = `Untitled Project ${counter}`;
    if (!existingNames.includes(candidateName.toLowerCase())) {
      return candidateName;
    }
    counter++;
  }
};

/**
 * Check if a project name already exists
 */
export const projectNameExists = (name: string): boolean => {
  const existingProjects = JSON.parse(localStorage.getItem('mermaid-projects') || '[]');
  return existingProjects.some((project: any) => 
    project.name.toLowerCase() === name.toLowerCase()
  );
};

/**
 * Generate a unique name based on a desired name
 */
export const generateUniqueNameFromDesired = (desiredName: string): string => {
  if (!projectNameExists(desiredName)) {
    return desiredName;
  }
  
  let counter = 1;
  while (true) {
    const candidateName = `${desiredName} (${counter})`;
    if (!projectNameExists(candidateName)) {
      return candidateName;
    }
    counter++;
  }
};

/**
 * Check if current state has unsaved changes
 */
export const hasUnsavedChanges = (
  currentState: string, 
  lastSavedState: string, 
  projectName: string
): boolean => {
  // If no project name is set, consider it unsaved
  if (!projectName.trim()) {
    return true;
  }
  
  // Compare current state with last saved state
  return currentState !== lastSavedState;
};

/**
 * Generate a state hash for comparison
 */
export const generateStateHash = (
  diagramText: string, 
  canvasBackground: string, 
  flowData?: any
): string => {
  const stateObject = {
    diagramText,
    canvasBackground,
    flowData: flowData ? JSON.stringify(flowData) : null
  };
  
  return JSON.stringify(stateObject);
};

/**
 * Get a descriptive name based on diagram content
 */
export const generateDescriptiveProjectName = (diagramText: string): string => {
  // Extract meaningful words from the diagram text
  const words = diagramText
    .replace(/[^\w\s]/g, ' ') // Remove special characters
    .split(/\s+/)
    .filter(word => 
      word.length > 3 && 
      !['flowchart', 'graph', 'style', 'fill', 'stroke', 'color'].includes(word.toLowerCase())
    )
    .slice(0, 3); // Take first 3 meaningful words
  
  if (words.length > 0) {
    const baseName = words.join(' ');
    return generateUniqueNameFromDesired(baseName);
  }
  
  return generateUniqueProjectName();
};

/**
 * Auto-assign project name when starting new project
 */
export const autoAssignProjectName = (
  currentProjectName: string,
  diagramText: string,
  hasUnsavedChanges: boolean
): string => {
  // If project already has a name and no unsaved changes, keep it
  if (currentProjectName.trim() && !hasUnsavedChanges) {
    return currentProjectName;
  }
  
  // If starting fresh or has unsaved changes, generate new name
  if (!currentProjectName.trim() || hasUnsavedChanges) {
    // Try to generate descriptive name from content
    if (diagramText.trim()) {
      return generateDescriptiveProjectName(diagramText);
    }
    
    // Fallback to unique generic name
    return generateUniqueProjectName();
  }
  
  return currentProjectName;
};

/**
 * Validate project name
 */
export const validateProjectName = (name: string): { isValid: boolean; error?: string } => {
  if (!name.trim()) {
    return { isValid: false, error: 'Project name cannot be empty' };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: 'Project name is too long (max 100 characters)' };
  }
  
  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(name)) {
    return { isValid: false, error: 'Project name contains invalid characters' };
  }
  
  return { isValid: true };
};
