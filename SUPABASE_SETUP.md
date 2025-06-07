# Supabase Setup Guide for AuditReady

This guide will help you set up Supabase authentication for the AuditReady application.

## Current Status

The application is configured to work with both Supabase (production) and mock authentication (demo mode). By default, it runs in demo mode with the credentials:
- Email: `demo@auditready.com`
- Password: `Demo123!`

## Setting Up Supabase

### 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New project"
3. Fill in the project details:
   - Name: `audit-readiness-hub` (or your preferred name)
   - Database Password: Choose a strong password
   - Region: Select the closest region to your users
4. Click "Create new project"

### 2. Get Your Project Credentials

Once your project is created:

1. Go to Project Settings → API
2. Copy these values:
   - **Project URL**: This is your `VITE_SUPABASE_URL`
   - **Anon/Public Key**: This is your `VITE_SUPABASE_ANON_KEY`

### 3. Configure Environment Variables

Update your `.env` file with your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up Authentication

1. In your Supabase dashboard, go to Authentication → Settings
2. Configure the following:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: Add `http://localhost:5173/*`

### 5. Create Demo User (Optional)

To create the demo user in Supabase:

1. Go to Authentication → Users
2. Click "Invite user"
3. Enter:
   - Email: `demo@auditready.com`
   - Password: `Demo123!`
4. Click "Send invitation"

Alternatively, you can create the user programmatically:

```sql
-- Run this in the SQL Editor in Supabase Dashboard
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
  'demo@auditready.com',
  crypt('Demo123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now()
);
```

## How Authentication Works

The login system has a three-tier fallback mechanism:

1. **Supabase Authentication** (if configured)
   - Primary authentication method
   - Requires valid Supabase project setup
   - Full user management capabilities

2. **Demo Mode Fallback**
   - Activates when demo credentials are used
   - Works even if Supabase fails
   - Perfect for showcasing the application

3. **Mock Authentication** (if Supabase not configured)
   - Automatically used when Supabase credentials are missing
   - Allows full app functionality in demo mode
   - No external dependencies required

## Security Considerations

1. **Never commit real credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Enable Row Level Security (RLS)** in Supabase for production
4. **Configure proper CORS settings** for production deployment

## Troubleshooting

### "Demo mode: Using local authentication" message appears
- This is normal when Supabase is not configured
- The app will work perfectly in demo mode
- To use Supabase, ensure your `.env` file has valid credentials

### Authentication fails with Supabase configured
1. Check your Supabase project is active (not paused)
2. Verify your environment variables are correct
3. Ensure the user exists in Supabase
4. Check browser console for detailed error messages

### CORS errors
- Add your domain to Supabase's allowed redirect URLs
- Ensure your Site URL is correctly configured in Supabase

## Next Steps

1. For production deployment, update the Site URL and Redirect URLs in Supabase
2. Implement proper user roles and permissions
3. Set up Row Level Security policies
4. Configure email templates for password reset, etc.
5. Add social authentication providers if needed