import React, { useState, useEffect } from 'react';
import {
  Search,
  Grid3X3,
  List,
  GitBranch,
  Users,
  Calendar,
  Workflow,
  Plus,
  Download,
  Star,
  Clock
} from 'lucide-react';
import { getTemplateManager, Template, TemplateCategory } from '../templates/TemplateManager';
import { useFabricCanvasStore } from '../core/FabricCanvasStore';
import { AUDIT_COLORS } from '../core/fabric-utils';

interface TemplateGalleryProps {
  visible: boolean;
  onClose: () => void;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ visible, onClose }) => {
  const { canvas } = useFabricCanvasStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const templateManager = getTemplateManager(canvas);

  useEffect(() => {
    if (templateManager && visible) {
      setCategories(templateManager.getCategories());
      setTemplates(templateManager.getAllTemplates());
    }
  }, [templateManager, visible]);

  useEffect(() => {
    if (!templateManager) return;

    let filteredTemplates = templateManager.getAllTemplates();

    // Filter by category
    if (selectedCategory !== 'all') {
      filteredTemplates = templateManager.getTemplatesByCategory(selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filteredTemplates = templateManager.searchTemplates(searchQuery);
    }

    setTemplates(filteredTemplates);
  }, [searchQuery, selectedCategory, templateManager]);

  const handleApplyTemplate = async (templateId: string) => {
    if (!templateManager) return;

    setLoading(true);
    try {
      const success = await templateManager.applyTemplate(templateId);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error applying template:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'flowchart': return <GitBranch size={20} />;
      case 'orgchart': return <Users size={20} />;
      case 'timeline': return <Calendar size={20} />;
      case 'process': return <Workflow size={20} />;
      default: return <Grid3X3 size={20} />;
    }
  };

  if (!visible) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '90vw',
    maxWidth: '1200px',
    height: '80vh',
    maxHeight: '800px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  };

  const headerStyle: React.CSSProperties = {
    padding: '24px',
    borderBottom: `1px solid ${AUDIT_COLORS.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
  };

  const sidebarStyle: React.CSSProperties = {
    width: '250px',
    borderRight: `1px solid ${AUDIT_COLORS.border}`,
    padding: '16px',
    overflowY: 'auto'
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const searchBarStyle: React.CSSProperties = {
    padding: '16px',
    borderBottom: `1px solid ${AUDIT_COLORS.border}`,
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  };

  const templatesGridStyle: React.CSSProperties = {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'grid',
    gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
    gap: '16px'
  };

  const templateCardStyle: React.CSSProperties = {
    border: `1px solid ${AUDIT_COLORS.border}`,
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: 'white'
  };

  const categoryItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    marginBottom: '4px'
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#111827' }}>
              Template Gallery
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
              Choose from professional templates to get started quickly
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '8px'
            }}
          >
            ×
          </button>
        </div>

        <div style={contentStyle}>
          {/* Sidebar */}
          <div style={sidebarStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
              Categories
            </h3>
            
            <div
              style={{
                ...categoryItemStyle,
                backgroundColor: selectedCategory === 'all' ? '#f3f4f6' : 'transparent'
              }}
              onClick={() => setSelectedCategory('all')}
            >
              <Grid3X3 size={20} />
              <span>All Templates</span>
            </div>

            {categories.map(category => (
              <div
                key={category.id}
                style={{
                  ...categoryItemStyle,
                  backgroundColor: selectedCategory === category.id ? '#f3f4f6' : 'transparent'
                }}
                onClick={() => setSelectedCategory(category.id)}
              >
                {getCategoryIcon(category.id)}
                <div>
                  <div style={{ fontWeight: '500' }}>{category.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {category.templates.length} templates
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div style={mainStyle}>
            {/* Search Bar */}
            <div style={searchBarStyle}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search 
                  size={20} 
                  style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#6b7280'
                  }} 
                />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 44px',
                    border: `1px solid ${AUDIT_COLORS.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '8px',
                    border: `1px solid ${AUDIT_COLORS.border}`,
                    borderRadius: '6px',
                    background: viewMode === 'grid' ? AUDIT_COLORS.primary : 'white',
                    color: viewMode === 'grid' ? 'white' : '#6b7280',
                    cursor: 'pointer'
                  }}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '8px',
                    border: `1px solid ${AUDIT_COLORS.border}`,
                    borderRadius: '6px',
                    background: viewMode === 'list' ? AUDIT_COLORS.primary : 'white',
                    color: viewMode === 'list' ? 'white' : '#6b7280',
                    cursor: 'pointer'
                  }}
                >
                  <List size={16} />
                </button>
              </div>
            </div>

            {/* Templates Grid */}
            <div style={templatesGridStyle}>
              {templates.map(template => (
                <div
                  key={template.id}
                  style={templateCardStyle}
                  onClick={() => handleApplyTemplate(template.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = AUDIT_COLORS.primary;
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = AUDIT_COLORS.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Template Preview */}
                  <div style={{
                    height: viewMode === 'grid' ? '120px' : '60px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b7280'
                  }}>
                    {getCategoryIcon(template.category)}
                  </div>

                  {/* Template Info */}
                  <div>
                    <h4 style={{ 
                      margin: '0 0 4px 0', 
                      fontSize: '16px', 
                      fontWeight: '600',
                      color: '#111827'
                    }}>
                      {template.name}
                    </h4>
                    <p style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: '14px', 
                      color: '#6b7280',
                      lineHeight: '1.4'
                    }}>
                      {template.description}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {template.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          style={{
                            fontSize: '12px',
                            padding: '2px 8px',
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280',
                            borderRadius: '12px'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;
