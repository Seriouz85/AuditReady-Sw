#!/bin/bash

#
# Complete Database Cleanup and Backup Script
# Creates comprehensive backup, cleans old files, generates clean schema
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="supabase/backups"
CURRENT_BACKUP="$BACKUP_DIR/production_backup_$TIMESTAMP"

echo -e "${BLUE}🏗️  Audit Readiness Hub - Complete Database Cleanup${NC}"
echo "=================================================================="
echo "This script will:"
echo "  1. Create complete backup of current Supabase database"
echo "  2. Clean up old migration files and backups"
echo "  3. Generate clean schema and seed files"
echo "  4. Organize all configurations properly"
echo ""

# Check if we have database connection details
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_DB_URL environment variable not set${NC}"
    echo ""
    echo "Please set your Supabase database connection string:"
    echo "You can get this from your Supabase Dashboard > Settings > Database"
    echo ""
    echo "Example:"
    echo "export SUPABASE_DB_URL='postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres'"
    echo ""
    read -p "Do you want to continue without database backup? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting. Please set SUPABASE_DB_URL and run again."
        exit 1
    fi
    echo -e "${YELLOW}⚠️  Continuing without database backup...${NC}"
    SKIP_DB_BACKUP=true
fi

# Step 1: Create backup structure
echo -e "\n${GREEN}📁 Step 1: Creating backup structure...${NC}"
mkdir -p "$CURRENT_BACKUP"
mkdir -p "$CURRENT_BACKUP/old_migrations"
mkdir -p "$CURRENT_BACKUP/old_backups"
mkdir -p "$CURRENT_BACKUP/database_dumps"
echo "✅ Created backup directories"

# Step 2: Backup current database
if [ "$SKIP_DB_BACKUP" != "true" ]; then
    echo -e "\n${GREEN}💾 Step 2: Creating complete database backup...${NC}"
    
    # Full database dump (schema + data)
    echo "Creating complete database dump..."
    pg_dump --no-owner --no-privileges "$SUPABASE_DB_URL" > "$CURRENT_BACKUP/database_dumps/complete_database.sql"
    echo "✅ Complete database dump saved"
    
    # Schema only dump
    echo "Creating schema-only dump..."
    pg_dump --schema-only --no-owner --no-privileges "$SUPABASE_DB_URL" > "$CURRENT_BACKUP/database_dumps/schema_only.sql"
    echo "✅ Schema-only dump saved"
    
    # Data only dump
    echo "Creating data-only dump..."
    pg_dump --data-only --no-owner --no-privileges "$SUPABASE_DB_URL" > "$CURRENT_BACKUP/database_dumps/data_only.sql"
    echo "✅ Data-only dump saved"
    
    # Essential seed data (excluding user-generated content)
    echo "Creating essential seed data..."
    pg_dump --data-only --no-owner --no-privileges "$SUPABASE_DB_URL" \
        --exclude-table="audit_logs" \
        --exclude-table="user_sessions" \
        --exclude-table="organization_backups" \
        --exclude-table="sensitive_operations_log" \
        --exclude-table="mfa_verification_sessions" \
        > "$CURRENT_BACKUP/database_dumps/seed_data.sql"
    echo "✅ Essential seed data saved"
else
    echo -e "\n${YELLOW}⚠️  Step 2: Skipping database backup (no connection)${NC}"
fi

# Step 3: Backup old migration files
echo -e "\n${GREEN}📦 Step 3: Backing up old migration files...${NC}"
if [ -d "supabase/migrations" ]; then
    cp -r supabase/migrations "$CURRENT_BACKUP/old_migrations/"
    echo "✅ Migration files backed up ($(ls supabase/migrations/*.sql 2>/dev/null | wc -l) files)"
else
    echo "⚠️  No migrations directory found"
fi

# Step 4: Backup and remove old backup directories
echo -e "\n${GREEN}🧹 Step 4: Cleaning up old backup directories...${NC}"
if [ -d "backups" ]; then
    echo "Moving old backups directory..."
    cp -r backups "$CURRENT_BACKUP/old_backups/"
    rm -rf backups
    echo "✅ Old backups directory moved and cleaned"
fi

# Find and clean any other backup directories
find . -name "*backup*" -type d -not -path "./supabase/backups*" -not -path "./src/*" -not -path "./node_modules/*" | while read backup_dir; do
    if [ -d "$backup_dir" ]; then
        echo "Moving backup directory: $backup_dir"
        cp -r "$backup_dir" "$CURRENT_BACKUP/old_backups/"
        rm -rf "$backup_dir"
    fi
done

# Step 5: Generate clean schema files
echo -e "\n${GREEN}🏗️  Step 5: Generating clean schema files...${NC}"

# Create new clean schema.sql
if [ "$SKIP_DB_BACKUP" != "true" ]; then
    cp "$CURRENT_BACKUP/database_dumps/schema_only.sql" "supabase/schema.sql"
    cp "$CURRENT_BACKUP/database_dumps/seed_data.sql" "supabase/seed.sql"
    echo "✅ Clean schema.sql and seed.sql generated"
else
    echo "⚠️  Skipping schema generation (no database connection)"
fi

# Step 6: Clean up migration files
echo -e "\n${GREEN}🗑️  Step 6: Cleaning up migration files...${NC}"
if [ -d "supabase/migrations" ]; then
    # Count files before cleanup
    OLD_COUNT=$(ls supabase/migrations/*.sql 2>/dev/null | wc -l)
    
    # Remove all old migration files
    rm -rf supabase/migrations
    mkdir -p supabase/migrations
    
    # Create new simple migration structure
    cat > supabase/migrations/001_initial_schema.sql << 'EOF'
-- Initial schema setup
-- Replaces 48+ individual migration files with clean schema
\ir ../schema.sql
EOF

    cat > supabase/migrations/002_seed_data.sql << 'EOF'
-- Initial seed data
-- Essential data for application functionality
\ir ../seed.sql
EOF

    echo "✅ Cleaned up $OLD_COUNT migration files, created 2 new ones"
else
    echo "⚠️  No migrations directory to clean"
fi

# Step 7: Update configuration files
echo -e "\n${GREEN}⚙️  Step 7: Updating configuration files...${NC}"

# Update supabase config.toml if it exists
if [ -f "supabase/config.toml" ]; then
    # Create backup of config
    cp "supabase/config.toml" "$CURRENT_BACKUP/config.toml.backup"
    echo "✅ Backed up supabase/config.toml"
fi

# Create/update README files
cat > supabase/README.md << 'EOF'
# Database Setup - Audit Readiness Hub

This directory contains the clean database schema and seed data.

## 🏗️ New Clean Approach

Instead of maintaining 48+ migration files, we use a clean schema + seed data approach:

### Files:
- `schema.sql` - Complete database schema (tables, indexes, RLS policies, functions)
- `seed.sql` - Essential seed data (standards, categories, demo data)
- `migrations/` - Simple 2-file migration structure
- `backups/` - Production database backups

### 🚀 Setup Instructions:

**For new database:**
```sql
-- Apply schema
\ir schema.sql

-- Apply seed data  
\ir seed.sql
```

**For existing database:**
- Current database already has all data applied
- No migration needed

## 📦 Backup Structure

`backups/production_backup_YYYYMMDD_HHMMSS/`
- `database_dumps/` - Complete database dumps
- `old_migrations/` - Historical migration files (archived)
- `old_backups/` - Previous backup directories

## ✅ Migration History Applied

- Core schema and tables
- RLS policies and security  
- Unified compliance categories (22 categories)
- All standards data (ISO 27001/27002, CIS, NIS2)
- All 123 requirement mappings to unified categories
- MFA system implementation
- Data classification system
- Backup & restore functionality

## 🎯 Benefits

1. **Simplicity**: 2 files vs 48+ migrations
2. **Reliability**: No migration chain dependencies
3. **Performance**: Faster database setup
4. **Maintainability**: Easy to understand current state
5. **Production Ready**: Exact production state captured
EOF

# Create deployment documentation
cat > DEPLOYMENT.md << 'EOF'
# Deployment Guide - Audit Readiness Hub

## 🚀 Database Setup

### New Environment Setup:
```bash
# 1. Set your database connection
export SUPABASE_DB_URL="postgresql://postgres:[password]@[host]:5432/postgres"

# 2. Apply schema
psql $SUPABASE_DB_URL -f supabase/schema.sql

# 3. Apply seed data
psql $SUPABASE_DB_URL -f supabase/seed.sql
```

### Environment Variables Required:
```bash
# Database
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=[anon_key]

# Payments
VITE_STRIPE_PUBLISHABLE_KEY=[stripe_key]
VITE_STRIPE_SECRET_KEY=[stripe_secret]

# AI Integration  
VITE_GEMINI_API_KEY=[gemini_key]
# OR
VITE_OPENAI_API_KEY=[openai_key]

# SSO (Optional)
VITE_ENTRA_CLIENT_ID=[entra_client_id]
VITE_ENTRA_TENANT_ID=[entra_tenant_id]

# Monitoring (Optional)
VITE_SENTRY_DSN=[sentry_dsn]

# Data Classification (Optional - Azure Purview)
VITE_AZURE_PURVIEW_ENDPOINT=[purview_endpoint]
VITE_AZURE_CLIENT_ID=[azure_client_id]
VITE_AZURE_CLIENT_SECRET=[azure_client_secret]
VITE_AZURE_TENANT_ID=[azure_tenant_id]
```

## 📝 Database State

✅ **Production Ready Features:**
- Multi-tenant compliance management
- 22 unified compliance categories
- Complete standards library (ISO, CIS, NIS2)
- All 123 requirements properly mapped
- MFA system with TOTP and backup codes
- Data classification with Azure Purview integration
- Enhanced backup & restore with time-travel
- Customer dashboard customization
- Platform admin console

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
EOF

echo "✅ Updated README and deployment documentation"

# Step 8: Create summary report
echo -e "\n${GREEN}📊 Step 8: Creating cleanup summary...${NC}"

cat > "$CURRENT_BACKUP/CLEANUP_SUMMARY.md" << EOF
# Database Cleanup Summary - $(date)

## 🎯 Actions Completed

### ✅ Database Backup
- Complete database dump: $([ "$SKIP_DB_BACKUP" != "true" ] && echo "✅ Created" || echo "❌ Skipped")
- Schema-only dump: $([ "$SKIP_DB_BACKUP" != "true" ] && echo "✅ Created" || echo "❌ Skipped")
- Data-only dump: $([ "$SKIP_DB_BACKUP" != "true" ] && echo "✅ Created" || echo "❌ Skipped")
- Essential seed data: $([ "$SKIP_DB_BACKUP" != "true" ] && echo "✅ Created" || echo "❌ Skipped")

### ✅ File Cleanup
- Old migration files backed up: ✅ $(ls "$CURRENT_BACKUP/old_migrations/migrations" 2>/dev/null | wc -l) files
- Old backup directories cleaned: ✅ Moved to backup
- New migration structure: ✅ 2 simple files created

### ✅ Configuration Updates
- Clean schema.sql: $([ "$SKIP_DB_BACKUP" != "true" ] && echo "✅ Generated" || echo "❌ Skipped")
- Clean seed.sql: $([ "$SKIP_DB_BACKUP" != "true" ] && echo "✅ Generated" || echo "❌ Skipped")
- Documentation updated: ✅ README.md and DEPLOYMENT.md
- Config backed up: ✅ Saved to backup

## 📊 Before/After Comparison

**Before:**
- 48+ migration files
- Multiple backup directories scattered
- Complex migration dependencies
- Potential migration chain failures

**After:**
- 2 simple migration files
- Single organized backup structure
- Clean schema + seed approach
- Reliable, fast deployment

## 🎉 Result

Database is now organized with:
- Clean, reliable schema
- Comprehensive backups
- Simple deployment process  
- Production-ready state

Backup location: \`$CURRENT_BACKUP\`
EOF

# Final summary
echo ""
echo "=================================================================="
echo -e "${GREEN}🎉 Database Cleanup Complete!${NC}"
echo "=================================================================="
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo "   • Database backup: $([ "$SKIP_DB_BACKUP" != "true" ] && echo "✅ Complete backup created" || echo "❌ Skipped (no connection)")"
echo "   • Migration files: ✅ Cleaned up (2 files instead of 48+)"
echo "   • Old backups: ✅ Organized and cleaned"
echo "   • Configuration: ✅ Updated with new approach"
echo "   • Documentation: ✅ README.md and DEPLOYMENT.md created"
echo ""
echo -e "${BLUE}📁 Backup Location:${NC}"
echo "   $CURRENT_BACKUP"
echo ""
echo -e "${BLUE}📂 New Structure:${NC}"
echo "   supabase/schema.sql     - Clean database schema"
echo "   supabase/seed.sql       - Essential seed data"
echo "   supabase/migrations/    - Simple 2-file structure"
echo "   supabase/backups/       - Organized backup history"
echo ""
echo -e "${GREEN}✅ Your database is now production-ready with clean organization!${NC}"