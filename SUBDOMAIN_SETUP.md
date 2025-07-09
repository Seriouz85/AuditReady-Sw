# Subdomain Setup for docs.auditready.xyz

This document explains how to set up subdomain routing for the documentation site.

## Current Implementation

The application now automatically detects when it's accessed via `docs.auditready.xyz` and serves the documentation page directly.

### Code Changes Made:

1. **Created subdomain router utility** (`src/utils/subdomainRouter.ts`)
   - Detects subdomain from hostname
   - Handles both development and production environments
   - Provides utility functions for subdomain management

2. **Updated App.tsx**
   - Added subdomain detection
   - Routes `docs.auditready.xyz` directly to Documentation component
   - Maintains all providers and error boundaries

3. **Updated UserProfileDropdown.tsx**
   - Changed documentation link to navigate to internal `/documentation` page
   - Removed external link to `https://docs.auditready.com`

## Deployment Requirements

### DNS Configuration
Set up a CNAME record for the subdomain:
```
docs.auditready.xyz -> auditready.xyz
```

### Web Server Configuration

#### For Nginx:
```nginx
server {
    listen 80;
    server_name docs.auditready.xyz;
    root /path/to/your/app;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### For Apache:
```apache
<VirtualHost *:80>
    ServerName docs.auditready.xyz
    DocumentRoot /path/to/your/app
    
    <Directory /path/to/your/app>
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

#### For Vercel:
Add to `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### For Netlify:
Add to `_redirects` file:
```
/*    /index.html   200
```

## Local Development

For local testing, you can simulate the subdomain by:

1. **Add to `/etc/hosts`:**
   ```
   127.0.0.1 docs.localhost
   ```

2. **Access via:** `http://docs.localhost:3000`

Alternatively, the app checks for a `subdomain` URL parameter:
```
http://localhost:3000?subdomain=docs
```

## How It Works

1. When someone visits `docs.auditready.xyz`, the app detects the subdomain
2. Instead of loading the full application, it directly renders the Documentation component
3. All other routes (`docs.auditready.xyz/anything`) will also show the documentation
4. Links within the documentation will work normally
5. The main application remains accessible at `auditready.xyz`

## Benefits

- ✅ Clean, professional documentation URL
- ✅ SEO-friendly subdomain structure
- ✅ No need for separate documentation hosting
- ✅ Maintains all app functionality (themes, etc.)
- ✅ Single codebase deployment
- ✅ Automatic SSL certificate coverage

## Testing Checklist

- [ ] DNS CNAME record configured
- [ ] Web server routing configured
- [ ] SSL certificate covers subdomain
- [ ] Test `docs.auditready.xyz` loads documentation
- [ ] Test internal documentation links work
- [ ] Test "Help & Documentation" from user profile works
- [ ] Test main site `auditready.xyz` still works normally