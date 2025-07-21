#!/usr/bin/env python3
"""
Execute ALL restoration chunks in sequence
"""

import os
import glob

def create_complete_sql():
    """Combine all SQL chunks into one complete restoration script"""
    
    all_sql = []
    all_sql.append("-- COMPLETE REQUIREMENTS RESTORATION")
    all_sql.append("-- Restoring ALL requirements from July 19th backup")
    all_sql.append("")
    
    chunk_files = sorted(glob.glob("sql_chunk_*.sql"))
    print(f"Found {len(chunk_files)} SQL chunk files")
    
    for chunk_file in chunk_files:
        print(f"Processing {chunk_file}")
        with open(chunk_file, 'r') as f:
            content = f.read()
            # Extract only the UPDATE statements
            lines = content.split('\n')
            in_update = False
            current_update = []
            
            for line in lines:
                if line.strip().startswith('UPDATE requirements_library SET'):
                    in_update = True
                    current_update = [line]
                elif in_update:
                    current_update.append(line)
                    if line.strip().endswith(';'):
                        all_sql.extend(current_update)
                        all_sql.append("")
                        in_update = False
                        current_update = []
    
    return '\n'.join(all_sql)

def main():
    print("=== CREATING COMPLETE RESTORATION SQL ===")
    
    complete_sql = create_complete_sql()
    
    # Write complete SQL to file
    with open('complete_restoration.sql', 'w') as f:
        f.write(complete_sql)
    
    print(f"Complete restoration SQL written to complete_restoration.sql")
    print(f"SQL file size: {len(complete_sql)} characters")
    
    # Count UPDATE statements
    update_count = complete_sql.count('UPDATE requirements_library SET')
    print(f"Total UPDATE statements: {update_count}")

if __name__ == "__main__":
    main()