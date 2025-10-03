# 🔒 SECURITY ALERTS REPORT - 2025-10-03

**Status**: ⚠️ 7 SECURITY ISSUES FOUND
**Severity**: 3 GitHub alerts + 4 Supabase advisors
**Priority**: HIGH - Requires immediate attention

---

## 🚨 GITHUB DEPENDABOT ALERTS (3 OPEN)

### Alert #4: undici - DoS Attack (LOW SEVERITY)
**Package**: `undici`
**Severity**: LOW
**Status**: OPEN
**Issue**: Denial of Service attack via bad certificate data
**Vulnerable Version**: < 5.29.0
**Fix Available**: Upgrade to `undici@5.29.0` or higher

**Remediation**:
```bash
npm update undici
```

---

### Alert #3: esbuild - Development Server Vulnerability (MEDIUM SEVERITY) ⚠️
**Package**: `esbuild`
**Severity**: MEDIUM
**Status**: OPEN
**Issue**: Any website can send requests to development server and read response
**Vulnerable Version**: <= 0.24.2
**Fix Available**: Upgrade to `esbuild@0.25.0` or higher

**Impact**: Development server only - not a production risk
**Remediation**:
```bash
npm update esbuild
```

---

### Alert #2: undici - Insufficiently Random Values (MEDIUM SEVERITY) ⚠️
**Package**: `undici`
**Severity**: MEDIUM
**Status**: OPEN
**Issue**: Use of Insufficiently Random Values
**Vulnerable Version**: >= 4.5.0, < 5.28.5
**Fix Available**: Upgrade to `undici@5.28.5` or higher

**Remediation**:
```bash
npm update undici
```

**Note**: This is likely the SAME undici package as Alert #4 - updating to 5.29.0 will fix BOTH alerts.

---

## 🔐 SUPABASE SECURITY ADVISORS (4 ISSUES)

### Issue #1: RLS Disabled on `demo_accounts` Table (ERROR) ❌
**Severity**: ERROR
**Category**: SECURITY
**Facing**: EXTERNAL
**Issue**: Row Level Security (RLS) not enabled on public table

**Details**:
- Table: `public.demo_accounts`
- Risk: Any authenticated user can read/write demo account data
- Exposure: Public schema exposed to PostgREST API

**Remediation**:
```sql
-- Enable RLS on demo_accounts table
ALTER TABLE public.demo_accounts ENABLE ROW LEVEL SECURITY;

-- Add policy to restrict access to platform admins only
CREATE POLICY "Platform admins can manage demo accounts"
ON public.demo_accounts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.platform_administrators
    WHERE user_id = auth.uid()
  )
);
```

**Documentation**: https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public

---

### Issue #2: RLS Disabled on `support_tickets` Table (ERROR) ❌
**Severity**: ERROR
**Category**: SECURITY
**Facing**: EXTERNAL
**Issue**: Row Level Security (RLS) not enabled on public table

**Details**:
- Table: `public.support_tickets`
- Risk: Users can read other users' support tickets
- Exposure: Public schema exposed to PostgREST API

**Remediation**:
```sql
-- Enable RLS on support_tickets table
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Add policy for users to see their own tickets
CREATE POLICY "Users can view their own support tickets"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Add policy for platform admins to see all tickets
CREATE POLICY "Platform admins can manage all support tickets"
ON public.support_tickets
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.platform_administrators
    WHERE user_id = auth.uid()
  )
);

-- Add policy for users to create tickets
CREATE POLICY "Users can create their own support tickets"
ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
```

**Documentation**: https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public

---

### Issue #3: RLS Disabled on `user_activity_log` Table (ERROR) ❌
**Severity**: ERROR
**Category**: SECURITY
**Facing**: EXTERNAL
**Issue**: Row Level Security (RLS) not enabled on public table

**Details**:
- Table: `public.user_activity_log`
- Risk: Users can read activity logs of other users
- Exposure: Public schema exposed to PostgREST API

**Remediation**:
```sql
-- Enable RLS on user_activity_log table
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- Add policy for platform admins only
CREATE POLICY "Only platform admins can view activity logs"
ON public.user_activity_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.platform_administrators
    WHERE user_id = auth.uid()
  )
);

-- Add policy for system to insert logs
CREATE POLICY "System can insert activity logs"
ON public.user_activity_log
FOR INSERT
TO authenticated
WITH CHECK (true);
```

**Documentation**: https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public

---

### Issue #4: Leaked Password Protection Disabled (WARNING) ⚠️
**Severity**: WARN
**Category**: SECURITY
**Facing**: EXTERNAL
**Issue**: Supabase Auth not checking against compromised passwords

**Details**:
- Feature: HaveIBeenPwned.org integration
- Impact: Users can use passwords that have been leaked in data breaches
- Current State: DISABLED

**Remediation**:
Enable in Supabase Dashboard:
1. Go to Supabase Dashboard → Authentication → Policies
2. Enable "Leaked Password Protection"
3. Configure to check against HaveIBeenPwned.org database

**Documentation**: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

---

## 📊 SECURITY SUMMARY

### By Severity:
- **ERROR (Critical)**: 3 issues (RLS disabled on public tables)
- **MEDIUM**: 2 issues (undici, esbuild)
- **LOW**: 1 issue (undici DoS)
- **WARN**: 1 issue (leaked password protection)

### By Category:
- **Database Security (RLS)**: 3 issues
- **Authentication**: 1 issue
- **Dependencies**: 3 issues

### Effort Required:
- **Quick Wins** (< 5 min):
  1. Update npm packages: `npm update undici esbuild`
  2. Enable leaked password protection (Supabase Dashboard)

- **Medium Effort** (15-30 min):
  3. Add RLS policies for `demo_accounts`
  4. Add RLS policies for `support_tickets`
  5. Add RLS policies for `user_activity_log`

---

## ✅ REMEDIATION PLAN

### Step 1: Update Dependencies (IMMEDIATE)
```bash
# Update vulnerable packages
npm update undici esbuild

# Verify updates
npm list undici esbuild

# Rebuild to ensure changes take effect
npm run build

# Expected results:
# - undici@5.29.0 or higher (fixes alerts #2 and #4)
# - esbuild@0.25.0 or higher (fixes alert #3)
```

**Time**: 2 minutes
**Risk**: Low (dependency updates)
**Impact**: Fixes 3 GitHub security alerts

---

### Step 2: Enable RLS on Missing Tables (HIGH PRIORITY)

Create migration file: `supabase/migrations/YYYYMMDD_enable_rls_security_advisors.sql`

```sql
-- Migration: Enable RLS on tables missing row-level security
-- Date: 2025-10-03
-- Fixes: Supabase security advisor alerts

-- 1. Enable RLS on demo_accounts table
ALTER TABLE IF EXISTS public.demo_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Platform admins can manage demo accounts" ON public.demo_accounts;
CREATE POLICY "Platform admins can manage demo accounts"
ON public.demo_accounts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.platform_administrators
    WHERE user_id = auth.uid()
  )
);

-- 2. Enable RLS on support_tickets table
ALTER TABLE IF EXISTS public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own support tickets" ON public.support_tickets;
CREATE POLICY "Users can view their own support tickets"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Platform admins can manage all support tickets" ON public.support_tickets;
CREATE POLICY "Platform admins can manage all support tickets"
ON public.support_tickets
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.platform_administrators
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create their own support tickets" ON public.support_tickets;
CREATE POLICY "Users can create their own support tickets"
ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 3. Enable RLS on user_activity_log table
ALTER TABLE IF EXISTS public.user_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only platform admins can view activity logs" ON public.user_activity_log;
CREATE POLICY "Only platform admins can view activity logs"
ON public.user_activity_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.platform_administrators
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "System can insert activity logs" ON public.user_activity_log;
CREATE POLICY "System can insert activity logs"
ON public.user_activity_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Verification: Check RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('demo_accounts', 'support_tickets', 'user_activity_log');
```

**Time**: 15 minutes (including testing)
**Risk**: Medium (verify admin access still works)
**Impact**: Fixes 3 critical Supabase security errors

---

### Step 3: Enable Leaked Password Protection (RECOMMENDED)

**Manual Steps** (Supabase Dashboard):
1. Navigate to: https://supabase.com/dashboard/project/quoqvqgijsbwqkqotjys/auth/policies
2. Find "Password Policies" section
3. Enable "Leaked Password Protection"
4. Click "Save"

**Time**: 1 minute
**Risk**: None (only affects new passwords)
**Impact**: Prevents users from using compromised passwords

---

## 🔍 VERIFICATION CHECKLIST

After remediation:

### GitHub Alerts:
- [ ] Run `npm update undici esbuild`
- [ ] Run `npm audit` - should show 0 high/critical vulnerabilities
- [ ] Check GitHub Security tab - alerts should be auto-closed
- [ ] Verify build succeeds: `npm run build`

### Supabase Advisors:
- [ ] Run migration: `npx supabase db push`
- [ ] Verify RLS enabled: Check query in migration
- [ ] Test demo account access (should still work for platform admins)
- [ ] Test support tickets (users see only their own)
- [ ] Test activity log (only platform admins can view)
- [ ] Enable leaked password protection in dashboard
- [ ] Re-check advisors: Should show 0 security errors

---

## 📈 EXPECTED RESULTS

**Before**:
- 3 GitHub alerts (2 medium, 1 low)
- 4 Supabase advisors (3 errors, 1 warning)
- **Total**: 7 security issues

**After**:
- 0 GitHub alerts
- 0 Supabase security errors
- 0 Supabase warnings
- **Total**: 0 security issues ✅

---

## ⚠️ IMPORTANT NOTES

1. **Demo Account Access**: After enabling RLS on `demo_accounts`, verify that:
   - Platform admins can still manage demo accounts
   - Demo login still works
   - No existing functionality breaks

2. **Support Tickets**: After enabling RLS on `support_tickets`, verify that:
   - Users can create tickets
   - Users can only see their own tickets
   - Platform admins can see all tickets

3. **Activity Logs**: After enabling RLS on `user_activity_log`, verify that:
   - System can still insert logs
   - Only platform admins can view logs
   - Regular users cannot access activity logs

4. **Dependencies**: The `esbuild` vulnerability only affects development server - not a production risk

---

**Created**: 2025-10-03
**Priority**: HIGH
**Estimated Time**: 30 minutes total
**Status**: PENDING REMEDIATION
