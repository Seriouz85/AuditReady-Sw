#!/usr/bin/env python3
"""
Generate INSERT statements for missing requirements from backup
"""

def extract_requirements_for_insert():
    """Extract requirements from backup and create INSERT statements"""
    
    with open('Standards/db_cluster-19-07-2025@22-37-30.backup', 'r') as f:
        content = f.read()
    
    # Find requirements section
    req_start = content.find('COPY public.requirements_library')
    req_data_start = content.find('FROM stdin;', req_start) + len('FROM stdin;') + 1
    req_data_end = content.find('\\.', req_data_start)
    req_section = content[req_data_start:req_data_end].strip()
    
    lines = [line for line in req_section.split('\n') if line.strip()]
    
    # Target standards
    iso27001_id = '55742f4e-769b-4efe-912c-1371de5e1cd6'
    iso27002_id = '8508cfb0-3457-4226-b39a-851be52ef7ea'
    
    iso27001_inserts = []
    iso27002_inserts = []
    
    for line in lines:
        parts = line.split('\t')
        if len(parts) >= 18:  # Full requirements_library structure
            req_id = parts[0]
            standard_id = parts[1]
            control_id = parts[2]
            title = parts[3]
            description = parts[4]
            category = parts[5]
            priority = parts[6]
            parent_requirement_id = parts[7] if parts[7] != '\\N' else 'NULL'
            order_index = parts[8]
            created_at = parts[9]
            updated_at = parts[10]
            is_active = parts[11]
            tags = parts[12] if parts[12] != '\\N' else 'NULL'
            official_description = parts[13] if parts[13] != '\\N' else 'NULL'
            implementation_guidance = parts[14] if parts[14] != '\\N' else 'NULL'
            audit_ready_guidance = parts[15] if parts[15] != '\\N' else 'NULL'
            section = parts[16] if parts[16] != '\\N' else 'NULL'
            
            # Clean up values
            title = title.replace("'", "''")
            description = description.replace("'", "''")
            category = category.replace("'", "''")
            
            if audit_ready_guidance != 'NULL':
                audit_ready_guidance = audit_ready_guidance.replace("'", "''")
                audit_ready_guidance = f"'{audit_ready_guidance}'"
            
            if tags != 'NULL':
                tags = f"'{tags}'"
                
            if parent_requirement_id != 'NULL':
                parent_requirement_id = f"'{parent_requirement_id}'"
                
            if section != 'NULL':
                section = f"'{section}'"
            
            insert_sql = f"""INSERT INTO requirements_library (
    id, standard_id, control_id, title, description, category, priority, 
    parent_requirement_id, order_index, created_at, updated_at, is_active, 
    tags, official_description, implementation_guidance, audit_ready_guidance, section
) VALUES (
    '{req_id}', '{standard_id}', '{control_id}', '{title}', '{description}', 
    '{category}', '{priority}', {parent_requirement_id}, {order_index}, 
    '{created_at}', '{updated_at}', {is_active}, {tags}, {official_description}, 
    {implementation_guidance}, {audit_ready_guidance}, {section}
);"""
            
            if standard_id == iso27001_id:
                iso27001_inserts.append((control_id, insert_sql))
            elif standard_id == iso27002_id:
                iso27002_inserts.append((control_id, insert_sql))
    
    return iso27001_inserts, iso27002_inserts

def main():
    print("=== GENERATING INSERT STATEMENTS FROM BACKUP ===")
    
    iso27001_inserts, iso27002_inserts = extract_requirements_for_insert()
    
    print(f"ISO 27001 requirements to insert: {len(iso27001_inserts)}")
    print(f"ISO 27002 requirements to insert: {len(iso27002_inserts)}")
    
    # Write ISO 27001 inserts
    with open('iso27001_inserts.sql', 'w') as f:
        f.write("-- ISO 27001 Requirements INSERT Statements\\n")
        f.write("-- Generated from July 19th backup\\n\\n")
        
        for control_id, insert_sql in sorted(iso27001_inserts, key=lambda x: x[0]):
            f.write(f"-- Insert {control_id}\\n")
            f.write(insert_sql)
            f.write("\\n\\n")
    
    # Write ISO 27002 inserts (first 20 for testing)
    with open('iso27002_inserts_sample.sql', 'w') as f:
        f.write("-- ISO 27002 Requirements INSERT Statements (Sample)\\n")
        f.write("-- Generated from July 19th backup\\n\\n")
        
        for control_id, insert_sql in sorted(iso27002_inserts, key=lambda x: x[0])[:20]:
            f.write(f"-- Insert {control_id}\\n")
            f.write(insert_sql)
            f.write("\\n\\n")
    
    print("SQL files created:")
    print("- iso27001_inserts.sql (24 requirements)")
    print("- iso27002_inserts_sample.sql (20 sample requirements)")

if __name__ == "__main__":
    main()