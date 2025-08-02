#!/bin/bash

#
# Generate Clean Database Schema and Seed Data
# Replaces 48+ migration files with clean schema + seed approach
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🏗️  Generating Clean Database Schema${NC}"
echo "This will replace the 48+ migration files with a clean schema approach"
echo ""

# Check if we have database connection details
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_DB_URL environment variable not set${NC}"
    echo "Please set your Supabase database connection string:"
    echo "export SUPABASE_DB_URL='postgresql://postgres:[password]@[host]:5432/postgres'"
    echo ""
    echo "You can find this in your Supabase project settings > Database > Connection string"
    exit 1
fi

# Create backup directory
BACKUP_DIR="supabase/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo -e "${GREEN}📁 Created backup directory: $BACKUP_DIR${NC}"

# Backup current migration files
echo -e "${GREEN}💾 Backing up current migration files...${NC}"
cp -r supabase/migrations "$BACKUP_DIR/"
echo "✅ Migration files backed up to $BACKUP_DIR/migrations/"

# Generate clean schema (structure only)
echo -e "${GREEN}🏗️  Generating schema.sql (database structure)...${NC}"
pg_dump --schema-only --no-owner --no-privileges "$SUPABASE_DB_URL" > supabase/schema.sql
echo "✅ Schema saved to supabase/schema.sql"

# Generate seed data (data only, excluding user data)
echo -e "${GREEN}🌱 Generating seed.sql (essential data)...${NC}"
pg_dump --data-only --no-owner --no-privileges "$SUPABASE_DB_URL" \
    --exclude-table="audit_logs" \
    --exclude-table="user_sessions" \
    --exclude-table="organization_backups" \
    --exclude-table="sensitive_operations_log" \
    > supabase/seed.sql
echo "✅ Seed data saved to supabase/seed.sql"

# Clean up seed file (remove user-specific data)
echo -e "${GREEN}🧹 Cleaning seed data...${NC}"
# This would need custom logic to remove user-specific data while keeping demo data
echo "⚠️  Manual cleanup of seed.sql may be needed to remove sensitive user data"

# Archive old migrations
echo -e "${GREEN}📦 Archiving old migration files...${NC}"
mv supabase/migrations "$BACKUP_DIR/migrations_archived"
mkdir supabase/migrations
echo "✅ Old migrations archived to $BACKUP_DIR/migrations_archived/"

# Create new simple migration structure
cat > supabase/migrations/001_initial_schema.sql << 'EOF'
-- Initial schema setup
-- This replaces 48+ individual migration files
\ir ../schema.sql
EOF

cat > supabase/migrations/002_seed_data.sql << 'EOF'
-- Initial seed data
-- Essential data for application functionality
\ir ../seed.sql
EOF

echo ""
echo -e "${GREEN}✅ Database schema generation complete!${NC}"
echo ""
echo "📋 Summary:"
echo "   • Old migrations backed up to: $BACKUP_DIR/"
echo "   • New clean schema: supabase/schema.sql"
echo "   • Seed data: supabase/seed.sql"  
echo "   • Simple migrations: supabase/migrations/ (2 files instead of 48+)"
echo ""
echo -e "${YELLOW}⚠️  Next steps:${NC}"
echo "   1. Review seed.sql and remove any sensitive user data"
echo "   2. Test the new schema on a development database"
echo "   3. Update deployment scripts to use new approach"
echo "   4. Consider the old migrations archived (safe to remove after testing)"
echo ""
echo -e "${GREEN}🎉 Migration cleanup complete!${NC}"