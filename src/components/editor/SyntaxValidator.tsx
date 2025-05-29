/**
 * Real-time Syntax Validator Component
 * Provides live syntax validation and suggestions for Mermaid diagrams
 */
import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, CheckCircle, Lightbulb, Info } from 'lucide-react';
import { MermaidService } from '../../services/mermaid';
import { MermaidDesignTokens } from '../ui';

interface SyntaxValidatorProps {
  diagramText: string;
  onValidationChange: (isValid: boolean, errors?: string[], suggestions?: string[]) => void;
  showInline?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  suggestions?: string[];
  metadata?: {
    diagramType: string;
    nodeCount: number;
    edgeCount: number;
    complexity: string;
  };
}

export const SyntaxValidator: React.FC<SyntaxValidatorProps> = ({
  diagramText,
  onValidationChange,
  showInline = true
}) => {
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true });
  const [isValidating, setIsValidating] = useState(false);
  const mermaidService = useRef(MermaidService.getInstance());
  const validationTimeout = useRef<NodeJS.Timeout>();

  // Debounced validation
  useEffect(() => {
    if (validationTimeout.current) {
      clearTimeout(validationTimeout.current);
    }

    validationTimeout.current = setTimeout(() => {
      validateSyntax();
    }, 500); // 500ms debounce

    return () => {
      if (validationTimeout.current) {
        clearTimeout(validationTimeout.current);
      }
    };
  }, [diagramText]);

  const validateSyntax = async () => {
    if (!diagramText.trim()) {
      const result = { isValid: false, error: 'Empty diagram' };
      setValidation(result);
      onValidationChange(false, ['Empty diagram']);
      return;
    }

    setIsValidating(true);
    try {
      const result = await mermaidService.current.validateSyntax(diagramText);
      
      let metadata;
      if (result.isValid) {
        // Get additional metadata for valid diagrams
        try {
          const renderResult = await mermaidService.current.renderDiagram(
            diagramText,
            `validation-${Date.now()}`,
            {}
          );
          metadata = renderResult.metadata;
        } catch (error) {
          // If rendering fails, still mark as invalid
          const errorResult = {
            isValid: false,
            error: `Rendering failed: ${(error as Error).message}`,
            suggestions: ['Check diagram syntax and structure']
          };
          setValidation(errorResult);
          onValidationChange(false, [errorResult.error!], errorResult.suggestions);
          setIsValidating(false);
          return;
        }
      }

      const validationResult = {
        ...result,
        metadata
      };

      setValidation(validationResult);
      onValidationChange(
        result.isValid,
        result.isValid ? [] : [result.error!],
        result.suggestions
      );
    } catch (error) {
      const errorResult = {
        isValid: false,
        error: `Validation error: ${(error as Error).message}`,
        suggestions: ['Check your diagram syntax']
      };
      setValidation(errorResult);
      onValidationChange(false, [errorResult.error], errorResult.suggestions);
    } finally {
      setIsValidating(false);
    }
  };

  if (!showInline) {
    return null;
  }

  const getStatusIcon = () => {
    if (isValidating) {
      return (
        <div style={{
          width: '16px',
          height: '16px',
          border: '2px solid rgba(59, 130, 246, 0.3)',
          borderTop: '2px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      );
    }

    if (validation.isValid) {
      return <CheckCircle size={16} style={{ color: MermaidDesignTokens.colors.semantic.success[500] }} />;
    }

    return <AlertTriangle size={16} style={{ color: MermaidDesignTokens.colors.semantic.error[500] }} />;
  };

  const getStatusColor = () => {
    if (isValidating) return MermaidDesignTokens.colors.accent.blue;
    if (validation.isValid) return MermaidDesignTokens.colors.semantic.success[500];
    return MermaidDesignTokens.colors.semantic.error[500];
  };

  const getStatusText = () => {
    if (isValidating) return 'Validating...';
    if (validation.isValid) return 'Valid syntax';
    return 'Syntax error';
  };

  return (
    <div style={{
      padding: MermaidDesignTokens.spacing[3],
      background: MermaidDesignTokens.colors.glass.primary,
      border: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
      borderRadius: MermaidDesignTokens.borderRadius.lg,
      backdropFilter: MermaidDesignTokens.backdropBlur.md
    }}>
      {/* Status Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: MermaidDesignTokens.spacing[2],
        marginBottom: validation.isValid ? MermaidDesignTokens.spacing[2] : MermaidDesignTokens.spacing[3]
      }}>
        {getStatusIcon()}
        <span style={{
          fontSize: MermaidDesignTokens.typography.fontSize.sm,
          fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
          color: getStatusColor()
        }}>
          {getStatusText()}
        </span>
      </div>

      {/* Valid Diagram Metadata */}
      {validation.isValid && validation.metadata && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: MermaidDesignTokens.spacing[2],
          marginBottom: MermaidDesignTokens.spacing[2]
        }}>
          <div style={{
            padding: MermaidDesignTokens.spacing[2],
            background: MermaidDesignTokens.colors.glass.secondary,
            borderRadius: MermaidDesignTokens.borderRadius.base,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: MermaidDesignTokens.typography.fontSize.xs,
              color: MermaidDesignTokens.colors.text.tertiary,
              marginBottom: '2px'
            }}>
              Type
            </div>
            <div style={{
              fontSize: MermaidDesignTokens.typography.fontSize.sm,
              fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
              color: MermaidDesignTokens.colors.text.primary,
              textTransform: 'capitalize'
            }}>
              {validation.metadata.diagramType}
            </div>
          </div>

          <div style={{
            padding: MermaidDesignTokens.spacing[2],
            background: MermaidDesignTokens.colors.glass.secondary,
            borderRadius: MermaidDesignTokens.borderRadius.base,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: MermaidDesignTokens.typography.fontSize.xs,
              color: MermaidDesignTokens.colors.text.tertiary,
              marginBottom: '2px'
            }}>
              Complexity
            </div>
            <div style={{
              fontSize: MermaidDesignTokens.typography.fontSize.sm,
              fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
              color: MermaidDesignTokens.colors.text.primary,
              textTransform: 'capitalize'
            }}>
              {validation.metadata.complexity}
            </div>
          </div>

          <div style={{
            padding: MermaidDesignTokens.spacing[2],
            background: MermaidDesignTokens.colors.glass.secondary,
            borderRadius: MermaidDesignTokens.borderRadius.base,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: MermaidDesignTokens.typography.fontSize.xs,
              color: MermaidDesignTokens.colors.text.tertiary,
              marginBottom: '2px'
            }}>
              Nodes
            </div>
            <div style={{
              fontSize: MermaidDesignTokens.typography.fontSize.sm,
              fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
              color: MermaidDesignTokens.colors.text.primary
            }}>
              {validation.metadata.nodeCount}
            </div>
          </div>

          <div style={{
            padding: MermaidDesignTokens.spacing[2],
            background: MermaidDesignTokens.colors.glass.secondary,
            borderRadius: MermaidDesignTokens.borderRadius.base,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: MermaidDesignTokens.typography.fontSize.xs,
              color: MermaidDesignTokens.colors.text.tertiary,
              marginBottom: '2px'
            }}>
              Edges
            </div>
            <div style={{
              fontSize: MermaidDesignTokens.typography.fontSize.sm,
              fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
              color: MermaidDesignTokens.colors.text.primary
            }}>
              {validation.metadata.edgeCount}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {!validation.isValid && validation.error && (
        <div style={{
          padding: MermaidDesignTokens.spacing[2],
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: MermaidDesignTokens.borderRadius.base,
          marginBottom: validation.suggestions?.length ? MermaidDesignTokens.spacing[2] : 0
        }}>
          <div style={{
            fontSize: MermaidDesignTokens.typography.fontSize.sm,
            color: '#fecaca',
            lineHeight: 1.4
          }}>
            {validation.error}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {validation.suggestions && validation.suggestions.length > 0 && (
        <div style={{
          padding: MermaidDesignTokens.spacing[2],
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: MermaidDesignTokens.borderRadius.base
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: MermaidDesignTokens.spacing[1],
            marginBottom: MermaidDesignTokens.spacing[2]
          }}>
            <Lightbulb size={14} style={{ color: '#93c5fd' }} />
            <span style={{
              fontSize: MermaidDesignTokens.typography.fontSize.xs,
              fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
              color: '#93c5fd'
            }}>
              Suggestions:
            </span>
          </div>
          {validation.suggestions.map((suggestion, index) => (
            <div
              key={index}
              style={{
                fontSize: MermaidDesignTokens.typography.fontSize.xs,
                color: 'rgba(248, 250, 252, 0.9)',
                marginBottom: index < validation.suggestions!.length - 1 ? '4px' : 0,
                paddingLeft: MermaidDesignTokens.spacing[2],
                borderLeft: '2px solid rgba(59, 130, 246, 0.3)',
                lineHeight: 1.4
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}

      {/* CSS for spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default SyntaxValidator;
