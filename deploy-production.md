# Production Deployment Guide

## Authentication Strategy

**Perfect setup achieved:**
- `demo@auditready.com` → Mock authentication + demo data (always works offline)
- `Payam.Razifar@gmail.com` → Mock authentication for testing (will be real Supabase in production)
- All other accounts → Real Supabase authentication + production data

## Step 1: Deploy to Production Supabase

### Option A: Manual Deployment (Recommended)

1. **Login to Supabase Dashboard**: https://supabase.com/dashboard
2. **Go to your project**: `quoqvqgijsbwqkqotjys`
3. **Navigate to SQL Editor**
4. **Run these migrations in order**:

```sql
-- 1. Run migration 001_initial_schema.sql
-- Copy content from: /Users/payam/audit-readiness-hub/supabase/migrations/001_initial_schema.sql

-- 2. Run migration 002_sample_data.sql  
-- Copy content from: /Users/payam/audit-readiness-hub/supabase/migrations/002_sample_data.sql
```

### Option B: CLI Deployment (if you have Docker)

```bash
# Start Docker Desktop first
docker --version

# Start local Supabase
npx supabase start

# Login to Supabase
npx supabase login

# Link to production project
npx supabase link --project-ref quoqvqgijsbwqkqotjys

# Push migrations
npx supabase db push
```

## Step 2: Create Production Auth User

1. **Go to Supabase Dashboard** → Authentication → Users
2. **Click "Add User"**
3. **Enter details**:
   - Email: `Payam.Razifar@gmail.com`
   - Password: `knejs2015` (change this later)
   - Email Confirmed: ✅ Yes
   - Auto Confirm User: ✅ Yes

## Step 3: Update Environment Variables

Update your `.env` file with production Supabase credentials:
```env
VITE_SUPABASE_URL=https://quoqvqgijsbwqkqotjys.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Remove Mock Authentication (Post-Production)

Once production is working, update `AuthContext.tsx`:

```typescript
// Remove this block after production deployment:
if (email === 'Payam.Razifar@gmail.com' && password === 'knejs2015') {
  // Mock platform admin - REMOVE IN PRODUCTION
}
```

## Step 5: Test Production

1. **Demo User**: `demo@auditready.com` / `Demo123!` (always mock)
2. **Platform Admin**: `Payam.Razifar@gmail.com` / `knejs2015` (real Supabase)
3. **Access Admin Console**: User dropdown → "Platform Admin Console"

## Security Notes

- Change the test password `knejs2015` immediately after testing
- The demo account will always use mock data (perfect for demos)
- Platform admin bypasses all RLS policies (full system access)
- All customer data is isolated by organization_id

## Ready for Production! 🚀

Your authentication strategy is perfect:
- **Demo stays demo** (always available)
- **Production is real** (proper Supabase auth)
- **Clean separation** between test and production data