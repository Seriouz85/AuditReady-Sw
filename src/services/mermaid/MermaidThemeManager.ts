/**
 * Mermaid Theme and Styling Management
 * Handles theme configuration and custom styling for AuditReady
 */
import { MermaidTheme, ThemeVariables } from './types/mermaid-config';

export class MermaidThemeManager {
  private static instance: MermaidThemeManager;
  private themes: Map<string, MermaidTheme> = new Map();
  private currentTheme: string = 'auditready-dark';

  private constructor() {
    this.initializeDefaultThemes();
  }

  public static getInstance(): MermaidThemeManager {
    if (!MermaidThemeManager.instance) {
      MermaidThemeManager.instance = new MermaidThemeManager();
    }
    return MermaidThemeManager.instance;
  }

  /**
   * Initialize default themes
   */
  private initializeDefaultThemes(): void {
    // AuditReady Dark Theme (Primary)
    this.themes.set('auditready-dark', {
      name: 'AuditReady Dark',
      description: 'Professional dark theme with blue gradients',
      variables: {
        primaryColor: '#3b82f6',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#1e40af',
        lineColor: '#64748b',
        sectionBkgColor: '#1e293b',
        altSectionBkgColor: '#334155',
        gridColor: '#475569',
        secondaryColor: '#06b6d4',
        tertiaryColor: '#8b5cf6'
      }
    });

    // AuditReady Light Theme
    this.themes.set('auditready-light', {
      name: 'AuditReady Light',
      description: 'Clean light theme for professional presentations',
      variables: {
        primaryColor: '#2563eb',
        primaryTextColor: '#1f2937',
        primaryBorderColor: '#3b82f6',
        lineColor: '#6b7280',
        sectionBkgColor: '#f8fafc',
        altSectionBkgColor: '#f1f5f9',
        gridColor: '#e5e7eb',
        secondaryColor: '#0891b2',
        tertiaryColor: '#7c3aed'
      }
    });

    // High Contrast Theme for Accessibility
    this.themes.set('auditready-contrast', {
      name: 'AuditReady High Contrast',
      description: 'High contrast theme for accessibility compliance',
      variables: {
        primaryColor: '#000000',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#000000',
        lineColor: '#000000',
        sectionBkgColor: '#ffffff',
        altSectionBkgColor: '#f0f0f0',
        gridColor: '#666666',
        secondaryColor: '#333333',
        tertiaryColor: '#666666'
      }
    });

    // Audit-specific Risk Theme
    this.themes.set('auditready-risk', {
      name: 'AuditReady Risk Assessment',
      description: 'Color-coded theme for risk assessment diagrams',
      variables: {
        primaryColor: '#ef4444', // Red for high risk
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#dc2626',
        lineColor: '#64748b',
        sectionBkgColor: '#fef2f2', // Light red background
        altSectionBkgColor: '#fee2e2',
        gridColor: '#fca5a5',
        secondaryColor: '#f59e0b', // Orange for medium risk
        tertiaryColor: '#22c55e'   // Green for low risk
      }
    });

    // Compliance Theme
    this.themes.set('auditready-compliance', {
      name: 'AuditReady Compliance',
      description: 'Professional theme for compliance documentation',
      variables: {
        primaryColor: '#059669', // Green for compliant
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#047857',
        lineColor: '#6b7280',
        sectionBkgColor: '#f0fdf4',
        altSectionBkgColor: '#dcfce7',
        gridColor: '#86efac',
        secondaryColor: '#3b82f6', // Blue for in-progress
        tertiaryColor: '#ef4444'   // Red for non-compliant
      }
    });
  }

  /**
   * Get theme by name
   */
  public getTheme(name: string): MermaidTheme | undefined {
    return this.themes.get(name);
  }

  /**
   * Get all available themes
   */
  public getAllThemes(): MermaidTheme[] {
    return Array.from(this.themes.values());
  }

  /**
   * Get current theme
   */
  public getCurrentTheme(): MermaidTheme {
    return this.themes.get(this.currentTheme)!;
  }

  /**
   * Set current theme
   */
  public setCurrentTheme(name: string): boolean {
    if (this.themes.has(name)) {
      this.currentTheme = name;
      return true;
    }
    return false;
  }

  /**
   * Add custom theme
   */
  public addCustomTheme(name: string, theme: MermaidTheme): void {
    this.themes.set(name, theme);
  }

  /**
   * Generate CSS variables for current theme
   */
  public generateCSSVariables(): string {
    const theme = this.getCurrentTheme();
    const variables = theme.variables;
    
    return `
      :root {
        --mermaid-primary-color: ${variables.primaryColor};
        --mermaid-primary-text-color: ${variables.primaryTextColor};
        --mermaid-primary-border-color: ${variables.primaryBorderColor};
        --mermaid-line-color: ${variables.lineColor};
        --mermaid-section-bg-color: ${variables.sectionBkgColor};
        --mermaid-alt-section-bg-color: ${variables.altSectionBkgColor};
        --mermaid-grid-color: ${variables.gridColor};
        --mermaid-secondary-color: ${variables.secondaryColor};
        --mermaid-tertiary-color: ${variables.tertiaryColor};
      }
    `;
  }

  /**
   * Generate theme configuration for Mermaid
   */
  public generateMermaidThemeConfig(): { theme: string; themeVariables: ThemeVariables } {
    const theme = this.getCurrentTheme();
    
    return {
      theme: 'base', // Use base theme and override with variables
      themeVariables: theme.variables
    };
  }

  /**
   * Create theme variant for specific diagram types
   */
  public createDiagramSpecificTheme(baseTheme: string, diagramType: string): ThemeVariables {
    const base = this.getTheme(baseTheme);
    if (!base) return this.getCurrentTheme().variables;

    const variables = { ...base.variables };

    // Customize based on diagram type
    switch (diagramType) {
      case 'flowchart':
        // Enhance flowchart readability
        variables.primaryBorderColor = this.adjustColor(variables.primaryColor, -20);
        break;
      
      case 'sequence':
        // Optimize for sequence diagrams
        variables.actorBkg = variables.sectionBkgColor;
        variables.actorBorder = variables.primaryBorderColor;
        variables.actorTextColor = variables.primaryTextColor;
        break;
      
      case 'gantt':
        // Gantt chart specific colors
        variables.cScale0 = variables.primaryColor;
        variables.cScale1 = variables.secondaryColor;
        variables.cScale2 = variables.tertiaryColor;
        break;
      
      case 'pie':
        // Pie chart color palette
        variables.pie1 = variables.primaryColor;
        variables.pie2 = variables.secondaryColor;
        variables.pie3 = variables.tertiaryColor;
        variables.pie4 = this.adjustColor(variables.primaryColor, 30);
        break;
    }

    return variables;
  }

  /**
   * Adjust color brightness
   */
  private adjustColor(color: string, percent: number): string {
    // Simple color adjustment - in production, use a proper color library
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  /**
   * Export theme as JSON
   */
  public exportTheme(name: string): string | null {
    const theme = this.getTheme(name);
    return theme ? JSON.stringify(theme, null, 2) : null;
  }

  /**
   * Import theme from JSON
   */
  public importTheme(name: string, themeJson: string): boolean {
    try {
      const theme = JSON.parse(themeJson) as MermaidTheme;
      this.addCustomTheme(name, theme);
      return true;
    } catch (error) {
      console.error('Failed to import theme:', error);
      return false;
    }
  }

  /**
   * Get theme recommendations based on diagram content
   */
  public getThemeRecommendations(diagramType: string, content?: string): string[] {
    const recommendations: string[] = [];

    switch (diagramType) {
      case 'flowchart':
        if (content?.includes('risk') || content?.includes('threat')) {
          recommendations.push('auditready-risk');
        }
        if (content?.includes('compliance') || content?.includes('control')) {
          recommendations.push('auditready-compliance');
        }
        recommendations.push('auditready-dark', 'auditready-light');
        break;
      
      default:
        recommendations.push('auditready-dark', 'auditready-light');
    }

    return recommendations;
  }

  /**
   * Validate theme configuration
   */
  public validateTheme(theme: MermaidTheme): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!theme.name) errors.push('Theme name is required');
    if (!theme.variables) errors.push('Theme variables are required');
    
    const requiredVariables = [
      'primaryColor', 'primaryTextColor', 'primaryBorderColor',
      'lineColor', 'sectionBkgColor', 'altSectionBkgColor'
    ];
    
    requiredVariables.forEach(variable => {
      if (!theme.variables[variable as keyof ThemeVariables]) {
        errors.push(`Missing required variable: ${variable}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
