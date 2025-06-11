# GitHub Pages Deployment

This project deploys to GitHub Pages using GitHub Actions workflow.

## Latest Deployment

- **Date**: 2025-06-11
- **Version**: v1.1.0
- **Features**: 
  - Fixed landing page pricing display (€499, €699, €999)
  - Enhanced admin console with proper standard creation flow
  - Restored GitHub Actions workflow for GitHub Pages
  - Direct deployment from main branch to GitHub Pages

## Configuration

- **Primary Deployment**: GitHub Pages (https://seriouz85.github.io/audit-readiness-hub)
- **Branch**: main/root
- **Build Command**: npm run build:github
- **Output Directory**: dist
- **Workflow**: .github/workflows/deploy-github-pages.yml

## Secondary Deployment

- **Vercel**: Available as backup/preview (uses npm run build:vercel)

---

Last updated: 2025-06-11 15:00 UTC