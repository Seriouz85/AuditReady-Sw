import React, { useState, useEffect } from 'react';
import {
  Zap,
  Play,
  Pause,
  Settings,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  RotateCcw,
  Activity
} from 'lucide-react';
import { useFabricCanvasStore } from '../core/FabricCanvasStore';
import {
  getWorkflowAutomationEngine,
  WorkflowRule,
  WorkflowExecution
} from '../core/WorkflowAutomationEngine';
import { AUDIT_COLORS } from '../core/fabric-utils';
import { ModernPanel, ModernButton, ModernBadge } from '../design-system/ModernComponents';
import { DesignTokens, getColor, getSpacing } from '../design-system/DesignTokens';

interface WorkflowAutomationPanelProps {
  visible: boolean;
  onClose: () => void;
}

const WorkflowAutomationPanel: React.FC<WorkflowAutomationPanelProps> = ({ visible, onClose }) => {
  const { canvas } = useFabricCanvasStore();
  const [rules, setRules] = useState<WorkflowRule[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [isEngineEnabled, setIsEngineEnabled] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'rules' | 'executions' | 'suggestions'>('rules');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const automationEngine = getWorkflowAutomationEngine(canvas);

  useEffect(() => {
    if (!visible || !automationEngine || !canvas) return;

    loadRules();
    loadExecutions();
    setIsEngineEnabled(automationEngine.isEngineEnabled());

    // Set up event listeners
    const handleRuleAdded = (rule: WorkflowRule) => {
      setRules(prev => [...prev, rule]);
    };

    const handleExecutionCompleted = (data: { execution: WorkflowExecution; rule: WorkflowRule }) => {
      setExecutions(prev => [...prev, data.execution]);
    };

    const handleContentSuggestion = (suggestion: any) => {
      setSuggestions(prev => [...prev, { ...suggestion, id: Date.now(), timestamp: new Date() }]);
    };

    automationEngine.on('rule:added', handleRuleAdded);
    automationEngine.on('execution:completed', handleExecutionCompleted);
    automationEngine.on('content:suggestion', handleContentSuggestion);

    return () => {
      automationEngine.off('rule:added', handleRuleAdded);
      automationEngine.off('execution:completed', handleExecutionCompleted);
      automationEngine.off('content:suggestion', handleContentSuggestion);
    };
  }, [visible, automationEngine]);

  const loadRules = () => {
    if (!automationEngine) return;
    const allRules = automationEngine.getAllRules();
    setRules(allRules);
  };

  const loadExecutions = () => {
    if (!automationEngine) return;
    const allExecutions = automationEngine.getExecutions();
    setExecutions(allExecutions.slice(-10)); // Show last 10 executions
  };

  const handleToggleEngine = () => {
    if (!automationEngine) return;
    const newState = !isEngineEnabled;
    automationEngine.setEnabled(newState);
    setIsEngineEnabled(newState);
  };

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    if (!automationEngine) return;
    if (enabled) {
      automationEngine.enableRule(ruleId);
    } else {
      automationEngine.disableRule(ruleId);
    }
    loadRules();
  };

  const handleExecuteRule = async (ruleId: string) => {
    if (!automationEngine) return;
    try {
      await automationEngine.executeRuleManually(ruleId);
      loadExecutions();
    } catch (error) {
      console.error('Failed to execute rule:', error);
    }
  };

  const getCategoryIcon = (category: WorkflowRule['category']) => {
    switch (category) {
      case 'audit': return '📋';
      case 'risk': return '⚠️';
      case 'compliance': return '✅';
      case 'process': return '🔄';
      default: return '⚙️';
    }
  };

  const getExecutionStatusIcon = (status: WorkflowExecution['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} color="#10b981" />;
      case 'failed': return <AlertCircle size={16} color="#ef4444" />;
      case 'running': return <Clock size={16} color="#3b82f6" />;
      default: return <Clock size={16} color="#6b7280" />;
    }
  };

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const duration = endTime.getTime() - start.getTime();
    return `${duration}ms`;
  };

  if (!visible) return null;

  return (
    <ModernPanel
      title="Workflow Automation"
      subtitle={`${isEngineEnabled ? 'Active' : 'Inactive'} • ${rules.length} rules • ${executions.length} executions`}
      onClose={onClose}
      width="900px"
      maxHeight="90vh"
    >
      {/* Header Actions */}
      <div style={{ display: 'flex', gap: getSpacing(3), marginBottom: getSpacing(6) }}>
        <ModernButton
          variant={isEngineEnabled ? 'danger' : 'primary'}
          onClick={handleToggleEngine}
          icon={isEngineEnabled ? <Pause size={16} /> : <Play size={16} />}
        >
          {isEngineEnabled ? 'Disable' : 'Enable'} Engine
        </ModernButton>
        <ModernBadge variant={isEngineEnabled ? 'success' : 'error'}>
          {isEngineEnabled ? 'Active' : 'Inactive'}
        </ModernBadge>
      </div>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: `1px solid ${AUDIT_COLORS.border}`,
            padding: '0 24px'
          }}>
            {[
              { id: 'rules', label: 'Rules', count: rules.length },
              { id: 'executions', label: 'Executions', count: executions.length },
              { id: 'suggestions', label: 'Suggestions', count: suggestions.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: selectedTab === tab.id ? AUDIT_COLORS.primary : '#6b7280',
                  borderBottom: selectedTab === tab.id ? `2px solid ${AUDIT_COLORS.primary}` : '2px solid transparent'
                }}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
            {selectedTab === 'rules' && (
              <div>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Automation Rules</h3>
                  <ModernButton variant="secondary" size="sm" icon={<Plus size={16} />}>
                    Add Rule
                  </ModernButton>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {rules.map(rule => (
                    <div key={rule.id} style={{
                      padding: '16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      backgroundColor: rule.enabled ? 'white' : '#f8fafc'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>{getCategoryIcon(rule.category)}</span>
                          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                            {rule.name}
                          </h4>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: '#f1f5f9',
                            fontSize: '10px',
                            fontWeight: '500',
                            color: '#475569'
                          }}>
                            {rule.category}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            onClick={() => handleToggleRule(rule.id, !rule.enabled)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: rule.enabled ? '#10b981' : '#6b7280'
                            }}
                          >
                            {rule.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <button
                            onClick={() => handleExecuteRule(rule.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#3b82f6'
                            }}
                          >
                            <Play size={16} />
                          </button>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                        {rule.description}
                      </p>
                      <div style={{ marginTop: '8px', fontSize: '11px', color: '#9ca3af' }}>
                        Trigger: {rule.trigger.type} • Priority: {rule.priority} • Actions: {rule.actions.length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'executions' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Recent Executions</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {executions.map(execution => {
                    const rule = rules.find(r => r.id === execution.ruleId);
                    return (
                      <div key={execution.id} style={{
                        padding: '12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        backgroundColor: 'white'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {getExecutionStatusIcon(execution.status)}
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                              {rule?.name || 'Unknown Rule'}
                            </span>
                          </div>
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>
                            {formatDuration(execution.startTime, execution.endTime)}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          Started: {execution.startTime.toLocaleTimeString()} •
                          Steps: {execution.steps.length} •
                          Status: {execution.status}
                        </div>
                        {execution.error && (
                          <div style={{
                            marginTop: '4px',
                            fontSize: '11px',
                            color: '#ef4444',
                            backgroundColor: '#fef2f2',
                            padding: '4px 8px',
                            borderRadius: '4px'
                          }}>
                            Error: {execution.error}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {executions.length === 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: '#6b7280'
                    }}>
                      <Activity size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                      <p style={{ margin: 0, fontSize: '14px' }}>No executions yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedTab === 'suggestions' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Smart Suggestions</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {suggestions.map(suggestion => (
                    <div key={suggestion.id} style={{
                      padding: '16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                          {suggestion.rule?.name || 'Smart Suggestion'}
                        </h4>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          {suggestion.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>
                        {suggestion.message}
                      </p>
                      <div style={{ marginTop: '8px', fontSize: '11px', color: '#9ca3af' }}>
                        Type: {suggestion.type} • Rule: {suggestion.rule?.category}
                      </div>
                    </div>
                  ))}

                  {suggestions.length === 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: '#6b7280'
                    }}>
                      <Zap size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                      <p style={{ margin: 0, fontSize: '14px' }}>No suggestions yet</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                        Start adding content to see smart suggestions
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
    </ModernPanel>
  );
};

export default WorkflowAutomationPanel;
