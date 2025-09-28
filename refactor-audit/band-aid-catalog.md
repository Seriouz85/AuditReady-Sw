# 🩹 Band-Aid Catalog - Technical Debt Audit

## Summary
- **Total Band-Aids Found**: 38
- **Critical (Security/Data)**: TBD
- **Major (Functionality)**: TBD  
- **Minor (Polish)**: TBD

## Band-Aid Classifications

### 🔴 CRITICAL - Security & Data Integrity Issues
These must be fixed FIRST as they pose security or data risks.

### 🟡 MAJOR - Core Functionality Issues
These affect user experience and must be addressed before UI refactoring.

### 🟢 MINOR - Polish & Enhancement Issues
These can be addressed during normal refactoring.

---

## Detailed Band-Aid Inventory

### Authentication & Security
| File | Line | Type | Issue | Root Cause | Fix Strategy |
|------|------|------|-------|------------|--------------|
| src/contexts/AuthContext.tsx | - | TODO | Missing toast notifications | Import path issue | Fix import and enable toasts |
| src/pages/auth/EntraCallbackPage.tsx | - | TODO | Server-side token exchange not implemented | Missing endpoint | Create proper OAuth flow |

### Data Management  
| File | Line | Type | Issue | Root Cause | Fix Strategy |
|------|------|------|-------|------------|--------------|
| src/stores/applicationStore.ts | - | TODO | Hardcoded 'current-user' | Auth context not integrated | Get user from auth store |
| src/stores/applicationStore.ts | - | TODO | Azure sync logic missing | Feature not implemented | Implement or remove feature |

### UI Components
| File | Line | Type | Issue | Root Cause | Fix Strategy |
|------|------|------|-------|------------|--------------|
| src/components/user/BulkUserOperations.tsx | - | TODO | RBAC service import broken | Service refactored/moved | Fix service import path |
| src/components/editor/EnterpriseAREditor.tsx | - | TODO | Background picker not implemented | Feature incomplete | Complete or remove feature |
| src/components/editor/EnterpriseAREditor.tsx | - | TODO | Hardcoded user/org IDs | Auth context not used | Get from auth context |
| src/components/editor/CollaborationInviteModal.tsx | - | TODO | Invitation sending not implemented | Backend not ready | Implement invitation API |

### Reports & Risk Management
| File | Line | Type | Issue | Root Cause | Fix Strategy |
|------|------|------|-------|------------|--------------|
| src/components/reports/ReportBuilder.tsx | - | TODO | Save functionality missing | Feature incomplete | Implement save to database |
| src/components/reports/ReportBuilder.tsx | - | TODO | Export functionality missing | Feature incomplete | Implement export logic |
| src/pages/risk-management/RiskReports.tsx | - | TODO | Export not implemented | Feature incomplete | Add export functionality |
| src/pages/risk-management/ReportRisk.tsx | - | TODO | API call to save risk missing | Backend incomplete | Create API endpoint |

### Settings & Admin
| File | Line | Type | Issue | Root Cause | Fix Strategy |
|------|------|------|-------|------------|--------------|
| src/pages/Settings.tsx | - | TODO | Upgrade dialog not shown | UI incomplete | Implement upgrade modal |
| src/pages/admin/billing/BillingManagement.tsx | - | TODO | Settings save not implemented | Backend incomplete | Implement settings API |

### Organization Management
| File | Line | Type | Issue | Root Cause | Fix Strategy |
|------|------|------|-------|------------|--------------|
| src/hooks/useOrganization.ts | - | TODO | Organization switching not implemented | Complex feature | Implement multi-org support |

---

## Resolution Priority Matrix

### Phase 1: Critical Security & Data (Week 1)
1. Fix authentication token exchange
2. Remove hardcoded user IDs
3. Secure data management patterns

### Phase 2: Core Functionality (Week 2)
1. Fix broken service imports
2. Implement missing save/export functions
3. Complete API integrations

### Phase 3: Feature Completion (Week 3)
1. Complete or remove partial features
2. Implement organization switching
3. Add missing UI components

---

## Validation Checklist
After fixing each band-aid:
- [ ] Original functionality preserved
- [ ] No new errors introduced
- [ ] Demo account still works
- [ ] UI appearance unchanged
- [ ] Tests pass
- [ ] No console errors

---

## Metrics for Board
- **Band-Aids Resolved**: 0/38 (0%)
- **Security Issues Fixed**: 0/2 (0%)
- **User-Facing Issues Fixed**: 0/15 (0%)
- **Code Quality Score**: C (needs improvement)
- **Target**: A+ (0 band-aids, full test coverage)