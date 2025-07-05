-- Update ALL 153 CIS Controls with official descriptions from source Excel/JSON
-- This migration adds the official_description field for all CIS Controls
-- Generated automatically from cis_controls_data.json

-- Control 1.1 -> 1.1.1: Establish and Maintain Detailed Enterprise Asset Inventory
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain an accurate, detailed, and up-to-date inventory of all enterprise assets with the potential to store or process data, to include: end-user devices (including portable and mobile), network devices, non-computing/IoT devices, and servers. Ensure the inventory records the network address (if static), hardware address, machine name, enterprise asset owner, department for each asset, and whether the asset has been approved to connect to the network. For mobile end-user devices, MDM type tools can support this process, where appropriate. This inventory includes assets connected to the infrastructure physically, virtually, remotely, and those within cloud environments. Additionally, it includes assets that are regularly connected to the enterprise’s network infrastructure, even if they are not under control of the enterprise. Review and update the inventory of all enterprise assets bi-annually, or more frequently.$BODY$,
    updated_at = NOW()
WHERE control_id = '1.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 1.2 -> 1.1.2: Address Unauthorized Assets
UPDATE requirements_library 
SET official_description = $BODY$Ensure that a process exists to address unauthorized assets on a weekly basis. The enterprise may choose to remove the asset from the network, deny the asset from connecting remotely to the network, or quarantine the asset.$BODY$,
    updated_at = NOW()
WHERE control_id = '1.2' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 1.3 -> 1.1.3: Utilize an Active Discovery Tool
UPDATE requirements_library 
SET official_description = $BODY$Utilize an active discovery tool to identify assets connected to the enterprise’s network. Configure the active discovery tool to execute daily, or more frequently.$BODY$,
    updated_at = NOW()
WHERE control_id = '1.3' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 1.4 -> 1.1.4: Use Dynamic Host Configuration Protocol (DHCP) Logging to Update Enterprise Asset Inventory
UPDATE requirements_library 
SET official_description = $BODY$Use DHCP logging on all DHCP servers or Internet Protocol (IP) address management tools to update the enterprise’s asset inventory. Review and use logs to update the enterprise’s asset inventory weekly, or more frequently.$BODY$,
    updated_at = NOW()
WHERE control_id = '1.4' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 1.5 -> 1.1.5: Use a Passive Asset Discovery Tool
UPDATE requirements_library 
SET official_description = $BODY$Use a passive discovery tool to identify assets connected to the enterprise’s network. Review and use scans to update the enterprise’s asset inventory at least weekly, or more frequently.$BODY$,
    updated_at = NOW()
WHERE control_id = '1.5' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 2.1 -> 2.2.1: Establish and Maintain a Software Inventory
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain a detailed inventory of all licensed software installed on enterprise assets. The software inventory must document the title, publisher, initial install/use date, and business purpose for each entry; where appropriate, include the Uniform Resource Locator (URL), app store(s), version(s), deployment mechanism, decommission date, and number of licenses. Review and update the software inventory bi-annually, or more frequently.$BODY$,
    updated_at = NOW()
WHERE control_id = '2.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 2.2 -> 2.2.2: Ensure Authorized Software is Currently Supported 
UPDATE requirements_library 
SET official_description = $BODY$Ensure that only currently supported software is designated as authorized in the software inventory for enterprise assets. If software is unsupported, yet necessary for the fulfillment of the enterprise’s mission, document an exception detailing mitigating controls and residual risk acceptance. For any unsupported software without an exception documentation, designate as unauthorized. Review the software list to verify software support at least monthly, or more frequently.$BODY$,
    updated_at = NOW()
WHERE control_id = '2.2' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 2.3 -> 2.2.3: Address Unauthorized Software
UPDATE requirements_library 
SET official_description = $BODY$Ensure that unauthorized software is either removed from use on enterprise assets or receives a documented exception. Review monthly, or more frequently.$BODY$,
    updated_at = NOW()
WHERE control_id = '2.3' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 2.4 -> 2.2.4: Utilize Automated Software Inventory Tools
UPDATE requirements_library 
SET official_description = $BODY$Utilize software inventory tools, when possible, throughout the enterprise to automate the discovery and documentation of installed software. $BODY$,
    updated_at = NOW()
WHERE control_id = '2.4' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 2.5 -> 2.2.5: Allowlist Authorized Software
UPDATE requirements_library 
SET official_description = $BODY$Use technical controls, such as application allowlisting, to ensure that only authorized software can execute or be accessed. Reassess bi-annually, or more frequently.$BODY$,
    updated_at = NOW()
WHERE control_id = '2.5' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 2.6 -> 2.2.6: Allowlist Authorized Libraries
UPDATE requirements_library 
SET official_description = $BODY$Use technical controls to ensure that only authorized software libraries, such as specific .dll, .ocx, and .so files, are allowed to load into a system process. Block unauthorized libraries from loading into a system process. Reassess bi-annually, or more frequently.$BODY$,
    updated_at = NOW()
WHERE control_id = '2.6' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 2.7 -> 2.2.7: Allowlist Authorized Scripts
UPDATE requirements_library 
SET official_description = $BODY$Use technical controls, such as digital signatures and version control, to ensure that only authorized scripts, such as specific .ps1 and .py files, are allowed to execute. Block unauthorized scripts from executing. Reassess bi-annually, or more frequently.$BODY$,
    updated_at = NOW()
WHERE control_id = '2.7' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 3.1 -> 3.3.1: Establish and Maintain a Data Management Process
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain a documented data management process. In the process, address data sensitivity, data owner, handling of data, data retention limits, and disposal requirements, based on sensitivity and retention standards for the enterprise. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.$BODY$,
    updated_at = NOW()
WHERE control_id = '3.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 3.2 -> 3.3.2: Establish and Maintain a Data Inventory
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain a data inventory based on the enterprise’s data management process. Inventory sensitive data, at a minimum. Review and update inventory annually, at a minimum, with a priority on sensitive data.$BODY$,
    updated_at = NOW()
WHERE control_id = '3.2' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 3.3 -> 3.3.3: Configure Data Access Control Lists
UPDATE requirements_library 
SET official_description = $BODY$Configure data access control lists based on a user’s need to know. Apply data access control lists, also known as access permissions, to local and remote file systems, databases, and applications.$BODY$,
    updated_at = NOW()
WHERE control_id = '3.3' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 3.4 -> 3.3.4: Enforce Data Retention
UPDATE requirements_library 
SET official_description = $BODY$Retain data according to the enterprise’s documented data management process. Data retention must include both minimum and maximum timelines.$BODY$,
    updated_at = NOW()
WHERE control_id = '3.4' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 3.5 -> 3.3.5: Securely Dispose of Data
UPDATE requirements_library 
SET official_description = $BODY$Securely dispose of data as outlined in the enterprise’s documented data management process. Ensure the disposal process and method are commensurate with the data sensitivity.$BODY$,
    updated_at = NOW()
WHERE control_id = '3.5' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 3.6 -> 3.3.6: Encrypt Data on End-User Devices
UPDATE requirements_library 
SET official_description = $BODY$Encrypt data on end-user devices containing sensitive data. Example implementations can include: Windows BitLocker®, Apple FileVault®, Linux® dm-crypt.$BODY$,
    updated_at = NOW()
WHERE control_id = '3.6' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 3.7 -> 3.3.7: Establish and Maintain a Data Classification Scheme
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain an overall data classification scheme for the enterprise. Enterprises may use labels, such as “Sensitive,” “Confidential,” and “Public,” and classify their data according to those labels. Review and update the classification scheme annually, or when significant enterprise changes occur that could impact this Safeguard.$BODY$,
    updated_at = NOW()
WHERE control_id = '3.7' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 3.8 -> 3.3.8: Document Data Flows
UPDATE requirements_library 
SET official_description = $BODY$Document data flows. Data flow documentation includes service provider data flows and should be based on the enterprise’s data management process. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.$BODY$,
    updated_at = NOW()
WHERE control_id = '3.8' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 3.9 -> 3.3.9: Encrypt Data on Removable Media
UPDATE requirements_library 
SET official_description = $BODY$Encrypt data on removable media.$BODY$,
    updated_at = NOW()
WHERE control_id = '3.9' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 3.1 -> 3.3.1: Encrypt Sensitive Data in Transit
UPDATE requirements_library 
SET official_description = $BODY$Encrypt sensitive data in transit. Example implementations can include: Transport Layer Security (TLS) and Open Secure Shell (OpenSSH).$BODY$,
    updated_at = NOW()
WHERE control_id = '3.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 3.11 -> 3.3.11: Encrypt Sensitive Data at Rest
UPDATE requirements_library 
SET official_description = $BODY$Encrypt sensitive data at rest on servers, applications, and databases. Storage-layer encryption, also known as server-side encryption, meets the minimum requirement of this Safeguard. Additional encryption methods may include application-layer encryption, also known as client-side encryption, where access to the data storage device(s) does not permit access to the plain-text data.$BODY$,
    updated_at = NOW()
WHERE control_id = '3.11' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 3.12 -> 3.3.12: Segment Data Processing and Storage Based on Sensitivity
UPDATE requirements_library 
SET official_description = $BODY$Segment data processing and storage based on the sensitivity of the data. Do not process sensitive data on enterprise assets intended for lower sensitivity data.$BODY$,
    updated_at = NOW()
WHERE control_id = '3.12' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 3.13 -> 3.3.13: Deploy a Data Loss Prevention Solution
UPDATE requirements_library 
SET official_description = $BODY$Implement an automated tool, such as a host-based Data Loss Prevention (DLP) tool to identify all sensitive data stored, processed, or transmitted through enterprise assets, including those located onsite or at a remote service provider, and update the enterprise's data inventory.$BODY$,
    updated_at = NOW()
WHERE control_id = '3.13' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 3.14 -> 3.3.14: Log Sensitive Data Access
UPDATE requirements_library 
SET official_description = $BODY$Log sensitive data access, including modification and disposal. $BODY$,
    updated_at = NOW()
WHERE control_id = '3.14' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 4.1 -> 4.4.1: Establish and Maintain a Secure Configuration Process
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain a documented secure configuration process for enterprise assets (end-user devices, including portable and mobile, non-computing/IoT devices, and servers) and software (operating systems and applications). Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.$BODY$,
    updated_at = NOW()
WHERE control_id = '4.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 4.2 -> 4.4.2: Establish and Maintain a Secure Configuration Process for Network Infrastructure
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain a documented secure configuration process for network devices. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.$BODY$,
    updated_at = NOW()
WHERE control_id = '4.2' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 4.3 -> 4.4.3: Configure Automatic Session Locking on Enterprise Assets
UPDATE requirements_library 
SET official_description = $BODY$Configure automatic session locking on enterprise assets after a defined period of inactivity. For general purpose operating systems, the period must not exceed 15 minutes. For mobile end-user devices, the period must not exceed 2 minutes.$BODY$,
    updated_at = NOW()
WHERE control_id = '4.3' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 4.4 -> 4.4.4: Implement and Manage a Firewall on Servers
UPDATE requirements_library 
SET official_description = $BODY$Implement and manage a firewall on servers, where supported. Example implementations include a virtual firewall, operating system firewall, or a third-party firewall agent.$BODY$,
    updated_at = NOW()
WHERE control_id = '4.4' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 4.5 -> 4.4.5: Implement and Manage a Firewall on End-User Devices
UPDATE requirements_library 
SET official_description = $BODY$Implement and manage a host-based firewall or port-filtering tool on end-user devices, with a default-deny rule that drops all traffic except those services and ports that are explicitly allowed.$BODY$,
    updated_at = NOW()
WHERE control_id = '4.5' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 4.6 -> 4.4.6: Securely Manage Enterprise Assets and Software
UPDATE requirements_library 
SET official_description = $BODY$Securely manage enterprise assets and software. Example implementations include managing configuration through version-controlled Infrastructure-as-Code (IaC) and accessing administrative interfaces over secure network protocols, such as Secure Shell (SSH) and Hypertext Transfer Protocol Secure (HTTPS). Do not use insecure management protocols, such as Telnet (Teletype Network) and HTTP, unless operationally essential.$BODY$,
    updated_at = NOW()
WHERE control_id = '4.6' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 4.7 -> 4.4.7: Manage Default Accounts on Enterprise Assets and Software
UPDATE requirements_library 
SET official_description = $BODY$Manage default accounts on enterprise assets and software, such as root, administrator, and other pre-configured vendor accounts. Example implementations can include: disabling default accounts or making them unusable.$BODY$,
    updated_at = NOW()
WHERE control_id = '4.7' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 4.8 -> 4.4.8: Uninstall or Disable Unnecessary Services on Enterprise Assets and Software
UPDATE requirements_library 
SET official_description = $BODY$Uninstall or disable unnecessary services on enterprise assets and software, such as an unused file sharing service, web application module, or service function.$BODY$,
    updated_at = NOW()
WHERE control_id = '4.8' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 4.9 -> 4.4.9: Configure Trusted DNS Servers on Enterprise Assets
UPDATE requirements_library 
SET official_description = $BODY$Configure trusted DNS servers on network infrastructure. Example implementations include configuring network devices to use enterprise-controlled DNS servers and/or reputable externally accessible DNS servers. $BODY$,
    updated_at = NOW()
WHERE control_id = '4.9' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 4.1 -> 4.4.1: Enforce Automatic Device Lockout on Portable End-User Devices
UPDATE requirements_library 
SET official_description = $BODY$Enforce automatic device lockout following a predetermined threshold of local failed authentication attempts on portable end-user devices, where supported. For laptops, do not allow more than 20 failed authentication attempts; for tablets and smartphones, no more than 10 failed authentication attempts. Example implementations include Microsoft® InTune Device Lock and Apple® Configuration Profile maxFailedAttempts.$BODY$,
    updated_at = NOW()
WHERE control_id = '4.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 4.11 -> 4.4.11: Enforce Remote Wipe Capability on Portable End-User Devices
UPDATE requirements_library 
SET official_description = $BODY$Remotely wipe enterprise data from enterprise-owned portable end-user devices when deemed appropriate such as lost or stolen devices, or when an individual no longer supports the enterprise.$BODY$,
    updated_at = NOW()
WHERE control_id = '4.11' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 4.12 -> 4.4.12: Separate Enterprise Workspaces on Mobile End-User Devices
UPDATE requirements_library 
SET official_description = $BODY$Ensure separate enterprise workspaces are used on mobile end-user devices, where supported. Example implementations include using an Apple® Configuration Profile or Android™ Work Profile to separate enterprise applications and data from personal applications and data.$BODY$,
    updated_at = NOW()
WHERE control_id = '4.12' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 5.1 -> 5.5.1: Establish and Maintain an Inventory of Accounts
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain an inventory of all accounts managed in the enterprise. The inventory must at a minimum include user, administrator, and service accounts. The inventory, at a minimum, should contain the person’s name, username, start/stop dates, and department. Validate that all active accounts are authorized, on a recurring schedule at a minimum quarterly, or more frequently.$BODY$,
    updated_at = NOW()
WHERE control_id = '5.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 5.2 -> 5.5.2: Use Unique Passwords
UPDATE requirements_library 
SET official_description = $BODY$Use unique passwords for all enterprise assets. Best practice implementation includes, at a minimum, an 8-character password for accounts using Multi-Factor Authentication (MFA) and a 14-character password for accounts not using MFA. $BODY$,
    updated_at = NOW()
WHERE control_id = '5.2' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 5.3 -> 5.5.3: Disable Dormant Accounts
UPDATE requirements_library 
SET official_description = $BODY$Delete or disable any dormant accounts after a period of 45 days of inactivity, where supported.$BODY$,
    updated_at = NOW()
WHERE control_id = '5.3' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 5.4 -> 5.5.4: Restrict Administrator Privileges to Dedicated Administrator Accounts
UPDATE requirements_library 
SET official_description = $BODY$Restrict administrator privileges to dedicated administrator accounts on enterprise assets. Conduct general computing activities, such as internet browsing, email, and productivity suite use, from the user’s primary, non-privileged account.$BODY$,
    updated_at = NOW()
WHERE control_id = '5.4' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 5.5 -> 5.5.5: Establish and Maintain an Inventory of Service Accounts
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain an inventory of service accounts. The inventory, at a minimum, must contain department owner, review date, and purpose. Perform service account reviews to validate that all active accounts are authorized, on a recurring schedule at a minimum quarterly, or more frequently.$BODY$,
    updated_at = NOW()
WHERE control_id = '5.5' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 5.6 -> 5.5.6: Centralize Account Management
UPDATE requirements_library 
SET official_description = $BODY$Centralize account management through a directory or identity service.$BODY$,
    updated_at = NOW()
WHERE control_id = '5.6' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 6.1 -> 6.6.1: Establish an Access Granting Process
UPDATE requirements_library 
SET official_description = $BODY$Establish and follow a documented process, preferably automated, for granting access to enterprise assets upon new hire or role change of a user.$BODY$,
    updated_at = NOW()
WHERE control_id = '6.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 6.2 -> 6.6.2: Establish an Access Revoking Process
UPDATE requirements_library 
SET official_description = $BODY$Establish and follow a process, preferably automated, for revoking access to enterprise assets, through disabling accounts immediately upon termination, rights revocation, or role change of a user. Disabling accounts, instead of deleting accounts, may be necessary to preserve audit trails.$BODY$,
    updated_at = NOW()
WHERE control_id = '6.2' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 6.3 -> 6.6.3: Require MFA for Externally-Exposed Applications
UPDATE requirements_library 
SET official_description = $BODY$Require all externally-exposed enterprise or third-party applications to enforce MFA, where supported. Enforcing MFA through a directory service or SSO provider is a satisfactory implementation of this Safeguard.$BODY$,
    updated_at = NOW()
WHERE control_id = '6.3' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 6.4 -> 6.6.4: Require MFA for Remote Network Access
UPDATE requirements_library 
SET official_description = $BODY$Require MFA for remote network access.$BODY$,
    updated_at = NOW()
WHERE control_id = '6.4' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 6.5 -> 6.6.5: Require MFA for Administrative Access
UPDATE requirements_library 
SET official_description = $BODY$Require MFA for all administrative access accounts, where supported, on all enterprise assets, whether managed on-site or through a service provider.$BODY$,
    updated_at = NOW()
WHERE control_id = '6.5' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 6.6 -> 6.6.6: Establish and Maintain an Inventory of Authentication and Authorization Systems
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain an inventory of the enterprise’s authentication and authorization systems, including those hosted on-site or at a remote service provider. Review and update the inventory, at a minimum, annually, or more frequently.$BODY$,
    updated_at = NOW()
WHERE control_id = '6.6' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 6.7 -> 6.6.7: Centralize Access Control
UPDATE requirements_library 
SET official_description = $BODY$Centralize access control for all enterprise assets through a directory service or SSO provider, where supported.$BODY$,
    updated_at = NOW()
WHERE control_id = '6.7' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 6.8 -> 6.6.8: Define and Maintain Role-Based Access Control
UPDATE requirements_library 
SET official_description = $BODY$Define and maintain role-based access control, through determining and documenting the access rights necessary for each role within the enterprise to successfully carry out its assigned duties. Perform access control reviews of enterprise assets to validate that all privileges are authorized, on a recurring schedule at a minimum annually, or more frequently.$BODY$,
    updated_at = NOW()
WHERE control_id = '6.8' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 7.1 -> 7.7.1: Establish and Maintain a Vulnerability Management Process
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain a documented vulnerability management process for enterprise assets. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.$BODY$,
    updated_at = NOW()
WHERE control_id = '7.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 7.2 -> 7.7.2: Establish and Maintain a Remediation Process
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain a risk-based remediation strategy documented in a remediation process, with monthly, or more frequent, reviews.$BODY$,
    updated_at = NOW()
WHERE control_id = '7.2' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 7.3 -> 7.7.3: Perform Automated Operating System Patch Management
UPDATE requirements_library 
SET official_description = $BODY$Perform operating system updates on enterprise assets through automated patch management on a monthly, or more frequent, basis.$BODY$,
    updated_at = NOW()
WHERE control_id = '7.3' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 7.4 -> 7.7.4: Perform Automated Application Patch Management
UPDATE requirements_library 
SET official_description = $BODY$Perform application updates on enterprise assets through automated patch management on a monthly, or more frequent, basis.$BODY$,
    updated_at = NOW()
WHERE control_id = '7.4' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 7.5 -> 7.7.5: Perform Automated Vulnerability Scans of Internal Enterprise Assets
UPDATE requirements_library 
SET official_description = $BODY$Perform automated vulnerability scans of internal enterprise assets on a quarterly, or more frequent, basis. Conduct both authenticated and unauthenticated scans.$BODY$,
    updated_at = NOW()
WHERE control_id = '7.5' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 7.6 -> 7.7.6: Perform Automated Vulnerability Scans of Externally-Exposed Enterprise Assets
UPDATE requirements_library 
SET official_description = $BODY$Perform automated vulnerability scans of externally-exposed enterprise assets. Perform scans on a monthly, or more frequent, basis. $BODY$,
    updated_at = NOW()
WHERE control_id = '7.6' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 7.7 -> 7.7.7: Remediate Detected Vulnerabilities
UPDATE requirements_library 
SET official_description = $BODY$Remediate detected vulnerabilities in software through processes and tooling on a monthly, or more frequent, basis, based on the remediation process.$BODY$,
    updated_at = NOW()
WHERE control_id = '7.7' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 8.1 -> 8.8.1: Establish and Maintain an Audit Log Management Process
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain a documented audit log management process that defines the enterprise’s logging requirements. At a minimum, address the collection, review, and retention of audit logs for enterprise assets. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.$BODY$,
    updated_at = NOW()
WHERE control_id = '8.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 8.2 -> 8.8.2: Collect Audit Logs
UPDATE requirements_library 
SET official_description = $BODY$Collect audit logs. Ensure that logging, per the enterprise’s audit log management process, has been enabled across enterprise assets.$BODY$,
    updated_at = NOW()
WHERE control_id = '8.2' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 8.3 -> 8.8.3: Ensure Adequate Audit Log Storage
UPDATE requirements_library 
SET official_description = $BODY$Ensure that logging destinations maintain adequate storage to comply with the enterprise’s audit log management process.$BODY$,
    updated_at = NOW()
WHERE control_id = '8.3' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 8.4 -> 8.8.4: Standardize Time Synchronization
UPDATE requirements_library 
SET official_description = $BODY$Standardize time synchronization. Configure at least two synchronized time sources across enterprise assets, where supported.$BODY$,
    updated_at = NOW()
WHERE control_id = '8.4' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 8.5 -> 8.8.5: Collect Detailed Audit Logs
UPDATE requirements_library 
SET official_description = $BODY$Configure detailed audit logging for enterprise assets containing sensitive data. Include event source, date, username, timestamp, source addresses, destination addresses, and other useful elements that could assist in a forensic investigation.$BODY$,
    updated_at = NOW()
WHERE control_id = '8.5' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 8.6 -> 8.8.6: Collect DNS Query Audit Logs
UPDATE requirements_library 
SET official_description = $BODY$Collect DNS query audit logs on enterprise assets, where appropriate and supported.$BODY$,
    updated_at = NOW()
WHERE control_id = '8.6' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 8.7 -> 8.8.7: Collect URL Request Audit Logs
UPDATE requirements_library 
SET official_description = $BODY$Collect URL request audit logs on enterprise assets, where appropriate and supported.$BODY$,
    updated_at = NOW()
WHERE control_id = '8.7' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 8.8 -> 8.8.8: Collect Command-Line Audit Logs
UPDATE requirements_library 
SET official_description = $BODY$Collect command-line audit logs. Example implementations include collecting audit logs from PowerShell®, BASH™, and remote administrative terminals.$BODY$,
    updated_at = NOW()
WHERE control_id = '8.8' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 8.9 -> 8.8.9: Centralize Audit Logs
UPDATE requirements_library 
SET official_description = $BODY$Centralize, to the extent possible, audit log collection and retention across enterprise assets in accordance with the documented audit log management process. Example implementations primarily include leveraging a SIEM tool to centralize multiple log sources.$BODY$,
    updated_at = NOW()
WHERE control_id = '8.9' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 8.1 -> 8.8.1: Retain Audit Logs
UPDATE requirements_library 
SET official_description = $BODY$Retain audit logs across enterprise assets for a minimum of 90 days.$BODY$,
    updated_at = NOW()
WHERE control_id = '8.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 8.11 -> 8.8.11: Conduct Audit Log Reviews
UPDATE requirements_library 
SET official_description = $BODY$Conduct reviews of audit logs to detect anomalies or abnormal events that could indicate a potential threat. Conduct reviews on a weekly, or more frequent, basis.$BODY$,
    updated_at = NOW()
WHERE control_id = '8.11' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 8.12 -> 8.8.12: Collect Service Provider Logs
UPDATE requirements_library 
SET official_description = $BODY$Collect service provider logs, where supported. Example implementations include collecting authentication and authorization events, data creation and disposal events, and user management events.$BODY$,
    updated_at = NOW()
WHERE control_id = '8.12' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 9.1 -> 9.9.1: Ensure Use of Only Fully Supported Browsers and Email Clients
UPDATE requirements_library 
SET official_description = $BODY$Ensure only fully supported browsers and email clients are allowed to execute in the enterprise, only using the latest version of browsers and email clients provided through the vendor.$BODY$,
    updated_at = NOW()
WHERE control_id = '9.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 9.2 -> 9.9.2: Use DNS Filtering Services
UPDATE requirements_library 
SET official_description = $BODY$Use DNS filtering services on all end-user devices, including remote and on-premises assets, to block access to known malicious domains.$BODY$,
    updated_at = NOW()
WHERE control_id = '9.2' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 9.3 -> 9.9.3: Maintain and Enforce Network-Based URL Filters
UPDATE requirements_library 
SET official_description = $BODY$Enforce and update network-based URL filters to limit an enterprise asset from connecting to potentially malicious or unapproved websites. Example implementations include category-based filtering, reputation-based filtering, or through the use of block lists. Enforce filters for all enterprise assets.$BODY$,
    updated_at = NOW()
WHERE control_id = '9.3' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 9.4 -> 9.9.4: Restrict Unnecessary or Unauthorized Browser and Email Client Extensions
UPDATE requirements_library 
SET official_description = $BODY$Restrict, either through uninstalling or disabling, any unauthorized or unnecessary browser or email client plugins, extensions, and add-on applications.$BODY$,
    updated_at = NOW()
WHERE control_id = '9.4' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 9.5 -> 9.9.5: Implement DMARC
UPDATE requirements_library 
SET official_description = $BODY$To lower the chance of spoofed or modified emails from valid domains, implement DMARC policy and verification, starting with implementing the Sender Policy Framework (SPF) and the DomainKeys Identified Mail (DKIM) standards.$BODY$,
    updated_at = NOW()
WHERE control_id = '9.5' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 9.6 -> 9.9.6: Block Unnecessary File Types
UPDATE requirements_library 
SET official_description = $BODY$Block unnecessary file types attempting to enter the enterprise’s email gateway.$BODY$,
    updated_at = NOW()
WHERE control_id = '9.6' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 9.7 -> 9.9.7: Deploy and Maintain Email Server Anti-Malware Protections
UPDATE requirements_library 
SET official_description = $BODY$Deploy and maintain email server anti-malware protections, such as attachment scanning and/or sandboxing.$BODY$,
    updated_at = NOW()
WHERE control_id = '9.7' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 10.1 -> 10.10.1: Deploy and Maintain Anti-Malware Software
UPDATE requirements_library 
SET official_description = $BODY$Deploy and maintain anti-malware software on all enterprise assets.$BODY$,
    updated_at = NOW()
WHERE control_id = '10.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 10.2 -> 10.10.2: Configure Automatic Anti-Malware Signature Updates
UPDATE requirements_library 
SET official_description = $BODY$Configure automatic updates for anti-malware signature files on all enterprise assets.$BODY$,
    updated_at = NOW()
WHERE control_id = '10.2' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 10.3 -> 10.10.3: Disable Autorun and Autoplay for Removable Media
UPDATE requirements_library 
SET official_description = $BODY$Disable autorun and autoplay auto-execute functionality for removable media.$BODY$,
    updated_at = NOW()
WHERE control_id = '10.3' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 10.4 -> 10.10.4: Configure Automatic Anti-Malware Scanning of Removable Media
UPDATE requirements_library 
SET official_description = $BODY$Configure anti-malware software to automatically scan removable media.$BODY$,
    updated_at = NOW()
WHERE control_id = '10.4' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 10.5 -> 10.10.5: Enable Anti-Exploitation Features
UPDATE requirements_library 
SET official_description = $BODY$Enable anti-exploitation features on enterprise assets and software, where possible, such as Microsoft® Data Execution Prevention (DEP), Windows® Defender Exploit Guard (WDEG), or Apple® System Integrity Protection (SIP) and Gatekeeper™.$BODY$,
    updated_at = NOW()
WHERE control_id = '10.5' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 10.6 -> 10.10.6: Centrally Manage Anti-Malware Software
UPDATE requirements_library 
SET official_description = $BODY$Centrally manage anti-malware software.$BODY$,
    updated_at = NOW()
WHERE control_id = '10.6' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 10.7 -> 10.10.7: Use Behavior-Based Anti-Malware Software
UPDATE requirements_library 
SET official_description = $BODY$Use behavior-based anti-malware software.$BODY$,
    updated_at = NOW()
WHERE control_id = '10.7' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 11.1 -> 11.11.1: Establish and Maintain a Data Recovery Process 
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain a documented data recovery process that includes detailed backup procedures. In the process, address the scope of data recovery activities, recovery prioritization, and the security of backup data. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.$BODY$,
    updated_at = NOW()
WHERE control_id = '11.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 11.2 -> 11.11.2: Perform Automated Backups 
UPDATE requirements_library 
SET official_description = $BODY$Perform automated backups of in-scope enterprise assets. Run backups weekly, or more frequently, based on the sensitivity of the data.$BODY$,
    updated_at = NOW()
WHERE control_id = '11.2' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 11.3 -> 11.11.3: Protect Recovery Data
UPDATE requirements_library 
SET official_description = $BODY$Protect recovery data with equivalent controls to the original data. Reference encryption or data separation, based on requirements.$BODY$,
    updated_at = NOW()
WHERE control_id = '11.3' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 11.4 -> 11.11.4: Establish and Maintain an Isolated Instance of Recovery Data 
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain an isolated instance of recovery data. Example implementations include, version controlling backup destinations through offline, cloud, or off-site systems or services.$BODY$,
    updated_at = NOW()
WHERE control_id = '11.4' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 11.5 -> 11.11.5: Test Data Recovery
UPDATE requirements_library 
SET official_description = $BODY$Test backup recovery quarterly, or more frequently, for a sampling of in-scope enterprise assets.$BODY$,
    updated_at = NOW()
WHERE control_id = '11.5' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 12.1 -> 12.12.1: Ensure Network Infrastructure is Up-to-Date
UPDATE requirements_library 
SET official_description = $BODY$Ensure network infrastructure is kept up-to-date. Example implementations include running the latest stable release of software and/or using currently supported network as a service (NaaS) offerings. Review software versions monthly, or more frequently, to verify software support.$BODY$,
    updated_at = NOW()
WHERE control_id = '12.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 12.2 -> 12.12.2: Establish and Maintain a Secure Network Architecture
UPDATE requirements_library 
SET official_description = $BODY$Design and maintain a secure network architecture. A secure network architecture must address segmentation, least privilege, and availability, at a minimum. Example implementations may include documentation, policy, and design components.$BODY$,
    updated_at = NOW()
WHERE control_id = '12.2' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 12.3 -> 12.12.3: Securely Manage Network Infrastructure
UPDATE requirements_library 
SET official_description = $BODY$Securely manage network infrastructure. Example implementations include version-controlled Infrastructure-as-Code (IaC), and the use of secure network protocols, such as SSH and HTTPS. $BODY$,
    updated_at = NOW()
WHERE control_id = '12.3' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 12.4 -> 12.12.4: Establish and Maintain Architecture Diagram(s)
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain architecture diagram(s) and/or other network system documentation. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.$BODY$,
    updated_at = NOW()
WHERE control_id = '12.4' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 12.5 -> 12.12.5: Centralize Network Authentication, Authorization, and Auditing (AAA)
UPDATE requirements_library 
SET official_description = $BODY$Centralize network AAA.$BODY$,
    updated_at = NOW()
WHERE control_id = '12.5' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 12.6 -> 12.12.6: Use of Secure Network Management and Communication Protocols 
UPDATE requirements_library 
SET official_description = $BODY$Adopt secure network management protocols (e.g., 802.1X) and secure communication protocols (e.g., Wi-Fi Protected Access 2 (WPA2) Enterprise or more secure alternatives).$BODY$,
    updated_at = NOW()
WHERE control_id = '12.6' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 12.7 -> 12.12.7: Ensure Remote Devices Utilize a VPN and are Connecting to an Enterprise’s AAA Infrastructure
UPDATE requirements_library 
SET official_description = $BODY$Require users to authenticate to enterprise-managed VPN and authentication services prior to accessing enterprise resources on end-user devices.$BODY$,
    updated_at = NOW()
WHERE control_id = '12.7' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 12.8 -> 12.12.8: Establish and Maintain Dedicated Computing Resources for All Administrative Work
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain dedicated computing resources, either physically or logically separated, for all administrative tasks or tasks requiring administrative access. The computing resources should be segmented from the enterprise's primary network and not be allowed internet access.$BODY$,
    updated_at = NOW()
WHERE control_id = '12.8' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 13.1 -> 13.13.1: Centralize Security Event Alerting
UPDATE requirements_library 
SET official_description = $BODY$Centralize security event alerting across enterprise assets for log correlation and analysis. Best practice implementation requires the use of a SIEM, which includes vendor-defined event correlation alerts. A log analytics platform configured with security-relevant correlation alerts also satisfies this Safeguard.$BODY$,
    updated_at = NOW()
WHERE control_id = '13.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 13.2 -> 13.13.2: Deploy a Host-Based Intrusion Detection Solution
UPDATE requirements_library 
SET official_description = $BODY$Deploy a host-based intrusion detection solution on enterprise assets, where appropriate and/or supported.$BODY$,
    updated_at = NOW()
WHERE control_id = '13.2' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 13.3 -> 13.13.3: Deploy a Network Intrusion Detection Solution
UPDATE requirements_library 
SET official_description = $BODY$Deploy a network intrusion detection solution on enterprise assets, where appropriate. Example implementations include the use of a Network Intrusion Detection System (NIDS) or equivalent cloud service provider (CSP) service.$BODY$,
    updated_at = NOW()
WHERE control_id = '13.3' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 13.4 -> 13.13.4: Perform Traffic Filtering Between Network Segments
UPDATE requirements_library 
SET official_description = $BODY$Perform traffic filtering between network segments, where appropriate.$BODY$,
    updated_at = NOW()
WHERE control_id = '13.4' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 13.5 -> 13.13.5: Manage Access Control for Remote Assets
UPDATE requirements_library 
SET official_description = $BODY$Manage access control for assets remotely connecting to enterprise resources. Determine amount of access to enterprise resources based on: up-to-date anti-malware software installed, configuration compliance with the enterprise’s secure configuration process, and ensuring the operating system and applications are up-to-date.	 $BODY$,
    updated_at = NOW()
WHERE control_id = '13.5' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 13.6 -> 13.13.6: Collect Network Traffic Flow Logs 
UPDATE requirements_library 
SET official_description = $BODY$Collect network traffic flow logs and/or network traffic to review and alert upon from network devices.$BODY$,
    updated_at = NOW()
WHERE control_id = '13.6' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 13.7 -> 13.13.7: Deploy a Host-Based Intrusion Prevention Solution
UPDATE requirements_library 
SET official_description = $BODY$Deploy a host-based intrusion prevention solution on enterprise assets, where appropriate and/or supported. Example implementations include use of an Endpoint Detection and Response (EDR) client or host-based IPS agent.$BODY$,
    updated_at = NOW()
WHERE control_id = '13.7' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 13.8 -> 13.13.8: Deploy a Network Intrusion Prevention Solution
UPDATE requirements_library 
SET official_description = $BODY$Deploy a network intrusion prevention solution, where appropriate. Example implementations include the use of a Network Intrusion Prevention System (NIPS) or equivalent CSP service.$BODY$,
    updated_at = NOW()
WHERE control_id = '13.8' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 13.9 -> 13.13.9: Deploy Port-Level Access Control
UPDATE requirements_library 
SET official_description = $BODY$Deploy port-level access control. Port-level access control utilizes 802.1x, or similar network access control protocols, such as certificates, and may incorporate user and/or device authentication.$BODY$,
    updated_at = NOW()
WHERE control_id = '13.9' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 13.1 -> 13.13.1: Perform Application Layer Filtering
UPDATE requirements_library 
SET official_description = $BODY$Perform application layer filtering. Example implementations include a filtering proxy, application layer firewall, or gateway.$BODY$,
    updated_at = NOW()
WHERE control_id = '13.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 13.11 -> 13.13.11: Tune Security Event Alerting Thresholds
UPDATE requirements_library 
SET official_description = $BODY$Tune security event alerting thresholds monthly, or more frequently.$BODY$,
    updated_at = NOW()
WHERE control_id = '13.11' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 14.1 -> 14.14.1: Establish and Maintain a Security Awareness Program
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain a security awareness program. The purpose of a security awareness program is to educate the enterprise’s workforce on how to interact with enterprise assets and data in a secure manner. Conduct training at hire and, at a minimum, annually. Review and update content annually, or when significant enterprise changes occur that could impact this Safeguard.$BODY$,
    updated_at = NOW()
WHERE control_id = '14.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 14.2 -> 14.14.2: Train Workforce Members to Recognize Social Engineering Attacks
UPDATE requirements_library 
SET official_description = $BODY$Train workforce members to recognize social engineering attacks, such as phishing, business email compromise (BEC), pretexting, and tailgating. $BODY$,
    updated_at = NOW()
WHERE control_id = '14.2' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 14.3 -> 14.14.3: Train Workforce Members on Authentication Best Practices
UPDATE requirements_library 
SET official_description = $BODY$Train workforce members on authentication best practices. Example topics include MFA, password composition, and credential management.$BODY$,
    updated_at = NOW()
WHERE control_id = '14.3' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 14.4 -> 14.14.4: Train Workforce on Data Handling Best Practices
UPDATE requirements_library 
SET official_description = $BODY$Train workforce members on how to identify and properly store, transfer, archive, and destroy sensitive data. This also includes training workforce members on clear screen and desk best practices, such as locking their screen when they step away from their enterprise asset, erasing physical and virtual whiteboards at the end of meetings, and storing data and assets securely.$BODY$,
    updated_at = NOW()
WHERE control_id = '14.4' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 14.5 -> 14.14.5: Train Workforce Members on Causes of Unintentional Data Exposure
UPDATE requirements_library 
SET official_description = $BODY$Train workforce members to be aware of causes for unintentional data exposure. Example topics include mis-delivery of sensitive data, losing a portable end-user device, or publishing data to unintended audiences.$BODY$,
    updated_at = NOW()
WHERE control_id = '14.5' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 14.6 -> 14.14.6: Train Workforce Members on Recognizing and Reporting Security Incidents
UPDATE requirements_library 
SET official_description = $BODY$Train workforce members to be able to recognize a potential incident and be able to report such an incident. $BODY$,
    updated_at = NOW()
WHERE control_id = '14.6' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 14.7 -> 14.14.7: Train Workforce on How to Identify and Report if Their Enterprise Assets are Missing Security Updates
UPDATE requirements_library 
SET official_description = $BODY$Train workforce to understand how to verify and report out-of-date software patches or any failures in automated processes and tools. Part of this training should include notifying IT personnel of any failures in automated processes and tools.$BODY$,
    updated_at = NOW()
WHERE control_id = '14.7' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 14.8 -> 14.14.8: Train Workforce on the Dangers of Connecting to and Transmitting Enterprise Data Over Insecure Networks
UPDATE requirements_library 
SET official_description = $BODY$Train workforce members on the dangers of connecting to, and transmitting data over, insecure networks for enterprise activities. If the enterprise has remote workers, training must include guidance to ensure that all users securely configure their home network infrastructure.$BODY$,
    updated_at = NOW()
WHERE control_id = '14.8' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 14.9 -> 14.14.9: Conduct Role-Specific Security Awareness and Skills Training
UPDATE requirements_library 
SET official_description = $BODY$Conduct role-specific security awareness and skills training. Example implementations include secure system administration courses for IT professionals, OWASP® Top 10 vulnerability awareness and prevention training for web application developers, and advanced social engineering awareness training for high-profile roles.$BODY$,
    updated_at = NOW()
WHERE control_id = '14.9' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 15.1 -> 15.15.1: Establish and Maintain an Inventory of Service Providers
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain an inventory of service providers. The inventory is to list all known service providers, include classification(s), and designate an enterprise contact for each service provider. Review and update the inventory annually, or when significant enterprise changes occur that could impact this Safeguard. $BODY$,
    updated_at = NOW()
WHERE control_id = '15.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 15.2 -> 15.15.2: Establish and Maintain a Service Provider Management Policy
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain a service provider management policy. Ensure the policy addresses the classification, inventory, assessment, monitoring, and decommissioning of service providers. Review and update the policy annually, or when significant enterprise changes occur that could impact this Safeguard.$BODY$,
    updated_at = NOW()
WHERE control_id = '15.2' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 15.3 -> 15.15.3: Classify Service Providers
UPDATE requirements_library 
SET official_description = $BODY$Classify service providers. Classification consideration may include one or more characteristics, such as data sensitivity, data volume, availability requirements, applicable regulations, inherent risk, and mitigated risk. Update and review classifications annually, or when significant enterprise changes occur that could impact this Safeguard.$BODY$,
    updated_at = NOW()
WHERE control_id = '15.3' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 15.4 -> 15.15.4: Ensure Service Provider Contracts Include Security Requirements
UPDATE requirements_library 
SET official_description = $BODY$Ensure service provider contracts include security requirements. Example requirements may include minimum security program requirements, security incident and/or data breach notification and response, data encryption requirements, and data disposal commitments. These security requirements must be consistent with the enterprise’s service provider management policy. Review service provider contracts annually to ensure contracts are not missing security requirements.$BODY$,
    updated_at = NOW()
WHERE control_id = '15.4' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 15.5 -> 15.15.5: Assess Service Providers
UPDATE requirements_library 
SET official_description = $BODY$Assess service providers consistent with the enterprise’s service provider management policy. Assessment scope may vary based on classification(s), and may include review of standardized assessment reports, such as Service Organization Control 2 (SOC 2) and Payment Card Industry (PCI) Attestation of Compliance (AoC), customized questionnaires, or other appropriately rigorous processes. Reassess service providers annually, at a minimum, or with new and renewed contracts.$BODY$,
    updated_at = NOW()
WHERE control_id = '15.5' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 15.6 -> 15.15.6: Monitor Service Providers
UPDATE requirements_library 
SET official_description = $BODY$Monitor service providers consistent with the enterprise’s service provider management policy. Monitoring may include periodic reassessment of service provider compliance, monitoring service provider release notes, and dark web monitoring.$BODY$,
    updated_at = NOW()
WHERE control_id = '15.6' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 15.7 -> 15.15.7: Securely Decommission Service Providers
UPDATE requirements_library 
SET official_description = $BODY$Securely decommission service providers. Example considerations include user and service account deactivation, termination of data flows, and secure disposal of enterprise data within service provider systems. $BODY$,
    updated_at = NOW()
WHERE control_id = '15.7' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 16.1 -> 16.16.1: Establish and Maintain a Secure Application Development Process
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain a secure application development process. In the process, address such items as: secure application design standards, secure coding practices, developer training, vulnerability management, security of third-party code, and application security testing procedures. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.$BODY$,
    updated_at = NOW()
WHERE control_id = '16.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 16.2 -> 16.16.2: Establish and Maintain a Process to Accept and Address Software Vulnerabilities
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain a process to accept and address reports of software vulnerabilities, including providing a means for external entities to report. The process is to include such items as: a vulnerability handling policy that identifies reporting process, responsible party for handling vulnerability reports, and a process for intake, assignment, remediation, and remediation testing. As part of the process, use a vulnerability tracking system that includes severity ratings and metrics for measuring timing for identification, analysis, and remediation of vulnerabilities. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.

Third-party application developers need to consider this an externally-facing policy that helps to set expectations for outside stakeholders.$BODY$,
    updated_at = NOW()
WHERE control_id = '16.2' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 16.3 -> 16.16.3: Perform Root Cause Analysis on Security Vulnerabilities
UPDATE requirements_library 
SET official_description = $BODY$Perform root cause analysis on security vulnerabilities. When reviewing vulnerabilities, root cause analysis is the task of evaluating underlying issues that create vulnerabilities in code, and allows development teams to move beyond just fixing individual vulnerabilities as they arise.$BODY$,
    updated_at = NOW()
WHERE control_id = '16.3' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 16.4 -> 16.16.4: Establish and Manage an Inventory of Third-Party Software Components
UPDATE requirements_library 
SET official_description = $BODY$Establish and manage an updated inventory of third-party components used in development, often referred to as a “bill of materials,” as well as components slated for future use. This inventory is to include any risks that each third-party component could pose. Evaluate the list at least monthly to identify any changes or updates to these components, and validate that the component is still supported. $BODY$,
    updated_at = NOW()
WHERE control_id = '16.4' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 16.5 -> 16.16.5: Use Up-to-Date and Trusted Third-Party Software Components
UPDATE requirements_library 
SET official_description = $BODY$Use up-to-date and trusted third-party software components. When possible, choose established and proven frameworks and libraries that provide adequate security. Acquire these components from trusted sources or evaluate the software for vulnerabilities before use.$BODY$,
    updated_at = NOW()
WHERE control_id = '16.5' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 16.6 -> 16.16.6: Establish and Maintain a Severity Rating System and Process for Application Vulnerabilities
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain a severity rating system and process for application vulnerabilities that facilitates prioritizing the order in which discovered vulnerabilities are fixed. This process includes setting a minimum level of security acceptability for releasing code or applications. Severity ratings bring a systematic way of triaging vulnerabilities that improves risk management and helps ensure the most severe bugs are fixed first. Review and update the system and process annually.$BODY$,
    updated_at = NOW()
WHERE control_id = '16.6' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 16.7 -> 16.16.7: Use Standard Hardening Configuration Templates for Application Infrastructure
UPDATE requirements_library 
SET official_description = $BODY$Use standard, industry-recommended hardening configuration templates for application infrastructure components. This includes underlying servers, databases, and web servers, and applies to cloud containers, Platform as a Service (PaaS) components, and SaaS components. Do not allow in-house developed software to weaken configuration hardening.$BODY$,
    updated_at = NOW()
WHERE control_id = '16.7' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 16.8 -> 16.16.8: Separate Production and Non-Production Systems
UPDATE requirements_library 
SET official_description = $BODY$Maintain separate environments for production and non-production systems.$BODY$,
    updated_at = NOW()
WHERE control_id = '16.8' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 16.9 -> 16.16.9: Train Developers in Application Security Concepts and Secure Coding
UPDATE requirements_library 
SET official_description = $BODY$Ensure that all software development personnel receive training in writing secure code for their specific development environment and responsibilities. Training can include general security principles and application security standard practices. Conduct training at least annually and design in a way to promote security within the development team, and build a culture of security among the developers.$BODY$,
    updated_at = NOW()
WHERE control_id = '16.9' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 16.1 -> 16.16.1: Apply Secure Design Principles in Application Architectures
UPDATE requirements_library 
SET official_description = $BODY$Apply secure design principles in application architectures. Secure design principles include the concept of least privilege and enforcing mediation to validate every operation that the user makes, promoting the concept of "never trust user input." Examples include ensuring that explicit error checking is performed and documented for all input, including for size, data type, and acceptable ranges or formats. Secure design also means minimizing the application infrastructure attack surface, such as turning off unprotected ports and services, removing unnecessary programs and files, and renaming or removing default accounts.$BODY$,
    updated_at = NOW()
WHERE control_id = '16.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 16.11 -> 16.16.11: Leverage Vetted Modules or Services for Application Security Components
UPDATE requirements_library 
SET official_description = $BODY$Leverage vetted modules or services for application security components, such as identity management, encryption, auditing, and logging. Using platform features in critical security functions will reduce developers’ workload and minimize the likelihood of design or implementation errors. Modern operating systems provide effective mechanisms for identification, authentication, and authorization and make those mechanisms available to applications. Use only standardized, currently accepted, and extensively reviewed encryption algorithms. Operating systems also provide mechanisms to create and maintain secure audit logs.$BODY$,
    updated_at = NOW()
WHERE control_id = '16.11' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 16.12 -> 16.16.12: Implement Code-Level Security Checks
UPDATE requirements_library 
SET official_description = $BODY$Apply static and dynamic analysis tools within the application life cycle to verify that secure coding practices are being followed.$BODY$,
    updated_at = NOW()
WHERE control_id = '16.12' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 16.13 -> 16.16.13: Conduct Application Penetration Testing
UPDATE requirements_library 
SET official_description = $BODY$Conduct application penetration testing. For critical applications, authenticated penetration testing is better suited to finding business logic vulnerabilities than code scanning and automated security testing. Penetration testing relies on the skill of the tester to manually manipulate an application as an authenticated and unauthenticated user. $BODY$,
    updated_at = NOW()
WHERE control_id = '16.13' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 16.14 -> 16.16.14: Conduct Threat Modeling
UPDATE requirements_library 
SET official_description = $BODY$Conduct threat modeling. Threat modeling is the process of identifying and addressing application security design flaws within a design, before code is created. It is conducted through specially trained individuals who evaluate the application design and gauge security risks for each entry point and access level. The goal is to map out the application, architecture, and infrastructure in a structured way to understand its weaknesses.$BODY$,
    updated_at = NOW()
WHERE control_id = '16.14' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 17.1 -> 17.17.1: Designate Personnel to Manage Incident Handling
UPDATE requirements_library 
SET official_description = $BODY$Designate one key person, and at least one backup, who will manage the enterprise’s incident handling process. Management personnel are responsible for the coordination and documentation of incident response and recovery efforts and can consist of employees internal to the enterprise, service providers, or a hybrid approach. If using a service provider, designate at least one person internal to the enterprise to oversee any third-party work. Review annually, or when significant enterprise changes occur that could impact this Safeguard.$BODY$,
    updated_at = NOW()
WHERE control_id = '17.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 17.2 -> 17.17.2: Establish and Maintain Contact Information for Reporting Security Incidents
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain contact information for parties that need to be informed of security incidents. Contacts may include internal staff, service providers, law enforcement, cyber insurance providers, relevant government agencies, Information Sharing and Analysis Center (ISAC) partners, or other stakeholders. Verify contacts annually to ensure that information is up-to-date.$BODY$,
    updated_at = NOW()
WHERE control_id = '17.2' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 17.3 -> 17.17.3: Establish and Maintain an Enterprise Process for Reporting Incidents
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain a documented enterprise process for the workforce to report security incidents. The process includes reporting timeframe, personnel to report to, mechanism for reporting, and the minimum information to be reported. Ensure the process is publicly available to all of the workforce. Review annually, or when significant enterprise changes occur that could impact this Safeguard.$BODY$,
    updated_at = NOW()
WHERE control_id = '17.3' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 17.4 -> 17.17.4: Establish and Maintain an Incident Response Process
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain a documented incident response process that addresses roles and responsibilities, compliance requirements, and a communication plan. Review annually, or when significant enterprise changes occur that could impact this Safeguard.$BODY$,
    updated_at = NOW()
WHERE control_id = '17.4' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 17.5 -> 17.17.5: Assign Key Roles and Responsibilities
UPDATE requirements_library 
SET official_description = $BODY$Assign key roles and responsibilities for incident response, including staff from legal, IT, information security, facilities, public relations, human resources, incident responders, analysts, and relevant third parties. Review annually, or when significant enterprise changes occur that could impact this Safeguard.$BODY$,
    updated_at = NOW()
WHERE control_id = '17.5' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 17.6 -> 17.17.6: Define Mechanisms for Communicating During Incident Response
UPDATE requirements_library 
SET official_description = $BODY$Determine which primary and secondary mechanisms will be used to communicate and report during a security incident. Mechanisms can include phone calls, emails, secure chat, or notification letters. Keep in mind that certain mechanisms, such as emails, can be affected during a security incident. Review annually, or when significant enterprise changes occur that could impact this Safeguard.$BODY$,
    updated_at = NOW()
WHERE control_id = '17.6' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 17.7 -> 17.17.7: Conduct Routine Incident Response Exercises
UPDATE requirements_library 
SET official_description = $BODY$Plan and conduct routine incident response exercises and scenarios for key personnel involved in the incident response process to prepare for responding to real-world incidents. Exercises need to test communication channels, decision making, and workflows. Conduct testing on an annual basis, at a minimum.$BODY$,
    updated_at = NOW()
WHERE control_id = '17.7' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 17.8 -> 17.17.8: Conduct Post-Incident Reviews
UPDATE requirements_library 
SET official_description = $BODY$Conduct post-incident reviews. Post-incident reviews help prevent incident recurrence through identifying lessons learned and follow-up action.$BODY$,
    updated_at = NOW()
WHERE control_id = '17.8' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 17.9 -> 17.17.9: Establish and Maintain Security Incident Thresholds
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain security incident thresholds, including, at a minimum, differentiating between an incident and an event. Examples can include: abnormal activity, security vulnerability, security weakness, data breach, privacy incident, etc. Review annually, or when significant enterprise changes occur that could impact this Safeguard.$BODY$,
    updated_at = NOW()
WHERE control_id = '17.9' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 18.1 -> 18.18.1: Establish and Maintain a Penetration Testing Program
UPDATE requirements_library 
SET official_description = $BODY$Establish and maintain a penetration testing program appropriate to the size, complexity, industry, and maturity of the enterprise. Penetration testing program characteristics include scope, such as network, web application, Application Programming Interface (API), hosted services, and physical premise controls; frequency; limitations, such as acceptable hours, and excluded attack types; point of contact information; remediation, such as how findings will be routed internally; and retrospective requirements.$BODY$,
    updated_at = NOW()
WHERE control_id = '18.1' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 18.2 -> 18.18.2: Perform Periodic External Penetration Tests
UPDATE requirements_library 
SET official_description = $BODY$Perform periodic external penetration tests based on program requirements, no less than annually. External penetration testing must include enterprise and environmental reconnaissance to detect exploitable information. Penetration testing requires specialized skills and experience and must be conducted through a qualified party. The testing may be clear box or opaque box.$BODY$,
    updated_at = NOW()
WHERE control_id = '18.2' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 18.3 -> 18.18.3: Remediate Penetration Test Findings
UPDATE requirements_library 
SET official_description = $BODY$Remediate penetration test findings based on the enterprise’s documented vulnerability remediation process. This should include determining a timeline and level of effort based on the impact and prioritization of each identified finding.$BODY$,
    updated_at = NOW()
WHERE control_id = '18.3' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 18.4 -> 18.18.4: Validate Security Measures
UPDATE requirements_library 
SET official_description = $BODY$Validate security measures after each penetration test. If deemed necessary, modify rulesets and capabilities to detect the techniques used during testing.$BODY$,
    updated_at = NOW()
WHERE control_id = '18.4' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

-- Control 18.5 -> 18.18.5: Perform Periodic Internal Penetration Tests
UPDATE requirements_library 
SET official_description = $BODY$Perform periodic internal penetration tests based on program requirements, no less than annually. The testing may be clear box or opaque box.$BODY$,
    updated_at = NOW()
WHERE control_id = '18.5' 
AND standard_id IN (
    SELECT id FROM standards_library WHERE name LIKE '%CIS%'
);

