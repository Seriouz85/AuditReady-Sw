import React, { useState, useEffect } from 'react';
import {
  Grid,
  Pencil,
  Settings,
  Sparkles,
  Type,
  Upload,
  Shield,
  LayoutGrid,
} from 'lucide-react';
import { useFabricCanvasStore } from '../core/FabricCanvasStore';
import ElementsPanel from './panels/ElementsPanel';
import TextPanel from './panels/TextPanel';
import UploadPanel from './panels/UploadPanel';
import DrawingPanel from './panels/DrawingPanel';
import SettingsPanel from './panels/SettingsPanel';
import AiPanel from './panels/AiPanel';
import AuditPanel from './panels/AuditPanel';
import TemplatesPanel from './panels/TemplatesPanel';

import { AUDIT_COLORS } from '../core/fabric-utils';

interface SidebarItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  panel: () => React.ReactElement;
  auditSpecific?: boolean;
}

// Self-contained sidebar styles
const sidebarStyles = {
  sidebarContainer: {
    display: 'flex',
    height: '100%',
    transition: 'all 0.3s ease'
  },
  primarySidebar: {
    width: '72px',
    background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
    borderRight: '1px solid #e2e8f0',
    height: '100%',
    display: 'flex !important' as any,
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '16px 0',
    position: 'relative' as const,
    visibility: 'visible !important' as any,
    opacity: '1 !important' as any,
    transform: 'none !important' as any,
    zIndex: 1000,
    pointerEvents: 'auto' as const,
    flexShrink: 0
  },
  sidebarItemsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '16px 0',
    gap: '8px',
    flex: 1,
    pointerEvents: 'auto' as const
  },
  sidebarItem: {
    width: '56px',
    height: '56px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    position: 'relative' as const,
    color: '#64748b',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    margin: 0,
    pointerEvents: 'auto' as const,
    zIndex: 1001,
    outline: 'none',
    userSelect: 'none' as const
  },
  sidebarItemActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  },
  sidebarItemIcon: {
    marginBottom: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none' as const
  },
  auditIndicator: {
    position: 'absolute' as const,
    top: '-4px',
    right: '-4px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: AUDIT_COLORS.secondary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none' as const
  },
  auditIndicatorDot: {
    width: '6px',
    height: '6px',
    backgroundColor: 'white',
    borderRadius: '50%',
    pointerEvents: 'none' as const
  },
  auditModeIndicator: {
    marginTop: 'auto',
    padding: '12px 8px',
    display: 'flex',
    justifyContent: 'center'
  },
  auditModeBadge: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: 'white',
    padding: '6px 10px',
    borderRadius: '16px',
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
    fontFamily: 'inherit',
    lineHeight: 1
  },
  contentPanel: {
    width: '0px',
    height: '100%',
    backgroundColor: 'white',
    borderRight: '1px solid #e2e8f0',
    position: 'relative' as const,
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    visibility: 'visible !important' as any,
    opacity: '1 !important' as any,
    transform: 'none !important' as any,
    zIndex: 999
  },
  contentPanelExpanded: {
    width: '380px',
    opacity: 1
  },

};

const ModernSidebar: React.FC = () => {
  const [activeSidebar, setActiveSidebar] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { auditMode } = useFabricCanvasStore();

  // Initialize component and ensure stable state
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const sidebarItems: SidebarItem[] = [
    {
      id: 'elements',
      icon: Grid,
      label: 'Elements',
      panel: () => <ElementsPanel />,
    },
    {
      id: 'text',
      icon: Type,
      label: 'Text',
      panel: () => <TextPanel />,
    },
    {
      id: 'uploads',
      icon: Upload,
      label: 'Uploads',
      panel: () => <UploadPanel />,
    },
    {
      id: 'draw',
      icon: Pencil,
      label: 'Draw',
      panel: () => <DrawingPanel />,
    },
    {
      id: 'templates',
      icon: LayoutGrid,
      label: 'Templates',
      panel: () => <TemplatesPanel />,
      auditSpecific: true,
    },
    {
      id: 'audit',
      icon: Shield,
      label: 'Audit Tools',
      panel: () => <AuditPanel />,
      auditSpecific: true,
    },
    {
      id: 'ai',
      icon: Sparkles,
      label: 'AI Assistant',
      panel: () => <AiPanel />,
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Settings',
      panel: () => <SettingsPanel />,
    },
  ];

  const handleItemClick = (id: string) => {
    console.log(`[ModernSidebar] Button clicked: ${id}`);
    try {
      if (id === activeSidebar) {
        // Close panel if clicking the same button
        setActiveSidebar(null);
      } else {
        // Open new panel
        setActiveSidebar(id);
      }
    } catch (error) {
      console.error('Error handling sidebar item click:', error);
      setActiveSidebar(id);
    }
  };

  const closeSidebar = () => {
    console.log('[ModernSidebar] Closing sidebar');
    try {
      setActiveSidebar(null);
    } catch (error) {
      console.error('Error closing sidebar:', error);
    }
  };

  const handleItemHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!e.currentTarget.style.backgroundColor.includes('rgb(59, 130, 246)')) {
      e.currentTarget.style.backgroundColor = '#e2e8f0';
      e.currentTarget.style.color = '#334155';
      e.currentTarget.style.transform = 'translateY(-1px)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    }
  };

  const handleItemLeave = (e: React.MouseEvent<HTMLButtonElement>, isActive: boolean) => {
    if (!isActive) {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.color = '#64748b';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }
  };

  const handleCloseButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = '#f1f5f9';
    e.currentTarget.style.color = '#334155';
  };

  const handleCloseButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'transparent';
    e.currentTarget.style.color = '#64748b';
  };

  const activeItem = sidebarItems.find((item) => item.id === activeSidebar);

  // Don't render until initialized to prevent flashing
  if (!isInitialized) {
    return null;
  }

  return (
    <div style={sidebarStyles.sidebarContainer}>
      {/* Primary Sidebar - Always visible */}
      <aside style={sidebarStyles.primarySidebar} data-testid="primary-sidebar">
        <div style={sidebarStyles.sidebarItemsContainer}>
          {sidebarItems.map((item) => {
            const isActive = activeSidebar === item.id;
            const itemStyle = {
              ...sidebarStyles.sidebarItem,
              ...(isActive ? sidebarStyles.sidebarItemActive : {}),
              ...(item.auditSpecific ? { border: `1px solid ${AUDIT_COLORS.primary}40` } : {})
            };

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                style={itemStyle}
                title={item.label}
                onMouseEnter={(e) => handleItemHover(e)}
                onMouseLeave={(e) => handleItemLeave(e, isActive)}
                data-testid={`sidebar-item-${item.id}`}
              >
                <div style={sidebarStyles.sidebarItemIcon}>
                  <item.icon className="w-5 h-5" />
                </div>
                
                {item.auditSpecific && (
                  <div style={sidebarStyles.auditIndicator}>
                    <div style={sidebarStyles.auditIndicatorDot}></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Audit Mode Indicator */}
        <div style={sidebarStyles.auditModeIndicator}>
          <div style={sidebarStyles.auditModeBadge}>
            {auditMode.toUpperCase()}
          </div>
        </div>
      </aside>

      {/* Content Panel - Expands when item is selected */}
      <div style={{
        ...sidebarStyles.contentPanel,
        ...(activeSidebar ? sidebarStyles.contentPanelExpanded : {})
      }} data-testid="content-panel">
        {activeSidebar && activeItem && (
          <>
            {/* Close Button - Positioned absolutely in top-right */}
            <button
              onClick={closeSidebar}
              style={{
                position: 'absolute' as const,
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                background: 'transparent',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#64748b',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                pointerEvents: 'auto' as const,
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}
              onMouseEnter={handleCloseButtonHover}
              onMouseLeave={handleCloseButtonLeave}
              title="Close panel"
            >
              ×
            </button>

            {/* Panel Content - Full height, no header */}
            <div style={{
              height: '100%',
              overflowY: 'auto' as const,
              overflowX: 'hidden' as const,
              padding: '24px'
            }}>
              {activeItem.panel()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};



export default ModernSidebar; 