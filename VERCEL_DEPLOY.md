# Vercel Deployment Trigger

This file is used to trigger Vercel deployments from the main branch.

## Latest Deployment

- **Date**: 2025-06-11
- **Version**: v1.1.0
- **Features**: 
  - Fixed landing page pricing display (€499, €699, €999)
  - Enhanced admin console with proper standard creation flow
  - Removed GitHub Actions workflow conflicts
  - Direct Vercel deployment from main branch

## Configuration

- **Branch**: main/root
- **Build Command**: npm run build:vercel
- **Output Directory**: dist
- **No GitHub Actions**: Direct deployment only

---

Last updated: 2025-06-11 14:49 UTC