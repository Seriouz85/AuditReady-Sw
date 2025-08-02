-- Update CIS Controls with official descriptions from source Excel/JSON
-- This migration adds the official_description field for all CIS Controls
-- Mapping from simplified control_id format (e.g., "1.1") to full format (e.g., "1.1.1")

-- Control 1.1 -> 1.1.1
UPDATE requirements_library 
SET official_description = 'Establish and maintain an accurate, detailed, and up-to-date inventory of all enterprise assets with the potential to store or process data, to include: end-user devices (including portable and mobile), network devices, non-computing/IoT devices, and servers. Ensure the inventory records the network address (if static), hardware address, machine name, enterprise asset owner, department for each asset, and whether the asset has been approved to connect to the network. For mobile end-user devices, MDM type tools can support this process, where appropriate. This inventory includes assets connected to the infrastructure physically, virtually, remotely, and those within cloud environments. Additionally, it includes assets that are regularly connected to the enterprise's network infrastructure, even if they are not under control of the enterprise. Review and update the inventory of all enterprise assets bi-annually, or more frequently.',
    updated_at = NOW()
WHERE control_id = '1.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 1.2 -> 1.1.2
UPDATE requirements_library 
SET official_description = 'Ensure that a process exists to address unauthorized assets on a weekly basis. The enterprise may choose to remove the asset from the network, deny the asset from connecting remotely to the network, or quarantine the asset.',
    updated_at = NOW()
WHERE control_id = '1.2' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 1.3 -> 1.1.3
UPDATE requirements_library 
SET official_description = 'Utilize an active discovery tool to identify assets connected to the enterprise's network. Configure the active discovery tool to execute daily, or more frequently.',
    updated_at = NOW()
WHERE control_id = '1.3' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 1.4 -> 1.1.4
UPDATE requirements_library 
SET official_description = 'Use DHCP logging on all DHCP servers or Internet Protocol (IP) address management tools to update the enterprise's asset inventory. Review and use logs to update the enterprise's asset inventory weekly, or more frequently.',
    updated_at = NOW()
WHERE control_id = '1.4' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 1.5 -> 1.1.5
UPDATE requirements_library 
SET official_description = 'Use a passive discovery tool to identify assets connected to the enterprise's network. Review and use scans to update the enterprise's asset inventory at least weekly, or more frequently.',
    updated_at = NOW()
WHERE control_id = '1.5' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 2.1 -> 2.2.1
UPDATE requirements_library 
SET official_description = 'Establish and maintain a detailed inventory of all licensed software installed on enterprise assets. The software inventory must document the title, publisher, initial install/use date, and business purpose for each entry; where appropriate, include the Uniform Resource Locator (URL), app store(s), version(s), deployment mechanism, decommission date, and number of licenses. Review and update the software inventory bi-annually, or more frequently.',
    updated_at = NOW()
WHERE control_id = '2.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 2.2 -> 2.2.2
UPDATE requirements_library 
SET official_description = 'Ensure that only currently supported software is designated as authorized in the software inventory for enterprise assets. If software is unsupported, yet necessary for the fulfillment of the enterprise's mission, document an exception detailing mitigating controls and residual risk acceptance. For any unsupported software without an exception documentation, designate as unauthorized. Review the software list to verify software support at least monthly, or more frequently.',
    updated_at = NOW()
WHERE control_id = '2.2' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 2.3 -> 2.2.3
UPDATE requirements_library 
SET official_description = 'Ensure that unauthorized software is either removed from use on enterprise assets or receives a documented exception. Review monthly, or more frequently.',
    updated_at = NOW()
WHERE control_id = '2.3' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 2.4 -> 2.2.4
UPDATE requirements_library 
SET official_description = 'Utilize software inventory tools, when possible, throughout the enterprise to automate the discovery and documentation of installed software.',
    updated_at = NOW()
WHERE control_id = '2.4' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 2.5 -> 2.2.5
UPDATE requirements_library 
SET official_description = 'Use technical controls, such as application allowlisting, to ensure that only authorized software can execute or be accessed. Reassess bi-annually, or more frequently.',
    updated_at = NOW()
WHERE control_id = '2.5' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 2.6 -> 2.2.6
UPDATE requirements_library 
SET official_description = 'Use technical controls to ensure that only authorized software libraries, such as specific .dll, .ocx, and .so files, are allowed to load into a system process. Block unauthorized libraries from loading into a system process. Reassess bi-annually, or more frequently.',
    updated_at = NOW()
WHERE control_id = '2.6' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 2.7 -> 2.2.7
UPDATE requirements_library 
SET official_description = 'Use application allowlisting technology on all assets to ensure that only authorized software executes and all unauthorized software is blocked from executing on assets.',
    updated_at = NOW()
WHERE control_id = '2.7' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 3.1 -> 3.3.1
UPDATE requirements_library 
SET official_description = 'Establish and maintain a data management process. In the process, address data sensitivity, data owner, handling of data, data retention limits, and disposal requirements, based on sensitivity and retention standards for the enterprise. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
    updated_at = NOW()
WHERE control_id = '3.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 3.2 -> 3.3.2
UPDATE requirements_library 
SET official_description = 'Establish and maintain an inventory of sensitive data. Ensure the inventory describes the location of data, responsible steward, business purpose, and organizational structure that is responsible for secure handling of the data. Sensitive data includes personally-identifiable information (PII), personal health information (PHI), payment cardholder information, business-sensitive data, and any other information that if modified, processed, or disclosed without authorization could have material impacts to enterprise operations.',
    updated_at = NOW()
WHERE control_id = '3.2' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 3.3 -> 3.3.3
UPDATE requirements_library 
SET official_description = 'Restrict access to sensitive data repositories. Access shall be based on business need. Do not store sensitive data on the local workstation. Use secure, centralized storage areas when sharing sensitive data.',
    updated_at = NOW()
WHERE control_id = '3.3' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 10.1 -> 10.10.1
UPDATE requirements_library 
SET official_description = 'Deploy and maintain anti-malware software on all enterprise assets.',
    updated_at = NOW()
WHERE control_id = '10.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 10.2 -> 10.10.2
UPDATE requirements_library 
SET official_description = 'Configure automatic updates for anti-malware signature files on all enterprise assets.',
    updated_at = NOW()
WHERE control_id = '10.2' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 10.3 -> 10.10.3
UPDATE requirements_library 
SET official_description = 'Configure systems to automatically disable Autorun and Autoplay for removable media.',
    updated_at = NOW()
WHERE control_id = '10.3' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 10.4 -> 10.10.4
UPDATE requirements_library 
SET official_description = 'Configure anti-malware software to automatically scan removable media.',
    updated_at = NOW()
WHERE control_id = '10.4' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 10.5 -> 10.10.5
UPDATE requirements_library 
SET official_description = 'Enable anti-exploitation features on enterprise assets and software, where possible, such as Microsoft® Data Execution Prevention (DEP), Windows® Defender Exploit Guard (WDEG), or Apple® System Integrity Protection (SIP) and Gatekeeper™.',
    updated_at = NOW()
WHERE control_id = '10.5' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 10.6 -> 10.10.6
UPDATE requirements_library 
SET official_description = 'Centrally manage anti-malware software.',
    updated_at = NOW()
WHERE control_id = '10.6' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 10.7 -> 10.10.7
UPDATE requirements_library 
SET official_description = 'Use behavior-based anti-malware software.',
    updated_at = NOW()
WHERE control_id = '10.7' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);