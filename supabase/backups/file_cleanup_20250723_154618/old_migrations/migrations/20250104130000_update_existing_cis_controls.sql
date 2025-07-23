-- Update existing CIS Controls with proper detailed descriptions
-- This migration updates the CIS controls that actually exist in our database

-- Update Control 1.1.1 (maps to 1.1 in Excel)
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain Detailed Enterprise Asset Inventory',
  official_description = 'Establish and maintain an accurate, detailed, and up-to-date inventory of all enterprise assets with the potential to store or process data, to include: end-user devices (including portable and mobile), network devices, non-computing/IoT devices, and servers. Ensure the inventory records the network address (if static), hardware address, machine name, enterprise asset owner, department for each asset, and whether the asset has been approved to connect to the network. For mobile end-user devices, MDM type tools can support this process, where appropriate. This inventory includes assets connected to the infrastructure physically, virtually, remotely, and those within cloud environments. Additionally, it includes assets that are regularly connected to the enterprise''s network infrastructure, even if they are not under control of the enterprise. Review and update the inventory of all enterprise assets bi-annually, or more frequently.',
  updated_at = NOW()
WHERE requirement_code = '1.1.1';

-- Update Control 1.1.2 (maps to 1.2 in Excel)
UPDATE requirements_library 
SET 
  title = 'Address Unauthorized Assets',
  official_description = 'Ensure that a process exists to address unauthorized assets on a weekly basis. The enterprise may choose to remove the asset from the network, deny the asset from connecting remotely to the network, or quarantine the asset.',
  updated_at = NOW()
WHERE requirement_code = '1.1.2';

-- Update Control 1.1.3 (maps to 1.3 in Excel)
UPDATE requirements_library 
SET 
  title = 'Utilize an Active Discovery Tool',
  official_description = 'Utilize an active discovery tool to identify assets connected to the enterprise''s network. Configure the active discovery tool to execute daily, or more frequently.',
  updated_at = NOW()
WHERE requirement_code = '1.1.3';

-- Update Control 1.1.4 (maps to 1.4 in Excel)
UPDATE requirements_library 
SET 
  title = 'Use Dynamic Host Configuration Protocol (DHCP) Logging to Update Enterprise Asset Inventory',
  official_description = 'Use DHCP logging on all DHCP servers or Internet Protocol (IP) address management tools to update the enterprise''s asset inventory. Review and use logs to update the enterprise''s asset inventory weekly, or more frequently.',
  updated_at = NOW()
WHERE requirement_code = '1.1.4';

-- Update Control 2.2.1 (maps to 2.1 in Excel)
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain a Software Inventory',
  official_description = 'Establish and maintain a detailed inventory of all licensed software installed on enterprise assets. The software inventory must document the title, publisher, initial install/use date, and business purpose for each entry; where appropriate, include the Uniform Resource Locator (URL), app store(s), version(s), deployment mechanism, decommission date, and number of licenses. Review and update the software inventory bi-annually, or more frequently.',
  updated_at = NOW()
WHERE requirement_code = '2.2.1';

-- Update Control 2.2.2 (maps to 2.2 in Excel)
UPDATE requirements_library 
SET 
  title = 'Ensure Authorized Software is Currently Supported',
  official_description = 'Ensure that only currently supported software is designated as authorized in the software inventory for enterprise assets. If software is unsupported, yet necessary for the fulfillment of the enterprise''s mission, document an exception detailing mitigating controls and residual risk acceptance. For any unsupported software without an exception documentation, designate as unauthorized. Review the software list to verify software support at least monthly, or more frequently.',
  updated_at = NOW()
WHERE requirement_code = '2.2.2';

-- Update Control 2.2.3 (maps to 2.3 in Excel)
UPDATE requirements_library 
SET 
  title = 'Address Unauthorized Software',
  official_description = 'Ensure that unauthorized software is either removed from use on enterprise assets or receives a documented exception. Review monthly, or more frequently.',
  updated_at = NOW()
WHERE requirement_code = '2.2.3';

-- Update Control 3.3.1 (maps to 3.1 in Excel)
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain a Data Management Process',
  official_description = 'Establish and maintain a documented data management process. In the process, address data sensitivity, data owner, handling of data, data retention limits, and disposal requirements, based on sensitivity and retention standards for the enterprise. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  updated_at = NOW()
WHERE requirement_code = '3.3.1';

-- Update Control 4.4.1 (maps to 4.1 in Excel)
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain a Secure Configuration Process',
  official_description = 'Establish and maintain a documented secure configuration process for enterprise assets (end-user devices, including portable and mobile, non-computing/IoT devices, and servers) and software (operating systems and applications). Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  updated_at = NOW()
WHERE requirement_code = '4.4.1';

-- Update Control 5.5.1 (maps to 5.1 in Excel)
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain an Inventory of Accounts',
  official_description = 'Establish and maintain an inventory of all accounts managed in the enterprise. The inventory shall include both user and administrator accounts. The inventory shall include the person or entity the account belongs to, the systems it applies to, and an active or inactive status. Review the inventory quarterly, or more frequently.',
  updated_at = NOW()
WHERE requirement_code = '5.5.1';