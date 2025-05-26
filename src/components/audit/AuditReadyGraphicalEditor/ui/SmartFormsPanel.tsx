import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Eye,
  Download,
  X,
  CheckSquare,
  Type,
  Calendar,
  Mail,
  Hash,
  List,
  Edit3,
  Trash2
} from 'lucide-react';
import { useFabricCanvasStore } from '../core/FabricCanvasStore';
import { getSmartFormBuilder, SmartForm } from '../core/SmartFormBuilder';
import { AUDIT_COLORS } from '../core/fabric-utils';

interface SmartFormsPanelProps {
  visible: boolean;
  onClose: () => void;
}

const SmartFormsPanel: React.FC<SmartFormsPanelProps> = ({ visible, onClose }) => {
  const { canvas } = useFabricCanvasStore();
  const [forms, setForms] = useState<SmartForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<SmartForm | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [newFormName, setNewFormName] = useState('');
  const [newFormDescription, setNewFormDescription] = useState('');
  const [newFormCategory, setNewFormCategory] = useState<SmartForm['category']>('audit');
  const [currentStep, setCurrentStep] = useState<'select' | 'create' | 'build'>('select');

  const formBuilder = getSmartFormBuilder(canvas);

  useEffect(() => {
    if (!visible || !formBuilder || !canvas) return;

    loadForms();

    // Set up event listeners
    const handleFormCreated = (form: SmartForm) => {
      setForms(prev => [...prev, form]);
    };

    const handleFormDeleted = (formId: string) => {
      setForms(prev => prev.filter(f => f.id !== formId));
    };

    formBuilder.on('form:created', handleFormCreated);
    formBuilder.on('form:deleted', handleFormDeleted);

    return () => {
      formBuilder.off('form:created', handleFormCreated);
      formBuilder.off('form:deleted', handleFormDeleted);
    };
  }, [visible, formBuilder]);

  const loadForms = () => {
    if (!formBuilder) return;
    const allForms = formBuilder.getAllForms();
    setForms(allForms);
  };

  const handleCreateForm = () => {
    if (!formBuilder || !newFormName.trim()) return;

    const newForm = formBuilder.createForm({
      name: newFormName,
      description: newFormDescription,
      category: newFormCategory
    });

    setSelectedForm(newForm);
    setNewFormName('');
    setNewFormDescription('');
    setNewFormCategory('audit');
    setShowCreateDialog(false);
    setShowFormBuilder(true);
    setCurrentStep('build');
  };

  const handleStartFromTemplate = (templateForm: SmartForm) => {
    setSelectedForm(templateForm);
    setCurrentStep('build');
    setShowFormBuilder(true);
  };

  const handleQuickUse = async (form: SmartForm) => {
    if (!formBuilder) return;

    try {
      await formBuilder.renderFormOnCanvas(form.id);
      setSelectedForm(form);
      onClose(); // Close panel after rendering
    } catch (error) {
      console.error('Failed to render form:', error);
    }
  };

  const handleRenderForm = async (form: SmartForm) => {
    if (!formBuilder) return;

    try {
      await formBuilder.renderFormOnCanvas(form.id);
      setSelectedForm(form);
      onClose(); // Close panel after rendering
    } catch (error) {
      console.error('Failed to render form:', error);
    }
  };

  const handleDeleteForm = (formId: string) => {
    if (!formBuilder) return;
    if (!confirm('Are you sure you want to delete this form?')) return;

    formBuilder.deleteForm(formId);
  };

  const handleExportForm = (form: SmartForm) => {
    if (!formBuilder) return;

    const formData = formBuilder.exportFormData(form.id);
    if (!formData) return;

    const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${form.name.replace(/\s+/g, '_')}_form.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (category: SmartForm['category']) => {
    switch (category) {
      case 'audit': return '📋';
      case 'risk': return '⚠️';
      case 'compliance': return '✅';
      case 'assessment': return '📊';
      case 'checklist': return '☑️';
      default: return '📄';
    }
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type size={14} />;
      case 'checkbox': return <CheckSquare size={14} />;
      case 'date': return <Calendar size={14} />;
      case 'email': return <Mail size={14} />;
      case 'number': return <Hash size={14} />;
      case 'select': return <List size={14} />;
      case 'textarea': return <Edit3 size={14} />;
      default: return <Type size={14} />;
    }
  };

  const getCategoryColor = (category: SmartForm['category']) => {
    switch (category) {
      case 'audit': return '#2563eb';
      case 'risk': return '#dc2626';
      case 'compliance': return '#059669';
      case 'assessment': return '#7c3aed';
      case 'checklist': return '#ea580c';
      default: return '#6b7280';
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

  const panelStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '700px',
    maxHeight: '90vh',
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
    padding: '24px',
    overflowY: 'auto',
    flex: 1
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
            <FileText size={24} color={AUDIT_COLORS.primary} />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#111827' }}>
              Smart Forms
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={() => setShowCreateDialog(true)} style={secondaryButtonStyle}>
              <Plus size={16} />
              Create Form
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
          {/* Step Navigation */}
          {currentStep !== 'select' && (
            <div style={{ marginBottom: '24px' }}>
              <button
                onClick={() => {
                  setCurrentStep('select');
                  setShowFormBuilder(false);
                  setSelectedForm(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: '4px 0'
                }}
              >
                ← Back to Forms
              </button>
            </div>
          )}

          {currentStep === 'select' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                  Smart Forms ({forms.length})
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                  Choose from pre-built forms or create your own custom form
                </p>
              </div>

              {/* Quick Actions */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <button
                  onClick={() => setShowCreateDialog(true)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px',
                    backgroundColor: 'white',
                    border: '2px dashed #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.backgroundColor = '#f0f9ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <Plus size={24} />
                  Create New Form
                </button>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px',
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <FileText size={24} />
                  {forms.length} Templates Available
                </div>
              </div>
            </>
          )}

          {forms.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>No forms available</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Create your first form to get started
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              {forms.map(form => (
                <div key={form.id} style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  backgroundColor: 'white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '18px' }}>{getCategoryIcon(form.category)}</span>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                          {form.name}
                        </h4>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: getCategoryColor(form.category),
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: '500'
                        }}>
                          {form.category}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280', lineHeight: '1.4' }}>
                        {form.description}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#9ca3af' }}>
                        <span>{form.fields.length} fields</span>
                        <span>Layout: {form.layout.type}</span>
                        <span>Theme: {form.styling.theme}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                      <button
                        onClick={() => handleQuickUse(form)}
                        style={{
                          ...primaryButtonStyle,
                          padding: '6px 12px',
                          fontSize: '12px'
                        }}
                      >
                        <Eye size={14} />
                        Quick Use
                      </button>
                      <button
                        onClick={() => handleStartFromTemplate(form)}
                        style={{
                          ...secondaryButtonStyle,
                          padding: '6px 12px',
                          fontSize: '12px'
                        }}
                      >
                        <Edit3 size={14} />
                        Customize
                      </button>
                      <button
                        onClick={() => handleExportForm(form)}
                        style={{
                          ...secondaryButtonStyle,
                          padding: '6px 8px',
                          fontSize: '12px'
                        }}
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteForm(form.id)}
                        style={{
                          ...secondaryButtonStyle,
                          padding: '6px 8px',
                          fontSize: '12px',
                          color: '#ef4444',
                          borderColor: '#fecaca'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Form Fields Preview */}
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                      Form Fields:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {form.fields.slice(0, 6).map(field => (
                        <div key={field.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '4px',
                          fontSize: '11px',
                          color: '#475569'
                        }}>
                          {getFieldTypeIcon(field.type)}
                          {field.label}
                          {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                        </div>
                      ))}
                      {form.fields.length > 6 && (
                        <div style={{
                          padding: '4px 8px',
                          backgroundColor: '#e2e8f0',
                          borderRadius: '4px',
                          fontSize: '11px',
                          color: '#6b7280'
                        }}>
                          +{form.fields.length - 6} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form Builder Interface */}
          {currentStep === 'build' && selectedForm && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  Form Builder: {selectedForm.name}
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                  Customize your form fields and layout
                </p>
              </div>

              {/* Form Preview */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 300px',
                gap: '24px',
                height: '400px'
              }}>
                {/* Form Fields List */}
                <div style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#fafafa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Form Fields</h4>
                    <button style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                      + Add Field
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
                    {selectedForm.fields.map((field, index) => (
                      <div key={field.id} style={{
                        padding: '12px',
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {getFieldTypeIcon(field.type)}
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '500' }}>{field.label}</div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>{field.type}</div>
                          </div>
                          {field.required && <span style={{ color: '#ef4444', fontSize: '12px' }}>*</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button style={{
                            padding: '4px',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            color: '#6b7280'
                          }}>
                            <Edit3 size={12} />
                          </button>
                          <button style={{
                            padding: '4px',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            color: '#ef4444'
                          }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Settings */}
                <div style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: 'white'
                }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600' }}>Form Settings</h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>
                        Layout Type
                      </label>
                      <select style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '13px'
                      }}>
                        <option value="single-column">Single Column</option>
                        <option value="two-column">Two Column</option>
                        <option value="grid">Grid</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>
                        Theme
                      </label>
                      <select style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '13px'
                      }}>
                        <option value="audit-ready">AuditReady</option>
                        <option value="professional">Professional</option>
                        <option value="modern">Modern</option>
                        <option value="minimal">Minimal</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>
                        Field Spacing
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="40"
                        defaultValue="20"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      onClick={() => handleQuickUse(selectedForm)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Deploy to Canvas
                    </button>
                    <button
                      onClick={() => handleExportForm(selectedForm)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: 'white',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Export Form
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create Form Dialog */}
          {showCreateDialog && (
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
                  Create New Form
                </h3>
                <input
                  type="text"
                  placeholder="Form name"
                  value={newFormName}
                  onChange={(e) => setNewFormName(e.target.value)}
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
                  placeholder="Description (optional)"
                  value={newFormDescription}
                  onChange={(e) => setNewFormDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginBottom: '12px',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                />
                <select
                  value={newFormCategory}
                  onChange={(e) => setNewFormCategory(e.target.value as SmartForm['category'])}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginBottom: '16px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="audit">Audit</option>
                  <option value="risk">Risk Assessment</option>
                  <option value="compliance">Compliance</option>
                  <option value="assessment">Assessment</option>
                  <option value="checklist">Checklist</option>
                </select>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setShowCreateDialog(false)}
                    style={secondaryButtonStyle}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateForm}
                    style={primaryButtonStyle}
                    disabled={!newFormName.trim()}
                  >
                    <Plus size={14} />
                    Create Form
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartFormsPanel;
