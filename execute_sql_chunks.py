#!/usr/bin/env python3
"""
Execute SQL restoration in manageable chunks
"""

import re
import time

def split_sql_into_chunks(sql_content, chunk_size=10):
    """Split SQL into chunks of UPDATE statements"""
    updates = re.findall(r'-- Update.*?WHERE id = \'[^\']+\';', sql_content, re.DOTALL)
    
    chunks = []
    for i in range(0, len(updates), chunk_size):
        chunk = updates[i:i+chunk_size]
        chunks.append('\n\n'.join(chunk))
    
    return chunks

def main():
    # Read the SQL file
    with open('requirements_restoration.sql', 'r') as f:
        sql_content = f.read()
    
    # Split into chunks
    chunks = split_sql_into_chunks(sql_content, 8)  # 8 updates per chunk
    
    print(f"Split SQL into {len(chunks)} chunks")
    
    # Write chunks to separate files
    for i, chunk in enumerate(chunks):
        chunk_file = f'sql_chunk_{i+1:02d}.sql'
        with open(chunk_file, 'w') as f:
            f.write(chunk)
        print(f"Created {chunk_file} ({len(chunk.split('UPDATE'))-1} updates)")
    
    print("\nSQL chunks created. Execute them one by one with MCP Supabase tools.")

if __name__ == "__main__":
    main()