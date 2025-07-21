#!/usr/bin/env python3
"""
Execute Requirements Restoration 
Updates ONLY titles and descriptions from backup, preserving all other data
"""

import os
import json
import sys

def extract_requirements_from_backup():
    """Extract requirements data from backup file"""
    backup_file = 'Standards/db_cluster-19-07-2025@22-37-30.backup'
    
    with open(backup_file, 'r') as f:
        content = f.read()
    
    # Find requirements_library section
    req_start = content.find('COPY public.requirements_library')
    req_data_start = content.find('FROM stdin;', req_start) + len('FROM stdin;') + 1
    req_data_end = content.find('\\.', req_data_start)
    req_section = content[req_data_start:req_data_end].strip()
    
    # Parse requirements data
    requirements = {}
    lines = [line for line in req_section.split('\n') if line.strip()]
    
    for line in lines:
        parts = line.split('\t')
        if len(parts) >= 5:
            req_id = parts[0]
            standard_id = parts[1] 
            control_id = parts[2]
            title = parts[3]
            description = parts[4]
            
            requirements[req_id] = {
                'standard_id': standard_id,
                'control_id': control_id,
                'title': title,
                'description': description
            }
    
    return requirements

def generate_restoration_sql():
    """Generate SQL statements to restore requirements titles and descriptions"""
    
    print("Extracting requirements from backup...")
    backup_requirements = extract_requirements_from_backup()
    
    # Target standard IDs from backup analysis
    target_standards = {
        'iso27001': '55742f4e-769b-4efe-912c-1371de5e1cd6',  # ISO/IEC 27001 2022
        'iso27002': '8508cfb0-3457-4226-b39a-851be52ef7ea',  # ISO/IEC 27002 2022
        'cis_ig1': 'afe9728d-2084-4b6b-8653-b04e1e92cdff',   # CIS IG1
        'cis_ig2': '05501cbc-c463-4668-ae84-9acb1a4d5332',   # CIS IG2
        'cis_ig3': 'b1d9e82f-b0c3-40e2-89d7-4c51e216214e'    # CIS IG3
    }
    
    sql_statements = []
    sql_statements.append("-- Requirements Restoration SQL")
    sql_statements.append("-- Updates ONLY titles and descriptions from backup")
    sql_statements.append("-- Preserves all other columns and recent changes")
    sql_statements.append("")
    
    # Filter requirements by target standards
    target_requirements = {}
    for req_id, req_data in backup_requirements.items():
        if req_data['standard_id'] in target_standards.values():
            target_requirements[req_id] = req_data
    
    print(f"Found {len(target_requirements)} requirements to restore")
    
    # Group by standard for organized output
    for std_name, std_id in target_standards.items():
        std_requirements = {k: v for k, v in target_requirements.items() if v['standard_id'] == std_id}
        
        if std_requirements:
            sql_statements.append(f"-- {std_name.upper()} Requirements ({len(std_requirements)} total)")
            sql_statements.append("")
            
            for req_id, req_data in std_requirements.items():
                # Escape single quotes in title and description
                title = req_data['title'].replace("'", "''")
                description = req_data['description'].replace("'", "''")
                
                sql_statements.append(f"-- Update {req_data['control_id']}: {title[:60]}...")
                sql_statements.append(f"UPDATE requirements_library SET")
                sql_statements.append(f"  title = '{title}',")
                sql_statements.append(f"  description = '{description}',")
                sql_statements.append(f"  updated_at = NOW()")
                sql_statements.append(f"WHERE id = '{req_id}';")
                sql_statements.append("")
    
    # Add verification queries
    sql_statements.append("-- Verification Queries")
    sql_statements.append("SELECT ")
    sql_statements.append("  sl.name as standard_name,")
    sql_statements.append("  COUNT(*) as requirement_count")
    sql_statements.append("FROM requirements_library rl")
    sql_statements.append("JOIN standards_library sl ON rl.standard_id = sl.id")
    sql_statements.append("WHERE sl.id IN (")
    for std_id in target_standards.values():
        sql_statements.append(f"  '{std_id}',")
    sql_statements[-1] = sql_statements[-1].rstrip(',')  # Remove last comma
    sql_statements.append(")")
    sql_statements.append("GROUP BY sl.name, sl.id")
    sql_statements.append("ORDER BY sl.name;")
    
    return '\\n'.join(sql_statements)

def main():
    print("=== Requirements Restoration Execution ===")
    
    # Generate SQL
    restoration_sql = generate_restoration_sql()
    
    # Write to file
    sql_file = 'requirements_restoration.sql'
    with open(sql_file, 'w') as f:
        f.write(restoration_sql)
    
    print(f"\\nRestoration SQL written to: {sql_file}")
    print(f"SQL file size: {len(restoration_sql)} characters")
    
    print("\\n=== NEXT STEPS ===")
    print("1. Review the generated SQL file")
    print("2. Execute the SQL using Supabase tools")
    print("3. Verify the restoration results")
    print("\\nThe SQL only updates titles and descriptions - all other data is preserved!")

if __name__ == "__main__":
    main()