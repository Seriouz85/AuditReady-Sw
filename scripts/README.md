# Requirements Data Update Scripts

This directory contains scripts for updating and maintaining the requirements data in the Audit Readiness Hub application.

## Available Scripts

### `update-requirements-data.js`

Main script that runs all update operations in the correct sequence. Use this script to perform the full update process.

```
node scripts/update-requirements-data.js
```

### Individual Scripts

These scripts are run automatically by the main script, but can also be executed individually if needed:

#### `update-guidance.js`

Updates the `mockData.ts` file to remove the Purpose section from all requirements' `auditReadyGuidance` fields, keeping only the Implementation section.

```
node scripts/update-guidance.js
```

#### `update-requirement-detail.js`

Updates the `RequirementDetail.tsx` component to remove the code related to parsing and displaying the Purpose section.

```
node scripts/update-requirement-detail.js
```

## Background

Previously, each requirement's `auditReadyGuidance` field contained both a "Purpose" section and an "Implementation" section. The Purpose section often duplicated information already present in the requirement's description field.

These scripts eliminate this redundancy by:

1. Removing the Purpose section from all requirements data
2. Updating the UI to only display and handle the Implementation section
3. Streamlining the guidance display in the requirements interface

After running these scripts, all requirements will only show the Implementation section in the guidance area, resulting in a cleaner and more focused user experience. 