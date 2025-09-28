# AuditReady Development Guide

## 🚀 Getting Started

This guide provides comprehensive instructions for developers working on the AuditReady platform. Whether you're a new team member or an experienced contributor, this document will help you understand our development practices and standards.

---

## 🏗️ Development Environment Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: Latest version
- **Docker**: For containerized development (optional)
- **VS Code**: Recommended IDE with extensions

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/audit-readiness-hub.git
   cd audit-readiness-hub
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Configure required variables
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

### VS Code Extensions (Recommended)
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-playwright.playwright",
    "ms-vscode.vscode-json"
  ]
}
```

---

## 📏 Development Standards

### 🚨 Critical File Size Rule
**MAXIMUM FILE SIZE: 500 lines (HARD LIMIT)**

This is our most important development rule for maintaining AI-friendly code and development velocity.

#### File Size Enforcement
```typescript
// Pre-commit hook checks
const FILE_SIZE_RULES = {
  WARNING_THRESHOLD: 400,    // Start planning extraction
  CRITICAL_THRESHOLD: 450,   // Must extract before adding features
  MAXIMUM_ALLOWED: 500,      // Hard limit - blocks commits
  
  EXEMPT_FILES: [
    'src/data/mockData.ts',   // Demo data (protected)
    'src/types/generated.ts', // Auto-generated types
  ]
};
```

#### Benefits of 500-Line Rule
- ✅ AI can easily understand entire file context
- ✅ Faster development and debugging
- ✅ Easier code reviews and maintenance
- ✅ Better component reusability
- ✅ Prevents monolithic file growth

### Component Extraction Strategy

When approaching the 500-line limit:

1. **Extract UI Components**
   ```typescript
   // Before: Large component (800+ lines)
   const LargeAssessmentDashboard = () => {
     // Header logic (100 lines)
     // Stats grid (150 lines)
     // Category panel (200 lines)
     // Content display (350 lines)
   };
   
   // After: Extracted components
   ├── UnifiedAssessmentHeader.tsx      (120 lines)
   ├── UnifiedStatsGrid.tsx            (180 lines)
   ├── UnifiedCategoryPanel.tsx        (200 lines)
   └── UnifiedContentDisplay.tsx       (180 lines)
   ```

2. **Extract Business Logic**
   ```typescript
   // Service layer extraction
   ├── AssessmentValidationService.ts   (150 lines)
   ├── RequirementMappingService.ts     (200 lines)
   └── ComplianceCalculationService.ts  (180 lines)
   ```

3. **Extract Type Definitions**
   ```typescript
   // Move to dedicated type files
   ├── src/types/assessment.ts
   ├── src/types/compliance.ts
   └── src/types/validation.ts
   ```

### Naming Conventions

#### Component Naming
```typescript
// UI Components
UnifiedDashboardHeader.tsx       // Cross-dashboard components
EnhancedAssessmentCard.tsx       // Feature-rich components
SharedValidationPanel.tsx        // Reusable components

// Service Components
ComplianceValidationService.ts   // Business logic services
AssessmentDataProcessor.ts       // Data processing utilities
RequirementMappingEngine.ts      // Core functionality engines
```

#### File Organization
```
src/
├── components/
│   ├── ui/                 # Base components (shadcn/ui)
│   ├── unified/            # Cross-domain components
│   ├── enhanced/           # Feature-rich components
│   └── domain/             # Domain-specific folders
├── services/
│   ├── core/               # Core business logic
│   ├── integration/        # External service integrations
│   └── utils/              # Shared utilities
```

---

## 🎯 TypeScript Standards

### Type Safety Requirements
- **Zero TypeScript errors** in production builds
- **Strict mode enabled** across all configuration files
- **Comprehensive interfaces** for all data structures
- **Generic types** for reusable components

### Interface Patterns
```typescript
// Base interface pattern
interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
}

// Domain-specific extension
interface AssessmentRequirement extends BaseEntity {
  title: string;
  description: string;
  category: ComplianceCategory;
  frameworks: FrameworkMapping[];
  validation_rules: ValidationRule[];
}

// Service contract pattern
interface IAssessmentService {
  create(data: CreateAssessmentData): Promise<Assessment>;
  update(id: string, data: UpdateAssessmentData): Promise<Assessment>;
  delete(id: string): Promise<void>;
  validate(assessment: Assessment): Promise<ValidationResult>;
}
```

### Error Handling Patterns
```typescript
// Result pattern for error handling
type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

// Service implementation
class AssessmentService implements IAssessmentService {
  async create(data: CreateAssessmentData): Promise<Result<Assessment>> {
    try {
      const assessment = await this.supabase
        .from('assessments')
        .insert(data)
        .select()
        .single();
      
      return { success: true, data: assessment };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }
}
```

---

## 🧪 Testing Guidelines

### Testing Structure
```
src/
├── components/
│   └── __tests__/          # Component tests
├── services/
│   └── __tests__/          # Service layer tests
├── hooks/
│   └── __tests__/          # Custom hook tests
└── utils/
    └── __tests__/          # Utility function tests
```

### Testing Patterns
```typescript
// Component testing pattern
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AssessmentCard } from '../AssessmentCard';

describe('AssessmentCard', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('should display assessment information correctly', () => {
    const mockAssessment = {
      id: '1',
      title: 'ISO 27001 Assessment',
      status: 'in_progress',
      completion_percentage: 65,
    };

    renderWithProviders(<AssessmentCard assessment={mockAssessment} />);
    
    expect(screen.getByText('ISO 27001 Assessment')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
  });
});
```

### Service Testing Pattern
```typescript
// Service testing with mocks
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssessmentService } from '../AssessmentService';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve(mockAssessment))
        }))
      }))
    }))
  }
}));

describe('AssessmentService', () => {
  let service: AssessmentService;

  beforeEach(() => {
    service = new AssessmentService();
    vi.clearAllMocks();
  });

  it('should create assessment successfully', async () => {
    const createData = {
      title: 'Test Assessment',
      framework_id: 'iso27001',
    };

    const result = await service.create(createData);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Test Assessment');
    }
  });
});
```

### Test Coverage Requirements
- **Minimum 80% code coverage** for production builds
- **100% coverage** for critical business logic
- **Integration tests** for complex workflows
- **E2E tests** for user journeys

---

## 🚀 Performance Guidelines

### Bundle Optimization
```typescript
// Code splitting patterns
const LazyAssessmentDashboard = lazy(() => 
  import('./pages/AssessmentDashboard').then(module => ({
    default: module.AssessmentDashboard
  }))
);

// Component-level splitting
const LazyEnhancedEditor = lazy(() => 
  import('./components/editor/EnhancedEditor')
);

// Service-level splitting
const LazyAIService = lazy(() => 
  import('./services/ai/GeminiContentGenerator')
);
```

### React Performance Patterns
```typescript
// Memoization patterns
const ExpensiveComponent = memo(({ data, onUpdate }) => {
  const processedData = useMemo(() => {
    return data.map(item => complexProcessing(item));
  }, [data]);

  const handleUpdate = useCallback((id: string) => {
    onUpdate(id);
  }, [onUpdate]);

  return (
    <div>
      {processedData.map(item => (
        <ItemComponent 
          key={item.id} 
          item={item} 
          onUpdate={handleUpdate} 
        />
      ))}
    </div>
  );
});

// Context optimization
const OptimizedProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  
  // Split contexts by update frequency
  const stableValue = useMemo(() => ({
    config: state.config,
    permissions: state.permissions,
  }), [state.config, state.permissions]);

  const mutableValue = useMemo(() => ({
    data: state.data,
    loading: state.loading,
    error: state.error,
  }), [state.data, state.loading, state.error]);

  return (
    <StableContext.Provider value={stableValue}>
      <MutableContext.Provider value={mutableValue}>
        {children}
      </MutableContext.Provider>
    </StableContext.Provider>
  );
};
```

### Performance Monitoring
```typescript
// Performance metrics tracking
const performanceMetrics = {
  bundleSize: {
    current: '2.8MB',
    target: '2.0MB',
    tracking: 'webpack-bundle-analyzer'
  },
  coreWebVitals: {
    LCP: { current: '3.2s', target: '2.5s' },
    FID: { current: '95ms', target: '100ms' },
    CLS: { current: '0.08', target: '0.1' }
  },
  lighthouse: {
    current: 85,
    target: 95
  }
};
```

---

## 🔐 Security Development Guidelines

### Input Validation Patterns
```typescript
// Zod schema validation
import { z } from 'zod';

const CreateAssessmentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  framework_id: z.string().uuid(),
  organization_id: z.string().uuid(),
  due_date: z.string().datetime().optional(),
});

// Service layer validation
class AssessmentService {
  async create(data: unknown): Promise<Result<Assessment>> {
    const validation = CreateAssessmentSchema.safeParse(data);
    
    if (!validation.success) {
      return {
        success: false,
        error: new ValidationError(validation.error.message)
      };
    }

    // Proceed with validated data
    return this.createAssessment(validation.data);
  }
}
```

### Security Headers Implementation
```typescript
// Content Security Policy
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "https://api.gemini.google.com"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'", "https://api.supabase.io"],
  fontSrc: ["'self'"],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"],
  frameSrc: ["'none'"],
};

// XSS Protection
import DOMPurify from 'dompurify';

const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });
};
```

### Authentication Patterns
```typescript
// Protected route pattern
const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { hasPermission } = usePermissions();

  if (loading) return <LoadingSpinner />;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasPermission(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Service authentication
class AuthenticatedService {
  constructor(private supabase: SupabaseClient) {}

  private async getAuthenticatedUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    
    if (error || !user) {
      throw new AuthenticationError('User not authenticated');
    }
    
    return user;
  }

  async performAction(data: ActionData) {
    const user = await this.getAuthenticatedUser();
    
    // Proceed with authenticated action
    return this.executeAction(data, user);
  }
}
```

---

## 📁 Component Development Patterns

### Unified Component Pattern
```typescript
// Template for cross-domain components
interface UnifiedComponentProps {
  variant?: 'default' | 'compact' | 'detailed';
  data: any[];
  onAction?: (action: string, data: any) => void;
  className?: string;
  children?: React.ReactNode;
}

export const UnifiedDataGrid = <T extends Record<string, any>>({
  variant = 'default',
  data,
  onAction,
  className,
  children
}: UnifiedComponentProps & { data: T[] }) => {
  const handleAction = useCallback((action: string, item: T) => {
    onAction?.(action, item);
  }, [onAction]);

  return (
    <div className={cn('unified-data-grid', className)}>
      {/* Consistent layout patterns */}
      <GridHeader variant={variant} />
      <GridContent data={data} onAction={handleAction} />
      {children}
    </div>
  );
};
```

### Enhanced Component Pattern
```typescript
// Template for feature-rich components
interface EnhancedComponentProps extends BaseComponentProps {
  features: FeatureConfig;
  analytics?: AnalyticsConfig;
  ai?: AIIntegrationConfig;
}

export const EnhancedAssessmentCard = ({
  assessment,
  features,
  analytics,
  ai,
  ...props
}: EnhancedComponentProps) => {
  // Feature flags
  const {
    enableRealTimeUpdates,
    enableAIInsights,
    enableCollaboration
  } = features;

  // AI integration
  const { aiInsights } = useAIInsights(assessment.id, {
    enabled: enableAIInsights && ai?.enabled,
    config: ai?.config
  });

  // Analytics tracking
  useAnalytics('assessment_card_view', {
    assessment_id: assessment.id,
    ...analytics?.metadata
  });

  return (
    <Card className="enhanced-assessment-card">
      {/* Core content */}
      <AssessmentContent assessment={assessment} />
      
      {/* Enhanced features */}
      {enableAIInsights && aiInsights && (
        <AIInsightsPanel insights={aiInsights} />
      )}
      
      {enableCollaboration && (
        <CollaborationIndicators assessmentId={assessment.id} />
      )}
    </Card>
  );
};
```

---

## 🗃️ Database Development Guidelines

### Migration Best Practices
```sql
-- Migration naming convention: YYYYMMDD_descriptive_name.sql
-- 20250927_add_assessment_templates.sql

-- Always use transactions
BEGIN;

-- Create table with proper constraints
CREATE TABLE assessment_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  framework_id UUID REFERENCES standards(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  template_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT assessment_templates_name_org_unique 
    UNIQUE(name, organization_id)
);

-- Enable RLS
ALTER TABLE assessment_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can access their organization templates"
  ON assessment_templates FOR ALL
  USING (organization_id = auth.organization_id());

-- Create indexes
CREATE INDEX idx_assessment_templates_organization 
  ON assessment_templates(organization_id);
CREATE INDEX idx_assessment_templates_framework 
  ON assessment_templates(framework_id);

-- Update trigger for updated_at
CREATE TRIGGER set_timestamp_assessment_templates
  BEFORE UPDATE ON assessment_templates
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

COMMIT;
```

### Query Optimization Patterns
```typescript
// Efficient query patterns
class OptimizedQueryService {
  // Use proper indexes and filtering
  async getAssessmentsByOrganization(orgId: string, filters: QueryFilters) {
    const query = this.supabase
      .from('assessments')
      .select(`
        id,
        title,
        status,
        framework:standards(id, name),
        requirements:assessment_requirements(count)
      `)
      .eq('organization_id', orgId);

    // Apply filters efficiently
    if (filters.status) {
      query.eq('status', filters.status);
    }

    if (filters.framework_id) {
      query.eq('framework_id', filters.framework_id);
    }

    // Pagination
    if (filters.limit) {
      query.limit(filters.limit);
    }

    if (filters.offset) {
      query.range(filters.offset, filters.offset + filters.limit - 1);
    }

    return query;
  }

  // Batch operations for efficiency
  async updateMultipleAssessments(updates: AssessmentUpdate[]) {
    const batches = chunk(updates, 100); // Process in batches
    
    for (const batch of batches) {
      await this.supabase
        .from('assessments')
        .upsert(batch);
    }
  }
}
```

---

## 🔄 Git Workflow

### Branch Naming Convention
```bash
# Feature branches
feature/assessment-template-system
feature/enhanced-ai-integration

# Bug fixes
bugfix/typescript-errors-resolution
bugfix/performance-optimization

# Hotfixes
hotfix/security-vulnerability-fix
hotfix/critical-data-issue

# Documentation
docs/development-guide-update
docs/architecture-documentation
```

### Commit Message Standards
```bash
# Format: <type>(<scope>): <description>
# Examples:
feat(assessments): add template management system
fix(typescript): resolve remaining type errors
perf(bundle): optimize component loading with lazy imports
docs(architecture): update service layer documentation
refactor(components): extract unified dashboard components
test(services): add comprehensive assessment service tests
security(auth): implement enhanced MFA system
```

### Pull Request Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] This change requires a documentation update

## File Size Compliance
- [ ] All modified files are under 500 lines
- [ ] Extracted components follow naming conventions
- [ ] No TypeScript errors introduced

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Performance impact assessed

## Security Checklist
- [ ] Input validation implemented
- [ ] No sensitive data exposed
- [ ] Authentication/authorization verified
- [ ] Security headers configured

## Demo Account Safety
- [ ] Changes don't affect demo data integrity
- [ ] Demo account restrictions maintained
- [ ] No cross-contamination risk
```

---

## 🛡️ Demo Environment Protection

### Critical Demo Safety Rules
```typescript
// Demo account protection patterns
const DEMO_EMAIL = 'demo@auditready.com';

// Prevent demo data modification
export const isDemoUser = (user: User): boolean => {
  return user.email === DEMO_EMAIL;
};

// Demo-safe service operations
class DemoSafeService {
  async updateData(data: UpdateData, user: User) {
    if (isDemoUser(user)) {
      // Return success but don't actually update
      return { success: true, message: 'Demo mode: Changes not persisted' };
    }
    
    return this.performRealUpdate(data);
  }

  async deleteData(id: string, user: User) {
    if (isDemoUser(user)) {
      throw new Error('Demo account cannot delete data');
    }
    
    return this.performRealDelete(id);
  }
}

// Component-level demo warnings
const DemoWarningWrapper = ({ children, requiresModification = false }) => {
  const { user } = useAuth();
  const isDemo = isDemoUser(user);

  if (isDemo && requiresModification) {
    return (
      <div className="demo-warning">
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Demo Mode</AlertTitle>
          <AlertDescription>
            This feature requires data modification which is disabled in demo mode.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};
```

### Demo Data Management
```typescript
// Mock data service for demo
class DemoDataService {
  private static readonly MOCK_DATA_SOURCE = 'src/data/mockData.ts';
  
  async getDemoData(type: DataType): Promise<any[]> {
    // Always return consistent demo data
    return mockData[type] || [];
  }

  async updateDemoData(type: DataType, data: any): Promise<void> {
    // Simulate update without persistence
    console.log(`Demo mode: ${type} update simulated`, data);
  }
}
```

---

## 🎯 Code Review Guidelines

### Review Checklist

#### File Size Compliance
- [ ] No files exceed 500 lines
- [ ] Extraction plan exists for files approaching limit
- [ ] Component boundaries are logical and reusable

#### TypeScript Quality
- [ ] No TypeScript errors or warnings
- [ ] Proper type definitions for all interfaces
- [ ] Generic types used appropriately

#### Security Review
- [ ] Input validation implemented
- [ ] No sensitive data in logs or client code
- [ ] Authentication/authorization properly handled
- [ ] Demo account protection maintained

#### Performance Review
- [ ] No unnecessary re-renders
- [ ] Proper memoization patterns
- [ ] Efficient database queries
- [ ] Bundle size impact assessed

#### Testing Review
- [ ] Unit tests for new functionality
- [ ] Edge cases covered
- [ ] Error scenarios tested
- [ ] Integration tests for complex workflows

### Common Issues to Watch For

```typescript
// ❌ Common mistakes
const BadComponent = () => {
  // Mistake 1: Creating objects in render
  const config = { option1: true, option2: false };
  
  // Mistake 2: Not memoizing expensive calculations
  const expensiveData = data.map(item => complexCalculation(item));
  
  // Mistake 3: Inline event handlers
  return (
    <div onClick={() => handleClick(data)}>
      {expensiveData.map(item => (
        <div key={item.id} onClick={() => handleItemClick(item)}>
          {item.name}
        </div>
      ))}
    </div>
  );
};

// ✅ Correct patterns
const GoodComponent = memo(({ data, onItemClick }) => {
  // Memoize objects
  const config = useMemo(() => ({ 
    option1: true, 
    option2: false 
  }), []);
  
  // Memoize expensive calculations
  const expensiveData = useMemo(() => 
    data.map(item => complexCalculation(item)), 
    [data]
  );
  
  // Memoize event handlers
  const handleClick = useCallback(() => {
    // Handle click
  }, []);

  const handleItemClick = useCallback((item) => {
    onItemClick(item);
  }, [onItemClick]);

  return (
    <div onClick={handleClick}>
      {expensiveData.map(item => (
        <ItemComponent
          key={item.id}
          item={item}
          onClick={handleItemClick}
        />
      ))}
    </div>
  );
});
```

---

## 🔧 Debugging Guidelines

### Common Debugging Tools
```typescript
// Development utilities
const DevTools = {
  logPerformance: (name: string, fn: Function) => {
    console.time(name);
    const result = fn();
    console.timeEnd(name);
    return result;
  },

  logRenders: (componentName: string) => {
    console.log(`${componentName} rendered at ${new Date().toISOString()}`);
  },

  logStateChanges: (stateName: string, oldValue: any, newValue: any) => {
    console.log(`${stateName} changed:`, { oldValue, newValue });
  }
};

// React DevTools integration
if (process.env.NODE_ENV === 'development') {
  // Enable React DevTools Profiler
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.onCommitFiberRoot;
}
```

### Error Boundary Implementation
```typescript
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Report to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        contexts: { errorInfo }
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback />;
    }

    return this.props.children;
  }
}
```

---

## 📚 Resources & References

### Documentation Links
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)

### Internal Resources
- [Architecture Guide](./ARCHITECTURE.md)
- [Security Guidelines](./SECURITY.md)
- [Performance Optimization](./PERFORMANCE.md)
- [API Documentation](../src/lib/api/README.md)

### Development Tools
- [VS Code Extensions](.vscode/extensions.json)
- [ESLint Configuration](../eslint.config.js)
- [TypeScript Configuration](../tsconfig.json)
- [Vite Configuration](../vite.config.ts)

---

This development guide serves as the foundation for maintaining code quality, consistency, and the 500-line file size rule that keeps our codebase AI-friendly and maintainable.

---

*Development Guide Version: 2.0 | Last Updated: September 27, 2025 | Next Review: December 2025*