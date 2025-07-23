#!/bin/bash

#
# Delete old SQL chunk files from project root
# These are temporary files that should be removed
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🗑️  Delete SQL Chunks${NC}"
echo "======================"

# Count SQL chunk files
CHUNK_COUNT=$(find . -maxdepth 1 -name "sql_chunk_*.sql" -type f | wc -l)
PYTHON_SCRIPT=$(find . -maxdepth 1 -name "execute_sql_chunks.py" -type f | wc -l)

echo "Found:"
echo "  • $CHUNK_COUNT SQL chunk files"
echo "  • $PYTHON_SCRIPT Python execution script"

if [ $CHUNK_COUNT -eq 0 ] && [ $PYTHON_SCRIPT -eq 0 ]; then
    echo -e "${GREEN}✅ No SQL chunk files to delete${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}⚠️  These appear to be old temporary files that are safe to delete.${NC}"
echo ""
read -p "Delete all SQL chunk files and execution script? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled. Files not deleted."
    exit 0
fi

# Delete SQL chunk files
if [ $CHUNK_COUNT -gt 0 ]; then
    echo -e "\n${GREEN}🗑️  Deleting SQL chunk files...${NC}"
    rm -f sql_chunk_*.sql
    echo "✅ Deleted $CHUNK_COUNT SQL chunk files"
fi

# Delete Python execution script
if [ $PYTHON_SCRIPT -gt 0 ]; then
    echo -e "\n${GREEN}🗑️  Deleting Python execution script...${NC}"
    rm -f execute_sql_chunks.py
    echo "✅ Deleted Python execution script"
fi

# Check for any other stray SQL files in root (but be careful not to delete important ones)
echo -e "\n${GREEN}🔍 Checking for other stray SQL files in root...${NC}"
OTHER_SQL_FILES=$(find . -maxdepth 1 -name "*.sql" -not -path "./supabase/*" -type f)

if [ -n "$OTHER_SQL_FILES" ]; then
    echo -e "${YELLOW}⚠️  Found other SQL files in root:${NC}"
    echo "$OTHER_SQL_FILES"
    echo ""
    read -p "Delete these as well? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        find . -maxdepth 1 -name "*.sql" -not -path "./supabase/*" -type f -delete
        echo "✅ Deleted other SQL files"
    fi
fi

# Clean up any obvious temporary files
echo -e "\n${GREEN}🧹 Checking for other temporary files...${NC}"
TEMP_COUNT=0

for pattern in "*.tmp" "*.temp" "*~" "*.bak" "*.log" "dump_*"; do
    count=$(find . -maxdepth 1 -name "$pattern" -type f 2>/dev/null | wc -l)
    if [ $count -gt 0 ]; then
        echo "Found $count files matching: $pattern"
        TEMP_COUNT=$((TEMP_COUNT + count))
    fi
done

if [ $TEMP_COUNT -gt 0 ]; then
    echo ""
    read -p "Delete $TEMP_COUNT temporary files? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for pattern in "*.tmp" "*.temp" "*~" "*.bak" "*.log" "dump_*"; do
            find . -maxdepth 1 -name "$pattern" -type f -delete 2>/dev/null || true
        done
        echo "✅ Deleted temporary files"
    fi
fi

echo ""
echo "=================================="
echo -e "${GREEN}🎉 Cleanup Complete!${NC}"
echo "=================================="
echo ""
echo -e "${BLUE}📋 Deleted:${NC}"
echo "   • SQL chunk files: $CHUNK_COUNT files"
echo "   • Python script: $([ $PYTHON_SCRIPT -gt 0 ] && echo "1 file" || echo "None")"
echo "   • Project root is now clean!"
echo ""
echo -e "${GREEN}✅ Ready for production deployment!${NC}"