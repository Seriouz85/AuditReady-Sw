import React, { useState, useEffect } from 'react';
import {
  Layout,
  Search,
  Filter,
  Star,
  Clock,
  Users,
  Download,
  Plus,
  X,
  Eye,
  Heart,
  Tag,
  Grid3X3
} from 'lucide-react';
import { useFabricCanvasStore } from '../core/FabricCanvasStore';
import { getTemplateManager, Template, TemplateCategory, TemplateSearchFilters } from '../core/TemplateManager';
import { getAdvancedAnalyticsManager } from '../core/AdvancedAnalyticsManager';
import { AUDIT_COLORS } from '../core/fabric-utils';
import AuditReadyPremiumBadge from './AuditReadyPremiumBadge';

interface TemplateGalleryPanelProps {
  visible: boolean;
  onClose: () => void;
}

const TemplateGalleryPanel: React.FC<TemplateGalleryPanelProps> = ({ visible, onClose }) => {
  const { canvas } = useFabricCanvasStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [filters, setFilters] = useState<TemplateSearchFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');

  const templateManager = getTemplateManager(canvas);

  useEffect(() => {
    if (visible && templateManager && canvas) {
      loadTemplates();
      loadCategories();
    }
  }, [visible, templateManager, canvas]);

  useEffect(() => {
    if (templateManager) {
      searchTemplates();
    }
  }, [searchQuery, selectedCategory, selectedSubcategory, filters, templateManager]);

  const loadTemplates = () => {
    if (!templateManager) return;
    const allTemplates = templateManager.getAllTemplates();
    setTemplates(allTemplates);
  };

  const loadCategories = () => {
    if (!templateManager) return;
    const allCategories = templateManager.getCategories();
    setCategories(allCategories);
  };

  const searchTemplates = () => {
    if (!templateManager) return;

    const searchFilters: TemplateSearchFilters = {
      ...filters,
      category: selectedCategory || undefined,
      subcategory: selectedSubcategory || undefined
    };

    const results = templateManager.searchTemplates(searchQuery, searchFilters);
    setTemplates(results);
  };

  const handleApplyTemplate = async (template: Template) => {
    if (!templateManager || !canvas) return;

    setIsLoading(true);
    try {
      console.log('Applying template:', template.name);
      const success = await templateManager.applyTemplate(template.id);
      if (success) {
        // Track template usage for analytics
        const analyticsManager = getAdvancedAnalyticsManager(canvas);
        if (analyticsManager) {
          analyticsManager.trackTemplateUsage(template.id);
        }

        console.log('Template applied successfully');
        onClose();
      } else {
        console.error('Template application failed');
        alert('Failed to apply template. Please try again.');
      }
    } catch (error) {
      console.error('Failed to apply template:', error);
      alert('Failed to apply template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!templateManager || !newTemplateName.trim()) return;

    setIsLoading(true);
    try {
      await templateManager.saveAsTemplate(
        newTemplateName,
        newTemplateDescription,
        (selectedCategory as Template['category']) || 'general',
        selectedSubcategory || undefined,
        []
      );
      setNewTemplateName('');
      setNewTemplateDescription('');
      setShowSaveDialog(false);
      loadTemplates();
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: Template['metadata']['difficulty']): string => {
    switch (difficulty) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getCategoryIcon = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || '📄';
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

  const panelStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '90vw',
    maxWidth: '1200px',
    height: '90vh',
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
    padding: '24px',
    overflowY: 'auto'
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    padding: '24px',
    overflowY: 'auto'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: AUDIT_COLORS.primary,
    color: 'white'
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0'
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Layout size={24} color={AUDIT_COLORS.primary} />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#111827' }}>
              Template Gallery
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={() => setShowSaveDialog(true)} style={secondaryButtonStyle}>
              <Plus size={16} />
              Save Current as Template
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Sidebar */}
          <div style={sidebarStyle}>
            {/* Search */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280'
                }} />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Categories */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Categories
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedSubcategory('');
                  }}
                  style={{
                    ...buttonStyle,
                    backgroundColor: !selectedCategory ? AUDIT_COLORS.primary : 'transparent',
                    color: !selectedCategory ? 'white' : '#374151',
                    justifyContent: 'flex-start',
                    width: '100%'
                  }}
                >
                  All Templates
                </button>
                {categories.map(category => (
                  <div key={category.id}>
                    <button
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setSelectedSubcategory('');
                      }}
                      style={{
                        ...buttonStyle,
                        backgroundColor: selectedCategory === category.id ? AUDIT_COLORS.primary : 'transparent',
                        color: selectedCategory === category.id ? 'white' : '#374151',
                        justifyContent: 'flex-start',
                        width: '100%'
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>{category.icon}</span>
                      {category.name}
                      <span style={{ marginLeft: 'auto', fontSize: '12px', opacity: 0.7 }}>
                        {category.templateCount}
                      </span>
                    </button>
                    {selectedCategory === category.id && category.subcategories.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedSubcategory(sub.id)}
                        style={{
                          ...buttonStyle,
                          backgroundColor: selectedSubcategory === sub.id ? '#e0e7ff' : 'transparent',
                          color: selectedSubcategory === sub.id ? '#3730a3' : '#6b7280',
                          justifyContent: 'flex-start',
                          width: '100%',
                          marginLeft: '20px',
                          fontSize: '13px'
                        }}
                      >
                        {sub.name}
                        <span style={{ marginLeft: 'auto', fontSize: '11px', opacity: 0.7 }}>
                          {sub.templateCount}
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                <Filter size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Filters
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={filters.isPremium === false}
                    onChange={(e) => setFilters(prev => ({ ...prev, isPremium: e.target.checked ? false : undefined }))}
                  />
                  Free Templates
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={filters.isPremium === true}
                    onChange={(e) => setFilters(prev => ({ ...prev, isPremium: e.target.checked ? true : undefined }))}
                  />
                  <AuditReadyPremiumBadge size="small" variant="icon" />
                  Premium Templates
                </label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={mainStyle}>
            {/* Results Header */}
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  {selectedCategory ?
                    categories.find(c => c.id === selectedCategory)?.name || 'Templates' :
                    'All Templates'
                  }
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                  {templates.length} template{templates.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <select
                value={filters.sortBy || 'name'}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
                <option value="usage">Sort by Usage</option>
                <option value="created">Sort by Date</option>
              </select>
            </div>

            {/* Templates Grid */}
            {templates.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#6b7280'
              }}>
                <Grid3X3 size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>No templates found</h3>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                {templates.map(template => (
                  <div
                    key={template.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      backgroundColor: 'white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    {/* Template Thumbnail */}
                    <div style={{
                      height: '160px',
                      backgroundColor: '#f8fafc',
                      backgroundImage: `url(${template.thumbnail})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative'
                    }}>
                      {template.isPremium && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px'
                        }}>
                          <AuditReadyPremiumBadge size="small" variant="badge" />
                        </div>
                      )}
                      <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {getCategoryIcon(template.category)} {template.category}
                      </div>
                    </div>

                    {/* Template Info */}
                    <div style={{ padding: '16px' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                          {template.name}
                        </h4>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.4' }}>
                          {template.description}
                        </p>
                      </div>

                      {/* Template Metadata */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', fontSize: '12px', color: '#6b7280' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={12} fill="#f59e0b" color="#f59e0b" />
                          {template.rating.toFixed(1)}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Users size={12} />
                          {template.usageCount}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {template.metadata.estimatedTime}m
                        </div>
                        <div style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: getDifficultyColor(template.metadata.difficulty),
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: '500'
                        }}>
                          {template.metadata.difficulty}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyTemplate(template);
                          }}
                          disabled={isLoading}
                          style={{
                            ...primaryButtonStyle,
                            flex: 1,
                            justifyContent: 'center',
                            fontSize: '13px'
                          }}
                        >
                          <Download size={14} />
                          Use Template
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTemplate(template);
                          }}
                          style={{
                            ...secondaryButtonStyle,
                            padding: '8px'
                          }}
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save Template Dialog */}
        {showSaveDialog && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '400px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
                Save as Template
              </h3>
              <input
                type="text"
                placeholder="Template name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  marginBottom: '12px',
                  boxSizing: 'border-box'
                }}
              />
              <textarea
                placeholder="Description"
                value={newTemplateDescription}
                onChange={(e) => setNewTemplateDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  marginBottom: '16px',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  style={secondaryButtonStyle}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAsTemplate}
                  style={primaryButtonStyle}
                  disabled={!newTemplateName.trim() || isLoading}
                >
                  <Plus size={14} />
                  Save Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateGalleryPanel;
