# 🎯 Strategic Decomposition Execution Plan

## 📊 FILE TYPE ANALYSIS

**Total Violations by Type**:
- **Services (.ts)**: 117 files (40% of violations)
- **Components (.tsx)**: 88 files (30% of violations) 
- **Pages (.tsx)**: 52 files (17% of violations)
- **Utilities/Libs (.ts)**: 38 files (13% of violations)
- **External (.js)**: 1 file (d3-org-chart.js)

---

## 🚨 PHASE 1: EMERGENCY RESPONSE (48-72 HOURS)

### P0-1: OneShotDiagramService.ts (2,612 lines → <500 lines)

**IMMEDIATE DECOMPOSITION PLAN**:

#### New File Structure:
```
src/services/ai/
├── OneShotDiagramService.ts (< 500 lines) - Core orchestration
├── diagram-generators/
│   ├── MermaidDiagramGenerator.ts (400-500 lines)
│   ├── PlantUMLDiagramGenerator.ts (400-500 lines)
│   ├── D3DiagramGenerator.ts (400-500 lines)
│   └── index.ts (exports)
├── diagram-validators/
│   ├── DiagramSyntaxValidator.ts (300-400 lines)
│   ├── DiagramContentValidator.ts (300-400 lines)
│   └── index.ts (exports)
├── diagram-utils/
│   ├── DiagramFormatting.ts (200-300 lines)
│   ├── DiagramExport.ts (200-300 lines)
│   ├── DiagramTransforms.ts (200-300 lines)
│   └── index.ts (exports)
└── diagram-types/
    ├── DiagramInterfaces.ts (100-200 lines)
    ├── DiagramConstants.ts (100-200 lines)
    └── index.ts (exports)
```

**Extraction Priority Order**:
1. **Extract Types First** - Move interfaces/types to diagram-types/
2. **Extract Utilities** - Move helper functions to diagram-utils/
3. **Extract Generators** - Move specific diagram generation logic
4. **Extract Validators** - Move validation logic
5. **Refactor Core Service** - Keep only orchestration logic

**Risk Mitigation**:
- ✅ Test each extraction individually
- ✅ Maintain existing API interfaces
- ✅ Preserve all functionality
- ✅ No changes to calling code

### P0-2: EnhancedUnifiedRequirementsGenerator.ts (2,596 lines → <500 lines)

**IMMEDIATE DECOMPOSITION PLAN**:

#### New File Structure:
```
src/services/compliance/
├── EnhancedUnifiedRequirementsGenerator.ts (< 500 lines) - Core orchestration
├── requirements-generators/
│   ├── FrameworkRequirementsGenerator.ts (400-500 lines)
│   ├── ComplianceRequirementsGenerator.ts (400-500 lines)
│   ├── CustomRequirementsGenerator.ts (400-500 lines)
│   └── index.ts (exports)
├── requirements-validators/
│   ├── RequirementsQualityValidator.ts (300-400 lines)
│   ├── RequirementsComplianceValidator.ts (300-400 lines)
│   └── index.ts (exports)
├── requirements-utils/
│   ├── RequirementsFormatting.ts (200-300 lines)
│   ├── RequirementsMapping.ts (200-300 lines)
│   ├── RequirementsTransforms.ts (200-300 lines)
│   └── index.ts (exports)
└── requirements-types/
    ├── RequirementsInterfaces.ts (100-200 lines)
    ├── RequirementsEnums.ts (100-200 lines)
    └── index.ts (exports)
```

### P0-3: d3-org-chart.js (1,916 lines → Isolate)

**ISOLATION PLAN**:
```
src/lib/external/
├── d3-org-chart/
│   ├── d3-org-chart.js (1,916 lines - unchanged)
│   ├── d3-org-chart-wrapper.ts (< 200 lines - new wrapper)
│   └── index.ts (exports)
```

**Wrapper Service** (d3-org-chart-wrapper.ts):
- Clean TypeScript interface
- Error handling
- Configuration management
- Type safety layer

---

## 🔥 PHASE 2: HIGH IMPACT RESOLUTION (Week 3-6)

### Component Decomposition Templates

#### React Component Standard Pattern:
```typescript
// Original: LargeComponent.tsx (1,500+ lines)
// Target: Split into focused components

// 1. Main Component (< 300 lines)
src/components/domain/MainComponent.tsx

// 2. Sub-components (< 300 lines each)
src/components/domain/components/
├── ComponentHeader.tsx
├── ComponentContent.tsx
├── ComponentSidebar.tsx
├── ComponentFooter.tsx
└── index.ts

// 3. Hooks (< 200 lines each)
src/hooks/domain/
├── useMainComponentLogic.ts
├── useComponentData.ts
├── useComponentState.ts
└── index.ts

// 4. Utils (< 200 lines each)
src/utils/domain/
├── componentHelpers.ts
├── componentValidation.ts
├── componentFormatting.ts
└── index.ts

// 5. Types (< 200 lines)
src/types/domain/
├── componentTypes.ts
├── componentInterfaces.ts
└── index.ts
```

### Top 10 High Priority Component Decompositions:

#### 1. InteractiveMermaidEditor.tsx (1,815 lines)
**Decomposition Plan**:
- `MermaidEditorHeader.tsx` (200-300 lines)
- `MermaidEditorCanvas.tsx` (400-500 lines)
- `MermaidEditorToolbar.tsx` (200-300 lines)
- `MermaidEditorSidebar.tsx` (300-400 lines)
- `MermaidEditorPreview.tsx` (200-300 lines)
- `useMermaidEditor.ts` hook (200-300 lines)
- `mermaidEditorUtils.ts` (200-300 lines)
- Main component (< 300 lines)

#### 2. AssessmentDetail.tsx (1,763 lines)
**Decomposition Plan**:
- `AssessmentDetailHeader.tsx` (200-300 lines)
- `AssessmentDetailContent.tsx` (400-500 lines)
- `AssessmentDetailSidebar.tsx` (300-400 lines)
- `AssessmentDetailFooter.tsx` (200-300 lines)
- `useAssessmentDetail.ts` hook (200-300 lines)
- `assessmentDetailUtils.ts` (200-300 lines)
- Main component (< 300 lines)

#### 3. EnterpriseAREditor.tsx (1,722 lines)
**Decomposition Plan**:
- `AREditorHeader.tsx` (200-300 lines)
- `AREditorCanvas.tsx` (400-500 lines)
- `AREditorToolbar.tsx` (200-300 lines)
- `AREditorProperties.tsx` (300-400 lines)
- `AREditorPreview.tsx` (200-300 lines)
- `useAREditor.ts` hook (200-300 lines)
- `arEditorUtils.ts` (200-300 lines)
- Main component (< 300 lines)

### Service Decomposition Templates

#### Service Standard Pattern:
```typescript
// Original: LargeService.ts (1,500+ lines)
// Target: Focused service modules

// 1. Main Service (< 400 lines)
src/services/domain/MainService.ts

// 2. Sub-services (< 400 lines each)
src/services/domain/services/
├── DataService.ts
├── ValidationService.ts
├── ProcessingService.ts
├── ExportService.ts
└── index.ts

// 3. Utils (< 300 lines each)
src/services/domain/utils/
├── serviceHelpers.ts
├── serviceValidation.ts
├── serviceFormatting.ts
└── index.ts

// 4. Types (< 200 lines)
src/services/domain/types/
├── serviceTypes.ts
├── serviceInterfaces.ts
└── index.ts
```

### Page Decomposition Templates

#### Page Standard Pattern:
```typescript
// Original: LargePage.tsx (1,500+ lines)
// Target: Focused page components

// 1. Main Page (< 300 lines)
src/pages/domain/MainPage.tsx

// 2. Page Sections (< 400 lines each)
src/pages/domain/components/
├── PageHeader.tsx
├── PageContent.tsx
├── PageSidebar.tsx
├── PageFooter.tsx
└── index.ts

// 3. Page Hooks (< 300 lines each)
src/pages/domain/hooks/
├── usePageData.ts
├── usePageState.ts
├── usePageActions.ts
└── index.ts

// 4. Page Utils (< 200 lines each)
src/pages/domain/utils/
├── pageHelpers.ts
├── pageValidation.ts
└── index.ts
```

---

## 📋 EXECUTION TIMELINE

### Week 1-2: Emergency Phase
- **Day 1-2**: Decompose OneShotDiagramService.ts
- **Day 3-4**: Decompose EnhancedUnifiedRequirementsGenerator.ts  
- **Day 5-6**: Isolate d3-org-chart.js
- **Day 7**: Test and validate AI can analyze all code

### Week 3-4: Critical Components
- Decompose top 5 largest components
- Focus on InteractiveMermaidEditor, AssessmentDetail, EnterpriseAREditor
- Extract reusable UI patterns

### Week 5-6: Critical Services
- Decompose top 10 largest services
- Extract business logic patterns
- Consolidate utility functions

### Week 7-8: Medium Priority Files
- Systematic decomposition of 750-1000 line files
- Focus on pages and remaining components
- Extract shared patterns

### Week 9-10: Low Priority Files
- Clean up 500-750 line files
- Optimize extracted components
- Consolidate similar patterns

### Week 11-12: Validation & Documentation
- Complete compliance validation
- Update architecture documentation
- Performance testing and optimization

---

## 🎯 SUCCESS CRITERIA

### Technical Metrics
- ✅ **0 files >500 lines** (Target: 100% compliance)
- ✅ **AI can analyze any file** (No context failures)
- ✅ **No functionality regressions** (100% feature preservation)
- ✅ **No UI/UX changes** (Pixel-perfect preservation)
- ✅ **Improved maintainability** (Better code organization)

### Development Efficiency Gains
- 🚀 **50% faster debugging** (Smaller, focused files)
- 🚀 **75% faster AI assistance** (No context window issues)
- 🚀 **60% faster code reviews** (Better organized code)
- 🚀 **40% faster feature development** (Reusable components)
- 🚀 **90% better developer onboarding** (Clearer architecture)

### Quality Improvements
- 📈 **Increased code reusability** (Extracted components)
- 📈 **Better separation of concerns** (Focused responsibilities)
- 📈 **Improved testability** (Smaller units)
- 📈 **Enhanced maintainability** (Clearer dependencies)
- 📈 **Better documentation** (Focused component docs)

---

## ⚡ IMMEDIATE ACTION ITEMS

### Next 24 Hours:
1. 🚨 **START**: OneShotDiagramService.ts decomposition
2. 🚨 **PREPARE**: EnhancedUnifiedRequirementsGenerator.ts analysis
3. 🚨 **PLAN**: d3-org-chart.js isolation strategy

### Next 48 Hours:
1. ✅ **COMPLETE**: All P0 file decompositions
2. ✅ **VERIFY**: AI can analyze all related code
3. ✅ **TEST**: No functionality regressions

### Next 72 Hours:
1. 📋 **BEGIN**: Top 5 component decompositions
2. 📋 **EXTRACT**: First reusable UI patterns
3. 📋 **DOCUMENT**: Decomposition lessons learned

**CRITICAL**: Every decomposition must preserve exact functionality while achieving <500 line compliance.

---

*Strategic Decomposition Plan Generated: 2025-09-27*
*Target: 100% compliance with 500-line architectural rule*
*Timeline: 12 weeks to complete transformation*