// Debug utility for tracking component visibility
export const debugVisibility = (elementId: string, componentName: string) => {
  if (typeof window === 'undefined') return;
  
  const element = document.querySelector(`[data-testid="${elementId}"]`);
  if (!element) {
    console.warn(`[Visibility Debug] Element not found: ${elementId}`);
    return;
  }
  
  const styles = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  
  const visibility = {
    display: styles.display,
    visibility: styles.visibility,
    opacity: styles.opacity,
    transform: styles.transform,
    zIndex: styles.zIndex,
    position: styles.position,
    width: rect.width,
    height: rect.height,
    top: rect.top,
    left: rect.left,
    isVisible: rect.width > 0 && rect.height > 0 && styles.display !== 'none' && styles.visibility !== 'hidden'
  };
  
  console.log(`[Visibility Debug] ${componentName} (${elementId}):`, visibility);
  
  if (!visibility.isVisible) {
    console.warn(`[Visibility Debug] ${componentName} is not visible!`, {
      reasons: {
        zeroSize: rect.width === 0 || rect.height === 0,
        displayNone: styles.display === 'none',
        visibilityHidden: styles.visibility === 'hidden',
        opacityZero: parseFloat(styles.opacity) === 0
      }
    });
  }
  
  return visibility;
};

// Monitor visibility changes
export const monitorVisibility = (elementId: string, componentName: string, interval = 1000) => {
  const monitor = setInterval(() => {
    debugVisibility(elementId, componentName);
  }, interval);
  
  // Return cleanup function
  return () => clearInterval(monitor);
};

// Check all editor components
export const debugAllEditorComponents = () => {
  const components = [
    { id: 'fabric-editor-header', name: 'Header' },
    { id: 'fabric-editor-sidebar', name: 'Sidebar' },
    { id: 'fabric-editor-properties', name: 'Properties Panel' },
    { id: 'primary-sidebar', name: 'Primary Sidebar' },
    { id: 'content-panel', name: 'Content Panel' }
  ];
  
  console.log('[Visibility Debug] Checking all editor components...');
  components.forEach(({ id, name }) => {
    debugVisibility(id, name);
  });
};

// Test sidebar button clickability
export const testSidebarButtons = () => {
  console.log('[Sidebar Test] Testing sidebar button clickability...');
  
  const primarySidebar = document.querySelector('[data-testid="primary-sidebar"]');
  if (!primarySidebar) {
    console.error('[Sidebar Test] Primary sidebar not found!');
    return;
  }
  
  const buttons = primarySidebar.querySelectorAll('button');
  console.log(`[Sidebar Test] Found ${buttons.length} sidebar buttons`);
  
  buttons.forEach((button, index) => {
    const testId = button.getAttribute('data-testid');
    const styles = window.getComputedStyle(button);
    const rect = button.getBoundingClientRect();
    
    const buttonInfo = {
      index,
      testId,
      pointerEvents: styles.pointerEvents,
      cursor: styles.cursor,
      zIndex: styles.zIndex,
      position: styles.position,
      width: rect.width,
      height: rect.height,
      isClickable: styles.pointerEvents !== 'none' && rect.width > 0 && rect.height > 0
    };
    
    console.log(`[Sidebar Test] Button ${index}:`, buttonInfo);
    
    if (!buttonInfo.isClickable) {
      console.warn(`[Sidebar Test] Button ${index} may not be clickable!`);
    }
  });
};

// Add test function to window
if (typeof window !== 'undefined') {
  (window as any).testSidebarButtons = testSidebarButtons;
} 