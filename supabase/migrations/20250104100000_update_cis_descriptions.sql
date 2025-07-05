-- Update CIS Controls with detailed descriptions from Excel
-- This migration updates all CIS Controls with comprehensive descriptions

-- Update 1.1
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain Detailed Enterprise Asset Inventory',
  description = 'Establish and maintain an accurate, detailed, and up-to-date inventory of all enterprise assets with the potential to store or process data, to include: end-user devices (including portable and mobile), network devices, non-computing/IoT devices, and servers. Ensure the inventory records the network address (if static), hardware address, machine name, enterprise asset owner, department for each asset, and whether the asset has been approved to connect to the network. For mobile end-user devices, MDM type tools can support this process, where appropriate. This inventory includes assets connected to the infrastructure physically, virtually, remotely, and those within cloud environments. Additionally, it includes assets that are regularly connected to the enterprise’s network infrastructure, even if they are not under control of the enterprise. Review and update the inventory of all enterprise assets bi-annually, or more frequently.',
  updated_at = NOW()
WHERE control_id = '1.1' 
AND standard_id IN (
  'afe9728d-2084-4b6b-8653-b04e1e92cdff', 
  '05501cbc-c463-4668-ae84-9acb1a4d5332', 
  'b1d9e82f-b0c3-40e2-89d7-4c51e216214e'
);

-- Update 2.2
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain a Software Inventory',
  description = 'Establish and maintain a detailed inventory of all licensed software installed on enterprise assets. The software inventory must document the title, publisher, initial install/use date, and business purpose for each entry; where appropriate, include the Uniform Resource Locator (URL), app store(s), version(s), deployment mechanism, decommission date, and number of licenses. Review and update the software inventory bi-annually, or more frequently.',
  updated_at = NOW()
WHERE control_id = '2.2' 
AND standard_id IN (
  'afe9728d-2084-4b6b-8653-b04e1e92cdff', 
  '05501cbc-c463-4668-ae84-9acb1a4d5332', 
  'b1d9e82f-b0c3-40e2-89d7-4c51e216214e'
);

-- Update 3.3
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain a Data Management Process',
  description = 'Establish and maintain a documented data management process. In the process, address data sensitivity, data owner, handling of data, data retention limits, and disposal requirements, based on sensitivity and retention standards for the enterprise. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  updated_at = NOW()
WHERE control_id = '3.3' 
AND standard_id IN (
  'afe9728d-2084-4b6b-8653-b04e1e92cdff', 
  '05501cbc-c463-4668-ae84-9acb1a4d5332', 
  'b1d9e82f-b0c3-40e2-89d7-4c51e216214e'
);

-- Update 4.4
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain a Secure Configuration Process',
  description = 'Establish and maintain a documented secure configuration process for enterprise assets (end-user devices, including portable and mobile, non-computing/IoT devices, and servers) and software (operating systems and applications). Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  updated_at = NOW()
WHERE control_id = '4.4' 
AND standard_id IN (
  'afe9728d-2084-4b6b-8653-b04e1e92cdff', 
  '05501cbc-c463-4668-ae84-9acb1a4d5332', 
  'b1d9e82f-b0c3-40e2-89d7-4c51e216214e'
);

-- Update 5.5
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain an Inventory of Accounts',
  description = 'Establish and maintain an inventory of all accounts managed in the enterprise. The inventory must at a minimum include user, administrator, and service accounts. The inventory, at a minimum, should contain the person’s name, username, start/stop dates, and department. Validate that all active accounts are authorized, on a recurring schedule at a minimum quarterly, or more frequently.',
  updated_at = NOW()
WHERE control_id = '5.5' 
AND standard_id IN (
  'afe9728d-2084-4b6b-8653-b04e1e92cdff', 
  '05501cbc-c463-4668-ae84-9acb1a4d5332', 
  'b1d9e82f-b0c3-40e2-89d7-4c51e216214e'
);

-- Update 6.6
UPDATE requirements_library 
SET 
  title = 'Establish an Access Granting Process',
  description = 'Establish and follow a documented process, preferably automated, for granting access to enterprise assets upon new hire or role change of a user.',
  updated_at = NOW()
WHERE control_id = '6.6' 
AND standard_id IN (
  'afe9728d-2084-4b6b-8653-b04e1e92cdff', 
  '05501cbc-c463-4668-ae84-9acb1a4d5332', 
  'b1d9e82f-b0c3-40e2-89d7-4c51e216214e'
);

-- Update 7.7
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain a Vulnerability Management Process',
  description = 'Establish and maintain a documented vulnerability management process for enterprise assets. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  updated_at = NOW()
WHERE control_id = '7.7' 
AND standard_id IN (
  'afe9728d-2084-4b6b-8653-b04e1e92cdff', 
  '05501cbc-c463-4668-ae84-9acb1a4d5332', 
  'b1d9e82f-b0c3-40e2-89d7-4c51e216214e'
);

-- Update 8.8
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain an Audit Log Management Process',
  description = 'Establish and maintain a documented audit log management process that defines the enterprise’s logging requirements. At a minimum, address the collection, review, and retention of audit logs for enterprise assets. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  updated_at = NOW()
WHERE control_id = '8.8' 
AND standard_id IN (
  'afe9728d-2084-4b6b-8653-b04e1e92cdff', 
  '05501cbc-c463-4668-ae84-9acb1a4d5332', 
  'b1d9e82f-b0c3-40e2-89d7-4c51e216214e'
);

-- Update 9.9
UPDATE requirements_library 
SET 
  title = 'Ensure Use of Only Fully Supported Browsers and Email Clients',
  description = 'Ensure only fully supported browsers and email clients are allowed to execute in the enterprise, only using the latest version of browsers and email clients provided through the vendor.',
  updated_at = NOW()
WHERE control_id = '9.9' 
AND standard_id IN (
  'afe9728d-2084-4b6b-8653-b04e1e92cdff', 
  '05501cbc-c463-4668-ae84-9acb1a4d5332', 
  'b1d9e82f-b0c3-40e2-89d7-4c51e216214e'
);

-- Update 10.10
UPDATE requirements_library 
SET 
  title = 'Deploy and Maintain Anti-Malware Software',
  description = 'Deploy and maintain anti-malware software on all enterprise assets.',
  updated_at = NOW()
WHERE control_id = '10.10' 
AND standard_id IN (
  'afe9728d-2084-4b6b-8653-b04e1e92cdff', 
  '05501cbc-c463-4668-ae84-9acb1a4d5332', 
  'b1d9e82f-b0c3-40e2-89d7-4c51e216214e'
);

-- Update 11.11
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain a Data Recovery Process ',
  description = 'Establish and maintain a documented data recovery process that includes detailed backup procedures. In the process, address the scope of data recovery activities, recovery prioritization, and the security of backup data. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  updated_at = NOW()
WHERE control_id = '11.11' 
AND standard_id IN (
  'afe9728d-2084-4b6b-8653-b04e1e92cdff', 
  '05501cbc-c463-4668-ae84-9acb1a4d5332', 
  'b1d9e82f-b0c3-40e2-89d7-4c51e216214e'
);

-- Update 12.12
UPDATE requirements_library 
SET 
  title = 'Ensure Network Infrastructure is Up-to-Date',
  description = 'Ensure network infrastructure is kept up-to-date. Example implementations include running the latest stable release of software and/or using currently supported network as a service (NaaS) offerings. Review software versions monthly, or more frequently, to verify software support.',
  updated_at = NOW()
WHERE control_id = '12.12' 
AND standard_id IN (
  'afe9728d-2084-4b6b-8653-b04e1e92cdff', 
  '05501cbc-c463-4668-ae84-9acb1a4d5332', 
  'b1d9e82f-b0c3-40e2-89d7-4c51e216214e'
);

-- Update 13.13
UPDATE requirements_library 
SET 
  title = 'Centralize Security Event Alerting',
  description = 'Centralize security event alerting across enterprise assets for log correlation and analysis. Best practice implementation requires the use of a SIEM, which includes vendor-defined event correlation alerts. A log analytics platform configured with security-relevant correlation alerts also satisfies this Safeguard.',
  updated_at = NOW()
WHERE control_id = '13.13' 
AND standard_id IN (
  'afe9728d-2084-4b6b-8653-b04e1e92cdff', 
  '05501cbc-c463-4668-ae84-9acb1a4d5332', 
  'b1d9e82f-b0c3-40e2-89d7-4c51e216214e'
);

-- Update 14.14
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain a Security Awareness Program',
  description = 'Establish and maintain a security awareness program. The purpose of a security awareness program is to educate the enterprise’s workforce on how to interact with enterprise assets and data in a secure manner. Conduct training at hire and, at a minimum, annually. Review and update content annually, or when significant enterprise changes occur that could impact this Safeguard.',
  updated_at = NOW()
WHERE control_id = '14.14' 
AND standard_id IN (
  'afe9728d-2084-4b6b-8653-b04e1e92cdff', 
  '05501cbc-c463-4668-ae84-9acb1a4d5332', 
  'b1d9e82f-b0c3-40e2-89d7-4c51e216214e'
);

-- Update 15.15
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain an Inventory of Service Providers',
  description = 'Establish and maintain an inventory of service providers. The inventory is to list all known service providers, include classification(s), and designate an enterprise contact for each service provider. Review and update the inventory annually, or when significant enterprise changes occur that could impact this Safeguard. ',
  updated_at = NOW()
WHERE control_id = '15.15' 
AND standard_id IN (
  'afe9728d-2084-4b6b-8653-b04e1e92cdff', 
  '05501cbc-c463-4668-ae84-9acb1a4d5332', 
  'b1d9e82f-b0c3-40e2-89d7-4c51e216214e'
);

-- Update 16.16
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain a Secure Application Development Process',
  description = 'Establish and maintain a secure application development process. In the process, address such items as: secure application design standards, secure coding practices, developer training, vulnerability management, security of third-party code, and application security testing procedures. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  updated_at = NOW()
WHERE control_id = '16.16' 
AND standard_id IN (
  'afe9728d-2084-4b6b-8653-b04e1e92cdff', 
  '05501cbc-c463-4668-ae84-9acb1a4d5332', 
  'b1d9e82f-b0c3-40e2-89d7-4c51e216214e'
);

-- Update 17.17
UPDATE requirements_library 
SET 
  title = 'Designate Personnel to Manage Incident Handling',
  description = 'Designate one key person, and at least one backup, who will manage the enterprise’s incident handling process. Management personnel are responsible for the coordination and documentation of incident response and recovery efforts and can consist of employees internal to the enterprise, service providers, or a hybrid approach. If using a service provider, designate at least one person internal to the enterprise to oversee any third-party work. Review annually, or when significant enterprise changes occur that could impact this Safeguard.',
  updated_at = NOW()
WHERE control_id = '17.17' 
AND standard_id IN (
  'afe9728d-2084-4b6b-8653-b04e1e92cdff', 
  '05501cbc-c463-4668-ae84-9acb1a4d5332', 
  'b1d9e82f-b0c3-40e2-89d7-4c51e216214e'
);

-- Update 18.18
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain a Penetration Testing Program',
  description = 'Establish and maintain a penetration testing program appropriate to the size, complexity, industry, and maturity of the enterprise. Penetration testing program characteristics include scope, such as network, web application, Application Programming Interface (API), hosted services, and physical premise controls; frequency; limitations, such as acceptable hours, and excluded attack types; point of contact information; remediation, such as how findings will be routed internally; and retrospective requirements.',
  updated_at = NOW()
WHERE control_id = '18.18' 
AND standard_id IN (
  'afe9728d-2084-4b6b-8653-b04e1e92cdff', 
  '05501cbc-c463-4668-ae84-9acb1a4d5332', 
  'b1d9e82f-b0c3-40e2-89d7-4c51e216214e'
);

