# 🚨 Console Error Debug Guide

## Quick Setup for Testing
Your app is now running at: **http://localhost:3000**

## 🔧 Manual Testing Procedure

### Step 1: Open Browser Developer Tools
1. Open Chrome/Firefox
2. Navigate to `http://localhost:3000`
3. Press `F12` or `Cmd+Option+I` to open DevTools
4. Go to **Console** tab
5. Clear console (`Cmd+K` or `Ctrl+K`)

### Step 2: Test Admin Invitation Flow (Most Critical)
1. Navigate to: `http://localhost:3000/admin/organizations`
2. Look for any console errors on page load
3. Click on any organization card/link
4. Look for `handleInviteUser is not defined` error
5. Try to click "Invite User" button
6. Fill in email and role
7. Click "Preview & Send" button
8. Watch console for any errors

### Step 3: Check for Specific Known Errors

#### ❌ Expected Errors to Look For:
```javascript
// 1. Function Reference Error
ReferenceError: handleInviteUser is not defined

// 2. Audit Logger Error  
Audit logging error: ReferenceError: table_name is not defined

// 3. Email Service Error
Email send error: FunctionsHttpError: Edge Function returned a non-2xx status code
```

## 🛠️ Quick Fixes Applied

### ✅ Fixed: Audit Logger Error
- **File**: `src/services/admin/AuditLogger.ts`
- **Fix**: Changed `table_name` to `resourceType` parameter
- **Status**: Should be resolved

### ✅ Fixed: Email Service Error  
- **File**: `supabase/functions/send-email/index.ts`
- **Fix**: Created missing Edge Function
- **Status**: Should return success in development mode

### ⚠️ CRITICAL: handleInviteUser Error
- **Location**: Unknown - needs investigation
- **Problem**: Old function reference still exists somewhere
- **Action Required**: See debugging steps below

## 🔍 Debug Steps for handleInviteUser Error

### Check Cache Issues:
```bash
# Clear browser cache completely
# Or try incognito/private mode
```

### Find the Problematic Code:
1. When error occurs, click on the error in console
2. It will show exact file and line number
3. Look for any button or component calling `handleInviteUser`

### Most Likely Files to Check:
- `src/pages/admin/organizations/OrganizationDetail.tsx` (already fixed)
- Any organization-related components
- Cached JavaScript bundles

## 📊 Error Analysis Template

Fill this out as you test:

```
=== CONSOLE ERROR REPORT ===
Date: [DATE]
URL: [CURRENT PAGE URL]
Browser: [Chrome/Firefox/Safari]

Error 1:
- Type: [Error/Warning/Log]
- Message: [Full error message]
- File: [File path and line number]
- Status: [Fixed/Needs Fix/Investigating]

Error 2:
- Type: [Error/Warning/Log]  
- Message: [Full error message]
- File: [File path and line number]
- Status: [Fixed/Needs Fix/Investigating]

=== SUMMARY ===
Total Errors: [NUMBER]
Critical: [NUMBER]
Fixed: [NUMBER]
Remaining: [NUMBER]
```

## 🎯 Priority Test Routes

Test these pages in order:
1. **Admin Organizations**: `http://localhost:3000/admin/organizations`
2. **Organization Detail**: Click any organization
3. **User Invitation**: Click "Invite User" button
4. **Email Preview**: Test email preview modal
5. **Dashboard**: `http://localhost:3000/dashboard`
6. **Compliance**: `http://localhost:3000/compliance`

## 🚀 Expected Results After Fixes

After our fixes, you should see:
- ✅ No `table_name is not defined` errors
- ✅ Email service returns success (demo mode)
- ❌ May still see `handleInviteUser is not defined` (needs investigation)

## 📞 Next Steps Based on Findings

### If No Errors Found:
- ✅ All fixes successful!
- Test invitation flow end-to-end
- Verify email preview works

### If handleInviteUser Error Persists:
1. Note exact file/line from console
2. Clear browser cache completely
3. Try incognito mode
4. Report findings for targeted fix

### If New Errors Found:
1. Document using template above
2. Categorize by severity
3. Report for systematic fixing

---

## 🔧 Emergency Commands

```bash
# Restart server if issues
npm run dev

# Clear all caches
rm -rf node_modules/.vite
npm run dev

# Check specific file
grep -r "handleInviteUser" src/
```

**Ready to test! 🚀**