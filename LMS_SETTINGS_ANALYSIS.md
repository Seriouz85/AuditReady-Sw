# LMS Settings Analysis Report

## Overview
This report analyzes the settings functionality across the LMS (Learning Management System) and the main platform to identify potential duplications and suggest improvements.

## Settings Pages Identified

### 1. Main Platform Settings (`/app/settings`)
Located at: `/src/pages/Settings.tsx`

**Features:**
- User Profile Management
- Organization Settings
- User Management (invite users, manage roles)
- Requirement Assignments
- Security Settings (MFA, password changes)
- Notification Preferences
- Data Export/Import
- Billing Management

### 2. LMS Admin Settings
Located at: `/src/pages/LMS/Admin.tsx`

**Features:**
- Course Management
- User Management (LMS-specific users)
- Settings Tab with:
  - Entra ID (Azure AD) Integration
  - Single Sign-On (SSO) Settings
  - Course Access URLs
  - Email Templates
- Reports Tab

### 3. LMS Entra ID Integration Page
Located at: `/src/pages/LMS/EntraIDIntegration.tsx`

**Features:**
- Microsoft Entra ID Configuration
- User Import/Sync from Azure AD
- Auto-provisioning settings
- SSO configuration
- Sync interval settings

### 4. Risk Management Settings
Located at: `/src/pages/risk-management/RiskSettings.tsx`

**Features:**
- Risk Matrix Configuration
- Risk Levels (Likelihood & Consequence)
- Risk Treatment Strategy

### 5. Admin System Settings
Located at: `/src/pages/admin/system/SystemSettings.tsx`

**Features:**
- Platform-wide system settings
- General Settings (platform name, maintenance mode)
- Security Settings (session timeout, enforce MFA)
- Email Settings (SMTP configuration)
- System Limits
- Compliance Settings (audit log retention)
- Backup Settings

## Identified Duplications

### 1. User Management
- **Main Settings**: Has comprehensive user management with role assignments
- **LMS Admin**: Has its own user management system
- **Recommendation**: Consolidate user management or clearly differentiate between platform users and LMS learners

### 2. SSO/Authentication Settings
- **Main Settings**: Likely has authentication settings
- **LMS Admin**: Has SSO settings in the settings tab
- **LMS Entra ID Integration**: Dedicated page for Azure AD/SSO
- **Admin System Settings**: Has security settings including MFA enforcement
- **Recommendation**: Centralize all authentication settings in one location

### 3. Email Configuration
- **LMS Admin**: Has email templates configuration
- **Admin System Settings**: Has SMTP settings
- **Recommendation**: Combine email settings in one place

## Recommendations

### 1. Create a Unified Settings Architecture

```
/app/settings
├── Profile & Account
├── Organization
├── Security & Authentication
│   ├── Password & MFA
│   ├── SSO Configuration
│   └── Entra ID Integration
├── Notifications & Email
│   ├── Notification Preferences
│   ├── Email Templates
│   └── SMTP Configuration
├── LMS Settings (if user has LMS access)
│   ├── Course Defaults
│   ├── Learner Management
│   └── Training Reports
├── Risk Management (if user has risk module access)
└── Billing & Subscription
```

### 2. Module-Specific Settings
- Keep module-specific settings within their respective modules
- Provide links from main settings to module settings
- Use consistent UI patterns across all settings pages

### 3. Role-Based Settings Access
- Show only relevant settings based on user roles
- Platform admins see system-wide settings
- Organization admins see organization settings
- LMS admins see LMS-specific settings

### 4. Avoid Duplication
- **User Management**: Single source of truth for all users
- **Authentication**: One place for all auth settings
- **Email**: Unified email configuration

### 5. LMS-Specific Settings to Keep Separate
- Course launch options (email invitations, SharePoint integration)
- Training-specific configurations
- Phishing simulation settings
- Quiz and assessment configurations

## Implementation Priority

1. **High Priority**: Consolidate authentication/SSO settings
2. **Medium Priority**: Unify email configuration
3. **Low Priority**: Reorganize settings navigation

## Next Steps

1. Review current user flows for settings access
2. Create mockups for unified settings interface
3. Plan migration strategy for existing settings
4. Update documentation for new settings structure