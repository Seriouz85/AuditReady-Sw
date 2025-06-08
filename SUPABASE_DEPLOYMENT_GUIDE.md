# 🚀 Supabase Deployment Guide for AuditReady Platform

## 📋 Prerequisites
1. **Docker Desktop** installed and running
2. **Supabase CLI** (already installed via npx)
3. **Supabase Account** (free tier available)

## 🛠️ Local Development Setup

### 1. Start Docker Desktop
- Open Docker Desktop application
- Wait for it to fully start (green status indicator)

### 2. Initialize Local Supabase
```bash
# Start local Supabase services
npx supabase start

# This will provide you with:
# - Database URL: postgresql://postgres:postgres@localhost:54322/postgres
# - API URL: http://localhost:54321
# - Studio URL: http://localhost:54323 (Database admin interface)
```

### 3. Apply Database Migrations
```bash
# Apply your custom schema and seed data
npx supabase db reset

# Or push migrations to existing instance
npx supabase db push
```

### 4. Test Platform Admin Access
1. **Start your React app:** `npm run dev`
2. **Create account or login with:** `Payam.Razifar@gmail.com` / `knejs2015`
3. **Access admin console:** Click avatar → "Platform Admin Console" or visit `/admin`

## 🌐 Production Deployment

### 1. Create Supabase Project
```bash
# Login to Supabase
npx supabase login

# Link to new project (creates one if needed)
npx supabase link --project-ref <your-project-ref>

# Or create new project
npx supabase projects create audit-ready-platform
```

### 2. Deploy Database Schema
```bash
# Push local migrations to production
npx supabase db push

# Verify deployment
npx supabase db diff
```

### 3. Environment Variables
Update your `.env` with production values:
```env
# Production Supabase Config
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Test Platform Admin Access
1. **Production URL:** Your deployed app
2. **Login with:** `Payam.Razifar@gmail.com` / `knejs2015`
3. **Verify admin access:** Should see "Platform Administrator" badge

## 🔐 Security Setup

### 1. Create Your User Account
```sql
-- In Supabase SQL Editor, run:
INSERT INTO auth.users (
  id,
  email, 
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'Payam.Razifar@gmail.com',
  crypt('knejs2015', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Payam Razifar"}',
  FALSE,
  'authenticated'
);
```

### 2. Verify Platform Admin Access
The platform admin record is already created in migrations:
```sql
-- Already included in migration:
INSERT INTO platform_administrators (email, name, role) VALUES 
('Payam.Razifar@gmail.com', 'Payam Razifar', 'platform_admin');
```

## 🧪 Testing Checklist

### ✅ Local Development
- [ ] Docker Desktop running
- [ ] `npx supabase start` successful
- [ ] Migrations applied (`npx supabase db reset`)
- [ ] React app running (`npm run dev`)
- [ ] Can login with test credentials
- [ ] Platform admin console accessible
- [ ] Standards data loaded correctly

### ✅ Production Deployment  
- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Environment variables updated
- [ ] User account created
- [ ] Platform admin access working
- [ ] All features functional

## 🎯 Next Steps After Deployment

1. **Update Password:** Change from test password to secure one
2. **Add Team Members:** Add other platform administrators
3. **Configure Billing:** Set up Supabase project billing if needed
4. **Monitor Usage:** Set up alerts for database/API usage
5. **Backup Strategy:** Configure automated backups

## 🚨 Important Security Notes

- **Test credentials are for development only**
- **Change password immediately in production**
- **Use environment variables for all secrets**
- **Enable Row Level Security (RLS) policies are already configured**
- **Platform admin has full system access - use carefully**

## 📞 Support

If you encounter issues:
1. **Check Docker Desktop is running**
2. **Verify Supabase CLI version:** `npx supabase --version`
3. **Check migration files are properly formatted**
4. **Review Supabase logs:** `npx supabase logs`