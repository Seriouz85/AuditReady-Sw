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
