# CLAUDE PROJECT MEMORY - AuditReady Hub
> Auto-loaded context for Claude AI sessions

## 🧠 CRITICAL: Start Every Session With This Command
```
mcp__claude-flow__memory_usage action:"retrieve" key:"project_context" namespace:"audit-ready"
```

## 🔥 Project Quick Context
- **Project**: AuditReady Hub - Enterprise Compliance SaaS
- **Supabase ID**: quoqvqgijsbwqkqotjys  
- **Main File**: src/pages/ComplianceSimplification.tsx
- **GitHub**: https://github.com/Seriouz85/audit-readiness-hub

## ⚡ Recent Session Memory Keys
- `project_context` - General overview
- `critical_patterns` - Never-forget rules
- `latest_fixes_2024_01` - Recent fixes

## 🚨 CRITICAL RULES (NEVER VIOLATE)
1. **NEVER DELETE** from database without explicit "delete [item]" permission
2. **PDF Export** needs clean category names (strip number prefix)
3. **Unified Guidance** requires buildReferencesSection in finalContent
4. **Demo Account**: demo@auditready.com is properly isolated
5. **Test Before Commit**: Always run npm run lint before commits

## 📊 Memory Check Command
To see all stored memories:
```javascript
mcp__claude-flow__memory_usage({
  action: "list",
  namespace: "audit-ready"
})
```

## 🔄 Auto-Update Memory After Session
At end of each session, store summary:
```javascript
mcp__claude-flow__memory_usage({
  action: "store",
  key: "session_" + new Date().toISOString(),
  value: "Session summary here",
  namespace: "audit-ready",
  ttl: 7776000
})
```

## 📁 Key Files & Locations
- Compliance: `src/pages/ComplianceSimplification.tsx`
- Services: `src/services/compliance/`
- Database: Supabase project quoqvqgijsbwqkqotjys
- Memory DB: `.swarm/memory.db`

## 🎯 Current Focus Areas
- PDF Export (100% working)
- Unified Guidance (Show References fixed)
- Compliance Simplification features

---
*Last Updated: 2025-01-17*
*Memory Namespace: audit-ready*