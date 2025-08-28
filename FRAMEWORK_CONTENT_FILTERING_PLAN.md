# Framework-Specific Content Filtering Plan

## Objective
Create a system that displays only the relevant unified requirements and guidance content based on the user's selected compliance frameworks in the Framework Mapping page.

## Current State Analysis

### Data Flow
1. **Framework Mapping Page** (`/compliance/framework-mapping`)
   - Users select which frameworks they need to comply with
   - Selections are stored in database table: `organization_framework_selections`
   - Frameworks: ISO 27001, ISO 27002, CIS Controls, GDPR, NIS2, etc.

2. **Compliance Simplification Page** (`/compliance/simplification`)
   - Currently shows all unified requirements/guidance
   - No filtering based on framework selection
   - Uses `ComplianceUnificationService` to load data

3. **Validation Dashboards** (Admin only)
   - `UnifiedRequirementsValidationDashboard`
   - `UnifiedGuidanceValidationDashboard`
   - Generate AI suggestions for content improvement

## Proposed Solution

### 1. Database Schema Enhancement
```sql
-- Track which frameworks contribute to each unified requirement
CREATE TABLE unified_requirement_framework_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unified_requirement_id UUID REFERENCES unified_requirements(id),
  framework VARCHAR(50) NOT NULL,
  framework_requirement_id VARCHAR(255),
  relevance_score DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track which frameworks contribute to each guidance item
CREATE TABLE unified_guidance_framework_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unified_guidance_id UUID REFERENCES unified_guidance(id),
  framework VARCHAR(50) NOT NULL,
  framework_control_id VARCHAR(255),
  relevance_score DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Service Layer Updates

#### ComplianceUnificationService Enhancement
```typescript
interface FrameworkFilterOptions {
  organizationId: string;
  includePartialMatches?: boolean; // Show items if ANY selected framework applies
  minimumRelevanceScore?: number; // Threshold for inclusion (0.0-1.0)
}

// New methods
async getFilteredUnifiedRequirements(options: FrameworkFilterOptions): Promise<UnifiedRequirement[]>
async getFilteredUnifiedGuidance(options: FrameworkFilterOptions): Promise<UnifiedGuidance[]>
```

### 3. Content Filtering Logic

#### Filtering Rules
1. **Exact Match**: Show content only if ALL contributing frameworks are selected
2. **Partial Match**: Show content if ANY contributing framework is selected
3. **Relevance-Based**: Show content based on cumulative relevance score

#### Implementation Approach
```typescript
// Example filtering logic
function filterContentByFrameworks(
  content: UnifiedContent[],
  selectedFrameworks: string[],
  mode: 'exact' | 'partial' | 'relevance' = 'partial'
): UnifiedContent[] {
  return content.filter(item => {
    const itemFrameworks = item.framework_mappings;
    
    switch(mode) {
      case 'exact':
        // All item frameworks must be in selected
        return itemFrameworks.every(f => selectedFrameworks.includes(f));
      
      case 'partial':
        // At least one overlap
        return itemFrameworks.some(f => selectedFrameworks.includes(f));
      
      case 'relevance':
        // Calculate relevance score
        const relevance = calculateRelevance(itemFrameworks, selectedFrameworks);
        return relevance >= 0.5; // Configurable threshold
    }
  });
}
```

### 4. UI/UX Considerations

#### Visual Indicators
- **Framework Tags**: Display small badges showing which frameworks each requirement/guidance relates to
- **Relevance Indicator**: Show relevance percentage or confidence score
- **Filtering Toggle**: Allow users to switch between "Show All" and "Show Relevant Only"

#### Example UI Component
```tsx
<RequirementCard>
  <div className="flex items-center justify-between">
    <h3>{requirement.title}</h3>
    <div className="flex gap-1">
      {requirement.frameworks.map(fw => (
        <Badge 
          key={fw}
          variant={selectedFrameworks.includes(fw) ? 'default' : 'outline'}
          className="text-xs"
        >
          {fw}
        </Badge>
      ))}
    </div>
  </div>
  <p>{requirement.content}</p>
</RequirementCard>
```

### 5. Implementation Phases

#### Phase 1: Data Mapping (Week 1)
- Create mapping tables in database
- Populate mappings from existing compliance data
- Build service methods for filtered retrieval

#### Phase 2: Service Integration (Week 2)
- Update `ComplianceUnificationService`
- Add filtering logic to API endpoints
- Create unit tests for filtering

#### Phase 3: UI Implementation (Week 3)
- Update Compliance Simplification page
- Add framework badges to requirements/guidance
- Implement filtering toggle

#### Phase 4: Testing & Refinement (Week 4)
- User acceptance testing
- Performance optimization
- Documentation updates

## Benefits

1. **Reduced Cognitive Load**: Users only see relevant requirements
2. **Improved Compliance Focus**: Clear visibility of framework-specific obligations
3. **Better Resource Allocation**: Teams can prioritize based on actual requirements
4. **Audit Preparation**: Clearer mapping between frameworks and controls

## Considerations

### Performance
- Caching filtered results per organization
- Lazy loading for large requirement sets
- Indexed database queries on framework mappings

### Flexibility
- Allow manual override to show/hide specific requirements
- Support for custom frameworks
- Ability to export filtered views

### Maintenance
- Automated mapping updates when frameworks change
- Version control for requirement mappings
- Audit trail for filtering changes

## Success Metrics

1. **Reduction in Time**: Measure time to review requirements (target: 40% reduction)
2. **User Satisfaction**: Survey on content relevance (target: >85% satisfaction)
3. **Compliance Coverage**: Ensure no critical requirements are filtered out
4. **Performance**: Page load time <2 seconds with filtering

## Next Steps

1. Review plan with development team
2. Create detailed technical specifications
3. Set up development environment for testing
4. Begin Phase 1 implementation

## Questions for Stakeholders

1. Should filtering be mandatory or optional?
2. How should we handle requirements that apply to multiple frameworks?
3. What level of granularity is needed for filtering (category, requirement, sub-requirement)?
4. Should filtered content be completely hidden or just de-emphasized?
5. How should we handle framework updates and version changes?