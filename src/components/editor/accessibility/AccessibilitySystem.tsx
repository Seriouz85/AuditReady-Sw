/**
 * Comprehensive Accessibility System
 * WCAG 2.1 AA compliant accessibility features for AR Editor
 */

import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import { useDiagramStore } from '../../../stores/diagramStore';

// Accessibility context
interface AccessibilityContextType {
  announcements: string[];
  addAnnouncement: (message: string, priority?: 'polite' | 'assertive') => void;
  focusedElement: string | null;
  setFocusedElement: (elementId: string | null) => void;
  keyboardNavigation: boolean;
  setKeyboardNavigation: (enabled: boolean) => void;
  screenReaderMode: boolean;
  setScreenReaderMode: (enabled: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

// ARIA live region for screen reader announcements
export const AriaLiveRegion: React.FC = () => {
  const { announcements } = useAccessibility();
  
  return (
    <>
      {/* Polite announcements */}
      <div
        id="aria-live-polite"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements
          .filter(a => a.includes('[POLITE]'))
          .slice(-1)
          .map(a => a.replace('[POLITE]', ''))
        }
      </div>
      
      {/* Assertive announcements */}
      <div
        id="aria-live-assertive"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements
          .filter(a => a.includes('[ASSERTIVE]'))
          .slice(-1)
          .map(a => a.replace('[ASSERTIVE]', ''))
        }
      </div>
    </>
  );
};

// Screen reader only text component
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
);

// Skip navigation component
export const SkipNavigation: React.FC = () => {
  const skipLinks = [
    { href: '#main-canvas', label: 'Skip to main canvas' },
    { href: '#toolbar', label: 'Skip to toolbar' },
    { href: '#template-panel', label: 'Skip to templates' },
    { href: '#properties-panel', label: 'Skip to properties' }
  ];

  return (
    <nav className="skip-nav" aria-label="Skip navigation">
      {skipLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="skip-link"
          onFocus={(e) => e.currentTarget.classList.add('visible')}
          onBlur={(e) => e.currentTarget.classList.remove('visible')}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
};

// Accessible node component wrapper
interface AccessibleNodeProps {
  nodeId: string;
  label: string;
  type: string;
  children: React.ReactNode;
  isSelected: boolean;
  position: { x: number; y: number };
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

export const AccessibleNode: React.FC<AccessibleNodeProps> = ({
  nodeId,
  label,
  type,
  children,
  isSelected,
  position,
  onFocus,
  onBlur,
  onKeyDown
}) => {
  const { addAnnouncement, setFocusedElement, keyboardNavigation } = useAccessibility();
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleFocus = () => {
    setFocusedElement(nodeId);
    addAnnouncement(`Focused on ${type} node: ${label}. Position: ${Math.round(position.x)}, ${Math.round(position.y)}`, 'polite');
    onFocus?.();
  };

  const handleBlur = () => {
    setFocusedElement(null);
    onBlur?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const { key, ctrlKey, shiftKey } = event;
    
    switch (key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        addAnnouncement(`Activated node: ${label}`, 'assertive');
        break;
      case 'Delete':
      case 'Backspace':
        event.preventDefault();
        addAnnouncement(`Deleting node: ${label}`, 'assertive');
        break;
      case 'Escape':
        event.preventDefault();
        nodeRef.current?.blur();
        addAnnouncement('Selection cleared', 'polite');
        break;
      case 'Tab':
        if (!keyboardNavigation) {
          event.preventDefault();
        }
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        event.preventDefault();
        handleArrowNavigation(key, ctrlKey, shiftKey);
        break;
    }
    
    onKeyDown?.(event);
  };

  const handleArrowNavigation = (key: string, ctrlKey: boolean, shiftKey: boolean) => {
    const moveDistance = ctrlKey ? 50 : 10;
    const direction = {
      ArrowUp: { x: 0, y: -moveDistance },
      ArrowDown: { x: 0, y: moveDistance },
      ArrowLeft: { x: -moveDistance, y: 0 },
      ArrowRight: { x: moveDistance, y: 0 }
    }[key];

    if (direction) {
      const newPosition = {
        x: position.x + direction.x,
        y: position.y + direction.y
      };
      
      addAnnouncement(
        `Moved ${key.replace('Arrow', '').toLowerCase()} to position ${Math.round(newPosition.x)}, ${Math.round(newPosition.y)}`,
        'polite'
      );
    }
  };

  return (
    <div
      ref={nodeRef}
      role="button"
      tabIndex={0}
      aria-label={`${type} node: ${label}`}
      aria-describedby={`${nodeId}-description`}
      aria-selected={isSelected}
      aria-expanded={false}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`accessible-node ${isSelected ? 'selected' : ''}`}
    >
      {children}
      
      {/* Hidden description for screen readers */}
      <div id={`${nodeId}-description`} className="sr-only">
        {`${type} node positioned at ${Math.round(position.x)}, ${Math.round(position.y)}. ${isSelected ? 'Currently selected.' : ''} Use arrow keys to move, Enter to activate, Delete to remove.`}
      </div>
    </div>
  );
};

// Accessible edge component wrapper
interface AccessibleEdgeProps {
  edgeId: string;
  sourceLabel: string;
  targetLabel: string;
  children: React.ReactNode;
  isSelected: boolean;
}

export const AccessibleEdge: React.FC<AccessibleEdgeProps> = ({
  edgeId,
  sourceLabel,
  targetLabel,
  children,
  isSelected
}) => {
  const { addAnnouncement, setFocusedElement } = useAccessibility();
  const edgeRef = useRef<HTMLDivElement>(null);

  const handleFocus = () => {
    setFocusedElement(edgeId);
    addAnnouncement(`Focused on connection from ${sourceLabel} to ${targetLabel}`, 'polite');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const { key } = event;
    
    switch (key) {
      case 'Delete':
      case 'Backspace':
        event.preventDefault();
        addAnnouncement(`Deleting connection from ${sourceLabel} to ${targetLabel}`, 'assertive');
        break;
      case 'Escape':
        event.preventDefault();
        edgeRef.current?.blur();
        break;
    }
  };

  return (
    <div
      ref={edgeRef}
      role="button"
      tabIndex={0}
      aria-label={`Connection from ${sourceLabel} to ${targetLabel}`}
      aria-selected={isSelected}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      className={`accessible-edge ${isSelected ? 'selected' : ''}`}
    >
      {children}
      
      <div className="sr-only">
        {`Connection between ${sourceLabel} and ${targetLabel}. ${isSelected ? 'Currently selected.' : ''} Press Delete to remove.`}
      </div>
    </div>
  );
};

// Keyboard navigation help modal
export const KeyboardHelpModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  const keyboardShortcuts = [
    { category: 'Navigation', shortcuts: [
      { key: 'Tab', description: 'Navigate between elements' },
      { key: 'Shift + Tab', description: 'Navigate backwards' },
      { key: 'Arrow Keys', description: 'Move selected node' },
      { key: 'Ctrl + Arrow Keys', description: 'Move node in large steps' }
    ]},
    { category: 'Selection', shortcuts: [
      { key: 'Enter / Space', description: 'Activate element' },
      { key: 'Ctrl + A', description: 'Select all' },
      { key: 'Escape', description: 'Clear selection' }
    ]},
    { category: 'Editing', shortcuts: [
      { key: 'Delete', description: 'Delete selected element' },
      { key: 'Ctrl + C', description: 'Copy selected' },
      { key: 'Ctrl + V', description: 'Paste' },
      { key: 'Ctrl + Z', description: 'Undo' },
      { key: 'Ctrl + Y', description: 'Redo' }
    ]},
    { category: 'View', shortcuts: [
      { key: 'Ctrl + +', description: 'Zoom in' },
      { key: 'Ctrl + -', description: 'Zoom out' },
      { key: 'Ctrl + 0', description: 'Reset zoom' },
      { key: 'F', description: 'Fit to screen' }
    ]}
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-help-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg max-w-2xl max-h-96 overflow-y-auto p-6"
        tabIndex={-1}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="keyboard-help-title" className="text-xl font-semibold">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close keyboard help"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-6">
          {keyboardShortcuts.map((category) => (
            <div key={category.category}>
              <h3 className="font-medium text-gray-900 mb-2">{category.category}</h3>
              <dl className="space-y-1">
                {category.shortcuts.map((shortcut) => (
                  <div key={shortcut.key} className="flex justify-between">
                    <dt className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {shortcut.key}
                    </dt>
                    <dd className="text-sm text-gray-600 ml-4">
                      {shortcut.description}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          Press <kbd className="bg-gray-100 px-1 rounded">?</kbd> anytime to open this help.
        </div>
      </div>
    </div>
  );
};

// Focus trap utility
export const FocusTrap: React.FC<{ 
  children: React.ReactNode;
  isActive: boolean;
}> = ({ children, isActive }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      firstFocusableRef.current = focusableElements[0];
      lastFocusableRef.current = focusableElements[focusableElements.length - 1];
      firstFocusableRef.current.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstFocusableRef.current) {
          event.preventDefault();
          lastFocusableRef.current?.focus();
        }
      } else {
        if (document.activeElement === lastFocusableRef.current) {
          event.preventDefault();
          firstFocusableRef.current?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
};

// Color contrast checker
export const useColorContrast = (foreground: string, background: string) => {
  const [contrastRatio, setContrastRatio] = useState<number>(0);
  const [wcagLevel, setWcagLevel] = useState<'AAA' | 'AA' | 'A' | 'FAIL'>('FAIL');

  useEffect(() => {
    const calculateContrast = () => {
      const getLuminance = (hex: string) => {
        const rgb = parseInt(hex.slice(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;

        const toLinear = (c: number) => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        };

        return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
      };

      const l1 = getLuminance(foreground);
      const l2 = getLuminance(background);
      const contrast = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

      setContrastRatio(contrast);

      if (contrast >= 7) {
        setWcagLevel('AAA');
      } else if (contrast >= 4.5) {
        setWcagLevel('AA');
      } else if (contrast >= 3) {
        setWcagLevel('A');
      } else {
        setWcagLevel('FAIL');
      }
    };

    calculateContrast();
  }, [foreground, background]);

  return { contrastRatio: Math.round(contrastRatio * 100) / 100, wcagLevel };
};

// Accessibility provider
export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [focusedElement, setFocusedElement] = useState<string | null>(null);
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);

  const addAnnouncement = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const prefixed = priority === 'assertive' ? `[ASSERTIVE]${message}` : `[POLITE]${message}`;
    setAnnouncements(prev => [...prev.slice(-9), prefixed]); // Keep last 10 announcements
  };

  // Detect screen reader usage
  useEffect(() => {
    const detectScreenReader = () => {
      // Check for common screen reader indicators
      const hasScreenReader = !!(
        window.navigator.userAgent.match(/NVDA|JAWS|VoiceOver|ORCA/) ||
        window.speechSynthesis?.getVoices().length > 0
      );
      setScreenReaderMode(hasScreenReader);
    };

    detectScreenReader();
    
    // Listen for keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setKeyboardNavigation(true);
      }
    };

    const handleMouseDown = () => {
      setKeyboardNavigation(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const value: AccessibilityContextType = {
    announcements,
    addAnnouncement,
    focusedElement,
    setFocusedElement,
    keyboardNavigation,
    setKeyboardNavigation,
    screenReaderMode,
    setScreenReaderMode
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      <AriaLiveRegion />
    </AccessibilityContext.Provider>
  );
};

// Custom hook to use accessibility context
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

// CSS for accessibility features
export const accessibilityStyles = `
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .skip-nav {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1000;
  }

  .skip-link {
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    border-radius: 4px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .skip-link.visible,
  .skip-link:focus {
    top: 6px;
    opacity: 1;
  }

  .accessible-node:focus,
  .accessible-edge:focus {
    outline: 3px solid #005fcc;
    outline-offset: 2px;
  }

  .accessible-node.selected,
  .accessible-edge.selected {
    outline: 3px solid #0078d4;
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  @media (prefers-color-scheme: dark) {
    .skip-link {
      background: #fff;
      color: #000;
    }
  }

  @media (prefers-contrast: high) {
    .accessible-node:focus,
    .accessible-edge:focus,
    .accessible-node.selected,
    .accessible-edge.selected {
      outline: 4px solid #000;
      outline-offset: 2px;
    }
  }
`;

export default {
  AccessibilityProvider,
  useAccessibility,
  AccessibleNode,
  AccessibleEdge,
  SkipNavigation,
  KeyboardHelpModal,
  FocusTrap,
  useColorContrast,
  ScreenReaderOnly,
  accessibilityStyles
};