#!/usr/bin/env python3
"""
Requirements Restoration Script
Extracts requirements from backup file and restores them to database
"""

import re
import sys

def extract_backup_data():
    """Extract requirements from backup file"""
    backup_file = 'Standards/db_cluster-19-07-2025@22-37-30.backup'
    
    with open(backup_file, 'r') as f:
        content = f.read()
    
    # Find standards mapping first
    standards_start = content.find('COPY public.standards_library')
    if standards_start == -1:
        print("ERROR: Could not find standards_library section")
        return None, None
        
    standards_data_start = content.find('FROM stdin;', standards_start) + len('FROM stdin;') + 1
    standards_data_end = content.find('\\.', standards_data_start)
    standards_section = content[standards_data_start:standards_data_end].strip()
    
    # Parse standards
    standard_map = {}
    for line in standards_section.split('\n'):
        if line.strip():
            parts = line.split('\t')
            if len(parts) >= 3:
                std_id = parts[0]
                std_name = parts[1] 
                std_version = parts[2] if len(parts) > 2 else ''
                standard_map[std_id] = f"{std_name} {std_version}".strip()
    
    print(f"Found {len(standard_map)} standards:")
    for std_id, name in standard_map.items():
        print(f"  {std_id}: {name}")
    
    # Find requirements_library section
    req_start = content.find('COPY public.requirements_library')
    if req_start == -1:
        print("ERROR: Could not find requirements_library section")
        return None, None
        
    req_data_start = content.find('FROM stdin;', req_start) + len('FROM stdin;') + 1
    req_data_end = content.find('\\.', req_data_start)
    req_section = content[req_data_start:req_data_end].strip()
    
    # Parse requirements
    requirements_by_standard = {}
    lines = [line for line in req_section.split('\n') if line.strip()]
    
    for line in lines:
        parts = line.split('\t')
        if len(parts) >= 5:
            req_id = parts[0]
            standard_id = parts[1] 
            control_id = parts[2]
            title = parts[3]
            description = parts[4]
            
            if standard_id not in requirements_by_standard:
                requirements_by_standard[standard_id] = []
            requirements_by_standard[standard_id].append({
                'id': req_id,
                'control_id': control_id,
                'title': title,
                'description': description,
                'full_line': line
            })
    
    return standard_map, requirements_by_standard

def find_target_standards(standard_map, requirements_by_standard):
    """Find ISO 27001, ISO 27002, and CIS Controls standards"""
    iso27001_id = None
    iso27002_id = None
    cis_ig1_id = None
    cis_ig2_id = None
    cis_ig3_id = None
    
    for std_id, name in standard_map.items():
        name_lower = name.lower()
        if 'iso' in name_lower and '27001' in name_lower:
            iso27001_id = std_id
        elif 'iso' in name_lower and '27002' in name_lower:
            iso27002_id = std_id
        elif 'cis' in name_lower and 'ig1' in name_lower:
            cis_ig1_id = std_id
        elif 'cis' in name_lower and 'ig2' in name_lower:
            cis_ig2_id = std_id
        elif 'cis' in name_lower and 'ig3' in name_lower:
            cis_ig3_id = std_id
    
    print("\nTarget standards identified:")
    print(f"ISO 27001: {iso27001_id} - {standard_map.get(iso27001_id, 'NOT FOUND')}")
    print(f"ISO 27002: {iso27002_id} - {standard_map.get(iso27002_id, 'NOT FOUND')}")
    print(f"CIS IG1: {cis_ig1_id} - {standard_map.get(cis_ig1_id, 'NOT FOUND')}")
    print(f"CIS IG2: {cis_ig2_id} - {standard_map.get(cis_ig2_id, 'NOT FOUND')}")  
    print(f"CIS IG3: {cis_ig3_id} - {standard_map.get(cis_ig3_id, 'NOT FOUND')}")
    
    # Show requirements counts
    for std_id in [iso27001_id, iso27002_id, cis_ig1_id, cis_ig2_id, cis_ig3_id]:
        if std_id and std_id in requirements_by_standard:
            reqs = requirements_by_standard[std_id]
            print(f"\n{standard_map[std_id]} has {len(reqs)} requirements:")
            
            # Show sample requirements
            for i, req in enumerate(reqs[:5]):
                print(f"  {req['control_id']}: {req['title'][:70]}...")
            if len(reqs) > 5:
                print(f"  ... and {len(reqs)-5} more")
    
    return {
        'iso27001_id': iso27001_id,
        'iso27002_id': iso27002_id, 
        'cis_ig1_id': cis_ig1_id,
        'cis_ig2_id': cis_ig2_id,
        'cis_ig3_id': cis_ig3_id
    }

def main():
    print("=== Requirements Restoration Analysis ===")
    
    standard_map, requirements_by_standard = extract_backup_data()
    if not standard_map or not requirements_by_standard:
        sys.exit(1)
    
    target_standards = find_target_standards(standard_map, requirements_by_standard)
    
    print(f"\n=== SUMMARY ===")
    print(f"Total standards: {len(standard_map)}")
    print(f"Total requirements: {sum(len(reqs) for reqs in requirements_by_standard.values())}")
    
    # Check if we have the expected counts
    iso27002_reqs = requirements_by_standard.get(target_standards['iso27002_id'], [])
    iso27001_reqs = requirements_by_standard.get(target_standards['iso27001_id'], [])
    
    print(f"\nISO 27002 requirements: {len(iso27002_reqs)} (expected: 93)")
    print(f"ISO 27001 requirements: {len(iso27001_reqs)} (expected: 4.1-10.2 format)")
    
    if len(iso27002_reqs) == 93:
        print("✓ ISO 27002 count matches expected!")
    else:
        print("✗ ISO 27002 count does not match expected")
    
    # Check ISO 27001 format
    iso27001_format_check = []
    for req in iso27001_reqs:
        control_id = req['control_id']
        if re.match(r'^[4-9]\.[0-9]+$', control_id):
            iso27001_format_check.append(control_id)
    
    print(f"ISO 27001 requirements with correct format (4.1-10.2): {len(iso27001_format_check)}")
    
    print("\nBackup analysis complete. Ready to proceed with restoration.")

if __name__ == "__main__":
    main()