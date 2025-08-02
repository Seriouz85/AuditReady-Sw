#!/bin/bash

#
# Quick cleanup without database connection
# Organizes files and creates proper structure
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="supabase/backups"
CURRENT_BACKUP="$BACKUP_DIR/file_cleanup_$TIMESTAMP"

echo -e "${BLUE}🧹 Quick File Cleanup - No Database Connection${NC}"
echo "=================================================="

# Create backup structure
echo -e "\n${GREEN}📁 Creating backup structure...${NC}"
mkdir -p "$CURRENT_BACKUP/old_migrations"
mkdir -p "$CURRENT_BACKUP/old_backups"

# Backup old migration files
echo -e "\n${GREEN}📦 Backing up migration files...${NC}"
if [ -d "supabase/migrations" ]; then
    cp -r supabase/migrations "$CURRENT_BACKUP/old_migrations/"
    FILE_COUNT=$(ls supabase/migrations/*.sql 2>/dev/null | wc -l)
    echo "✅ Backed up $FILE_COUNT migration files"
else
    echo "⚠️  No migrations directory found"
fi

# Clean old backup directories
echo -e "\n${GREEN}🗑️  Cleaning old backup directories...${NC}"
if [ -d "backups" ]; then
    cp -r backups "$CURRENT_BACKUP/old_backups/"
    rm -rf backups
    echo "✅ Moved and cleaned old backups directory"
fi

# Clean migration files
echo -e "\n${GREEN}🧹 Creating clean migration structure...${NC}"
rm -rf supabase/migrations
mkdir -p supabase/migrations

# Create placeholder files
cat > supabase/schema.sql << 'EOF'
--
-- Clean Database Schema for Audit Readiness Hub
-- This file should be generated from your production database
--
-- To generate:
-- pg_dump --schema-only --no-owner --no-privileges $SUPABASE_DB_URL > supabase/schema.sql
--

-- Placeholder - replace with actual schema dump
SELECT 'Replace this file with your database schema dump' as notice;
EOF

cat > supabase/seed.sql << 'EOF'
--
-- Essential Seed Data for Audit Readiness Hub
-- This file should contain only essential application data
--
-- To generate:
-- pg_dump --data-only --no-owner --no-privileges $SUPABASE_DB_URL > supabase/seed.sql
-- (then clean to remove user data, keep only standards/categories/demo data)
--

-- Placeholder - replace with actual seed data
SELECT 'Replace this file with your essential seed data' as notice;
EOF

cat > supabase/migrations/001_initial_schema.sql << 'EOF'
-- Initial schema setup
-- Loads the clean schema file
\ir ../schema.sql
EOF

cat > supabase/migrations/002_seed_data.sql << 'EOF'
-- Initial seed data
-- Loads essential application data
\ir ../seed.sql
EOF

echo "✅ Created clean 2-file migration structure"

# Create documentation
echo -e "\n${GREEN}📝 Creating documentation...${NC}"

cat > supabase/README.md << 'EOF'
# Database Setup - Audit Readiness Hub

## 🏗️ Clean Schema Approach

This directory uses a clean schema + seed data approach instead of 48+ migration files.

### Files:
- `schema.sql` - Complete database schema (generate from production DB)
- `seed.sql` - Essential seed data (generate from production DB)
- `migrations/` - Simple 2-file migration structure
- `backups/` - Database backups and old files

### 🚀 To Complete Setup:

1. **Generate schema from your production database:**
```bash
export SUPABASE_DB_URL="postgresql://postgres:[password]@[host]:5432/postgres"
pg_dump --schema-only --no-owner --no-privileges $SUPABASE_DB_URL > supabase/schema.sql
```

2. **Generate seed data:**
```bash
pg_dump --data-only --no-owner --no-privileges $SUPABASE_DB_URL > supabase/seed.sql
# Then clean seed.sql to remove user data, keep only essential data
```

3. **Deploy to new environment:**
```bash
psql $NEW_DB_URL -f supabase/schema.sql
psql $NEW_DB_URL -f supabase/seed.sql
```

## ✅ Benefits

- **Simple**: 2 files instead of 48+ migrations
- **Reliable**: No migration chain dependencies
- **Fast**: Quick database setup
- **Clean**: Easy to understand and maintain
EOF

echo "✅ Created documentation"

# Summary
echo ""
echo "=================================================================="
echo -e "${GREEN}🎉 File Cleanup Complete!${NC}"
echo "=================================================================="
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo "   • Migration files: ✅ Backed up and cleaned"
echo "   • Old backups: ✅ Organized and removed"
echo "   • New structure: ✅ Created (2 files instead of 48+)"
echo "   • Documentation: ✅ README.md created"
echo ""
echo -e "${BLUE}📁 Backup Location:${NC}"
echo "   $CURRENT_BACKUP"
echo ""
echo -e "${YELLOW}⚠️  Next Steps:${NC}"
echo "   1. Set your database connection: export SUPABASE_DB_URL='...'"
echo "   2. Run the complete cleanup script: ./scripts/complete-database-cleanup.sh"
echo "   3. Or manually generate schema/seed files as documented"
echo ""
echo -e "${GREEN}✅ Files are now organized and ready for database backup!${NC}"