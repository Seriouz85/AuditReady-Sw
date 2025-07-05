-- Update all CIS Controls with detailed descriptions from Excel
-- This migration updates CIS Controls with comprehensive descriptions from the JSON file

-- Update 1.1
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain Detailed Enterprise Asset Inventory',
  description = 'Establish and maintain an accurate, detailed, and up-to-date inventory of all enterprise assets with the potential to store or process data, to include: end-user devices (including portable and mobile), network devices, non-computing/IoT devices, and servers. Ensure the inventory records the network address (if static), hardware address, machine name, enterprise asset owner, department for each asset, and whether the asset has been approved to connect to the network. For mobile end-user devices, MDM type tools can support this process, where appropriate. This inventory includes assets connected to the infrastructure physically, virtually, remotely, and those within cloud environments. Additionally, it includes assets that are regularly connected to the enterprise''s network infrastructure, even if they are not under control of the enterprise. Review and update the inventory of all enterprise assets bi-annually, or more frequently.',
  updated_at = NOW()
WHERE control_id = '1.1' AND framework_name = 'CIS Controls';

-- Update 1.2
UPDATE requirements_library 
SET 
  title = 'Address Unauthorized Assets',
  description = 'Ensure that a process exists to address unauthorized assets on a weekly basis. The enterprise may choose to remove the asset from the network, deny the asset from connecting remotely to the network, or quarantine the asset.',
  updated_at = NOW()
WHERE control_id = '1.2' AND framework_name = 'CIS Controls';

-- Update 1.3
UPDATE requirements_library 
SET 
  title = 'Utilize an Active Discovery Tool',
  description = 'Utilize an active discovery tool to identify assets connected to the enterprise''s network. Configure the active discovery tool to execute daily, or more frequently.',
  updated_at = NOW()
WHERE control_id = '1.3' AND framework_name = 'CIS Controls';

-- Update 1.4
UPDATE requirements_library 
SET 
  title = 'Use Dynamic Host Configuration Protocol (DHCP) Logging to Update Enterprise Asset Inventory',
  description = 'Use DHCP logging on all DHCP servers or Internet Protocol (IP) address management tools to update the enterprise''s asset inventory. Review and use logs to update the enterprise''s asset inventory weekly, or more frequently.',
  updated_at = NOW()
WHERE control_id = '1.4' AND framework_name = 'CIS Controls';

-- Update 2.1
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain a Software Inventory',
  description = 'Establish and maintain a detailed inventory of all licensed software installed on enterprise assets. The software inventory must document the title, publisher, initial install/use date, and business purpose for each entry; where appropriate, include the Uniform Resource Locator (URL), app store(s), version(s), deployment mechanism, decommission date, and number of licenses. Review and update the software inventory bi-annually, or more frequently.',
  updated_at = NOW()
WHERE control_id = '2.1' AND framework_name = 'CIS Controls';

-- Update 2.2
UPDATE requirements_library 
SET 
  title = 'Ensure Authorized Software is Currently Supported',
  description = 'Ensure that only currently supported software is designated as authorized in the software inventory for enterprise assets. If software is unsupported, yet necessary for the fulfillment of the enterprise''s mission, document an exception detailing mitigating controls and residual risk acceptance. For any unsupported software without an exception documentation, designate as unauthorized. Review the software list to verify software support at least monthly, or more frequently.',
  updated_at = NOW()
WHERE control_id = '2.2' AND framework_name = 'CIS Controls';

-- Update 2.3
UPDATE requirements_library 
SET 
  title = 'Address Unauthorized Software',
  description = 'Ensure that unauthorized software is either removed from use on enterprise assets or receives a documented exception. Review monthly, or more frequently.',
  updated_at = NOW()
WHERE control_id = '2.3' AND framework_name = 'CIS Controls';

-- Update 3.1
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain a Data Management Process',
  description = 'Establish and maintain a documented data management process. In the process, address data sensitivity, data owner, handling of data, data retention limits, and disposal requirements, based on sensitivity and retention standards for the enterprise. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  updated_at = NOW()
WHERE control_id = '3.1' AND framework_name = 'CIS Controls';

-- Update 3.2
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain a Data Inventory',
  description = 'Establish and maintain a documented data inventory based on the enterprise''s data management process. Inventory data with a sensitivity of high or very high, or data subject to regulatory requirements. The inventory shall include location, volume, sensitivity, owner, custodian, cloud service provider used, and determine if the location is a new location for the enterprise.',
  updated_at = NOW()
WHERE control_id = '3.2' AND framework_name = 'CIS Controls';

-- Update 3.3
UPDATE requirements_library 
SET 
  title = 'Configure Data Access Control Lists',
  description = 'Configure data access control lists based on a user''s need to know. Apply data access control lists, also known as access permissions, to local and remote file systems, databases, and applications.',
  updated_at = NOW()
WHERE control_id = '3.3' AND framework_name = 'CIS Controls';

-- Update 3.4
UPDATE requirements_library 
SET 
  title = 'Enforce Data Retention',
  description = 'Retain data according to the enterprise''s data management process. Data retention must include both minimum and maximum timelines.',
  updated_at = NOW()
WHERE control_id = '3.4' AND framework_name = 'CIS Controls';

-- Update 3.5
UPDATE requirements_library 
SET 
  title = 'Securely Dispose of Data',
  description = 'Securely dispose of data as outlined in the enterprise''s data management process. Ensure the disposal process and method are commensurate with the data sensitivity.',
  updated_at = NOW()
WHERE control_id = '3.5' AND framework_name = 'CIS Controls';

-- Update 3.6
UPDATE requirements_library 
SET 
  title = 'Encrypt Data on End-User Devices',
  description = 'Encrypt data on end-user devices containing sensitive data. Example implementations can include: Windows BitLocker®, Apple FileVault®, Linux dm-crypt.',
  updated_at = NOW()
WHERE control_id = '3.6' AND framework_name = 'CIS Controls';

-- Update 4.1
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain a Secure Configuration Process',
  description = 'Establish and maintain a documented secure configuration process for enterprise assets (end-user devices, including portable and mobile, non-computing/IoT devices, and servers) and software (operating systems and applications). Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  updated_at = NOW()
WHERE control_id = '4.1' AND framework_name = 'CIS Controls';

-- Update 4.2
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain a Secure Configuration Process for Network Infrastructure',
  description = 'Establish and maintain a documented secure configuration process for network infrastructure. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  updated_at = NOW()
WHERE control_id = '4.2' AND framework_name = 'CIS Controls';

-- Update 4.3
UPDATE requirements_library 
SET 
  title = 'Configure Automatic Session Locking on Enterprise Assets',
  description = 'Configure automatic session locking on enterprise assets after a defined period of inactivity. For general purpose operating systems, the period must not exceed 15 minutes. For mobile end-user devices, the period must not exceed 2 minutes.',
  updated_at = NOW()
WHERE control_id = '4.3' AND framework_name = 'CIS Controls';

-- Update 5.1
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain an Inventory of Accounts',
  description = 'Establish and maintain an inventory of all accounts managed in the enterprise. The inventory shall include both user and administrator accounts. The inventory shall include the person or entity the account belongs to, the systems it applies to, and an active or inactive status. Review the inventory quarterly, or more frequently.',
  updated_at = NOW()
WHERE control_id = '5.1' AND framework_name = 'CIS Controls';

-- Update 5.2
UPDATE requirements_library 
SET 
  title = 'Use Unique Passwords',
  description = 'Use unique passwords for all enterprise assets. Best practice implementation includes, at a minimum, an 8-character password for accounts using MFA and a 14-character password for accounts not using MFA.',
  updated_at = NOW()
WHERE control_id = '5.2' AND framework_name = 'CIS Controls';

-- Update 5.3
UPDATE requirements_library 
SET 
  title = 'Disable Dormant Accounts',
  description = 'Delete or disable any dormant accounts after a period of 45 days of inactivity, where supported.',
  updated_at = NOW()
WHERE control_id = '5.3' AND framework_name = 'CIS Controls';

-- Update 5.4
UPDATE requirements_library 
SET 
  title = 'Restrict Administrator Privileges to Dedicated Administrator Accounts',
  description = 'Restrict administrator privileges to dedicated administrator accounts on enterprise assets. Conduct general computing activities, such as internet browsing, email, and productivity suite use, from the user''s standard account.',
  updated_at = NOW()
WHERE control_id = '5.4' AND framework_name = 'CIS Controls';

-- Update 6.1
UPDATE requirements_library 
SET 
  title = 'Establish an Access Granting Process',
  description = 'Establish and follow a process for granting access to enterprise assets upon new hire, promotion, or role change of a user.',
  updated_at = NOW()
WHERE control_id = '6.1' AND framework_name = 'CIS Controls';

-- Update 6.2
UPDATE requirements_library 
SET 
  title = 'Establish an Access Revoking Process',
  description = 'Establish and follow a process for revoking access to enterprise assets, through disabling accounts immediately upon termination, rights revocation, or role change of a user. Disabling accounts, instead of deleting accounts, allows preservation of audit trails.',
  updated_at = NOW()
WHERE control_id = '6.2' AND framework_name = 'CIS Controls';

-- Update 6.3
UPDATE requirements_library 
SET 
  title = 'Require MFA for Externally-Exposed Applications',
  description = 'Require all users to use multi-factor authentication (MFA) for externally-exposed enterprise or third-party applications.',
  updated_at = NOW()
WHERE control_id = '6.3' AND framework_name = 'CIS Controls';

-- Update 6.4
UPDATE requirements_library 
SET 
  title = 'Require MFA for Remote Network Access',
  description = 'Require all users to use multi-factor authentication (MFA) for remote network access.',
  updated_at = NOW()
WHERE control_id = '6.4' AND framework_name = 'CIS Controls';

-- Update 6.5
UPDATE requirements_library 
SET 
  title = 'Require MFA for Administrative Access',
  description = 'Require multi-factor authentication (MFA) for access to enterprise assets with administrative privileges.',
  updated_at = NOW()
WHERE control_id = '6.5' AND framework_name = 'CIS Controls';

-- Update 7.1
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain a Vulnerability Management Process',
  description = 'Establish and maintain a documented vulnerability management process for enterprise assets. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  updated_at = NOW()
WHERE control_id = '7.1' AND framework_name = 'CIS Controls';

-- Update 7.2
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain a Remediation Process',
  description = 'Establish and maintain a documented remediation process for enterprise assets with a vulnerability management process.',
  updated_at = NOW()
WHERE control_id = '7.2' AND framework_name = 'CIS Controls';

-- Update 7.3
UPDATE requirements_library 
SET 
  title = 'Perform Automated Operating System Patch Management',
  description = 'Perform operating system updates on enterprise assets through automated patch management on a monthly, or more frequent, basis.',
  updated_at = NOW()
WHERE control_id = '7.3' AND framework_name = 'CIS Controls';

-- Update 7.4
UPDATE requirements_library 
SET 
  title = 'Perform Automated Application Patch Management',
  description = 'Perform application updates on enterprise assets through automated patch management on a monthly, or more frequent, basis.',
  updated_at = NOW()
WHERE control_id = '7.4' AND framework_name = 'CIS Controls';

-- Update 8.1
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain an Audit Log Management Process',
  description = 'Establish and maintain an audit log management process that defines the enterprise''s logging requirements. At a minimum, address the collection, review, and retention of audit logs for enterprise assets. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  updated_at = NOW()
WHERE control_id = '8.1' AND framework_name = 'CIS Controls';

-- Update 8.2
UPDATE requirements_library 
SET 
  title = 'Collect Audit Logs',
  description = 'Collect audit logs from enterprise assets with a logging configuration in accordance with the audit log management process.',
  updated_at = NOW()
WHERE control_id = '8.2' AND framework_name = 'CIS Controls';

-- Update 8.3
UPDATE requirements_library 
SET 
  title = 'Ensure Adequate Audit Log Storage',
  description = 'Ensure that logging destinations maintain adequate storage to comply with the enterprise''s audit log management process.',
  updated_at = NOW()
WHERE control_id = '8.3' AND framework_name = 'CIS Controls';

-- Update 9.1
UPDATE requirements_library 
SET 
  title = 'Ensure Use of Only Fully Supported Browsers and Email Clients',
  description = 'Ensure only fully supported browsers and email clients are allowed to execute in the enterprise, only using the latest version of browsers and email clients provided by the vendor.',
  updated_at = NOW()
WHERE control_id = '9.1' AND framework_name = 'CIS Controls';

-- Update 9.2
UPDATE requirements_library 
SET 
  title = 'Use DNS Filtering Services',
  description = 'Use DNS filtering services to help block access to known malicious domains.',
  updated_at = NOW()
WHERE control_id = '9.2' AND framework_name = 'CIS Controls';

-- Update 10.1
UPDATE requirements_library 
SET 
  title = 'Deploy and Maintain Anti-Malware Software',
  description = 'Deploy and maintain anti-malware software on all enterprise assets.',
  updated_at = NOW()
WHERE control_id = '10.1' AND framework_name = 'CIS Controls';

-- Update 10.2
UPDATE requirements_library 
SET 
  title = 'Configure Automatic Anti-Malware Signature Updates',
  description = 'Configure automatic anti-malware signature updates on all enterprise assets.',
  updated_at = NOW()
WHERE control_id = '10.2' AND framework_name = 'CIS Controls';

-- Update 10.3
UPDATE requirements_library 
SET 
  title = 'Disable Autorun and Autoplay for Removable Media',
  description = 'Disable autorun and autoplay auto-execute functionality for removable media.',
  updated_at = NOW()
WHERE control_id = '10.3' AND framework_name = 'CIS Controls';

-- Update 11.1
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain a Data Recovery Process',
  description = 'Establish and maintain a data recovery process. In the process, address the scope of data recovery activities, recovery prioritization, and the roles and responsibilities of designated personnel. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  updated_at = NOW()
WHERE control_id = '11.1' AND framework_name = 'CIS Controls';

-- Update 11.2
UPDATE requirements_library 
SET 
  title = 'Perform Automated Backups',
  description = 'Perform automated backups of in-scope enterprise assets. Run backups weekly, or more frequently, using an automated process.',
  updated_at = NOW()
WHERE control_id = '11.2' AND framework_name = 'CIS Controls';

-- Update 11.4
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain an Isolated Instance of Recovery Data',
  description = 'Establish and maintain an isolated instance of recovery data. Example implementations include, version controlling backup destinations through offline, cloud, or off-site systems or services.',
  updated_at = NOW()
WHERE control_id = '11.4' AND framework_name = 'CIS Controls';

-- Update 12.1
UPDATE requirements_library 
SET 
  title = 'Ensure Network Infrastructure is Up-to-Date',
  description = 'Ensure network infrastructure is kept up-to-date. Example implementations include running the latest stable release of software and/or using currently supported network-infrastructure devices.',
  updated_at = NOW()
WHERE control_id = '12.1' AND framework_name = 'CIS Controls';

-- Update 12.2
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain a Secure Network Architecture',
  description = 'Establish and maintain a secure network architecture. A secure network architecture must address segmentation, least privilege, and availability, at a minimum.',
  updated_at = NOW()
WHERE control_id = '12.2' AND framework_name = 'CIS Controls';

-- Update 14.1
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain a Security Awareness Program',
  description = 'Establish and maintain a security awareness program. The purpose of a security awareness program is to educate the enterprise''s workforce on how to interact with enterprise assets and data in a secure manner. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  updated_at = NOW()
WHERE control_id = '14.1' AND framework_name = 'CIS Controls';

-- Update 14.2
UPDATE requirements_library 
SET 
  title = 'Train Workforce Members to Recognize Social Engineering Attacks',
  description = 'Train workforce members to recognize social engineering attacks, such as phishing, pretexting, and tailgating.',
  updated_at = NOW()
WHERE control_id = '14.2' AND framework_name = 'CIS Controls';

-- Update 14.3
UPDATE requirements_library 
SET 
  title = 'Train Workforce Members on Authentication Best Practices',
  description = 'Train workforce members on authentication best practices. Example topics include creating secure passwords, password managers, MFA, and phishing-resistant MFA.',
  updated_at = NOW()
WHERE control_id = '14.3' AND framework_name = 'CIS Controls';

-- Update 14.4
UPDATE requirements_library 
SET 
  title = 'Train Workforce on Data Handling Best Practices',
  description = 'Train workforce members on data handling best practices. Example topics include appropriate use, handling requirements, acceptable locations for storage, encryption, and destruction.',
  updated_at = NOW()
WHERE control_id = '14.4' AND framework_name = 'CIS Controls';

-- Update 14.5
UPDATE requirements_library 
SET 
  title = 'Train Workforce Members on Causes of Unintentional Data Exposure',
  description = 'Train workforce members to be aware of causes for unintentional data exposure. Example topics include mis-delivery of sensitive data, losing a portable end-user device, or publishing data to unintended audiences.',
  updated_at = NOW()
WHERE control_id = '14.5' AND framework_name = 'CIS Controls';

-- Update 14.6
UPDATE requirements_library 
SET 
  title = 'Train Workforce Members on Recognizing and Reporting Security Incidents',
  description = 'Train workforce members to be able to recognize a potential incident and be able to report such an incident.',
  updated_at = NOW()
WHERE control_id = '14.6' AND framework_name = 'CIS Controls';

-- Update 14.7
UPDATE requirements_library 
SET 
  title = 'Train Workforce on How to Identify and Report if Their Enterprise Assets are Missing Security Updates',
  description = 'Train workforce to be able to recognize if their enterprise assets are missing security updates, and be able to report such a situation.',
  updated_at = NOW()
WHERE control_id = '14.7' AND framework_name = 'CIS Controls';

-- Update 14.8
UPDATE requirements_library 
SET 
  title = 'Train Workforce on the Dangers of Connecting to and Transmitting Enterprise Data Over Insecure Networks',
  description = 'Train workforce members on the dangers of connecting to, and transmitting data over, insecure networks for enterprise activities. If the enterprise has remote workers, training must include guidance to ensure that all users securely configure their home network infrastructure.',
  updated_at = NOW()
WHERE control_id = '14.8' AND framework_name = 'CIS Controls';

-- Update 15.1
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain an Inventory of Authorized Service Providers',
  description = 'Establish and maintain an inventory of authorized service providers. The inventory is to list all approved service providers, vendor type, date of vendor approval, nature of services provided, and approved by authority. Review and update the inventory annually, or when significant enterprise changes occur that could impact this Safeguard.',
  updated_at = NOW()
WHERE control_id = '15.1' AND framework_name = 'CIS Controls';

-- Update 16.1
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain a Secure Application Development Process',
  description = 'Establish and maintain a secure application development process. In the process, address such items as: secure application design standards, secure coding practices, developer training requirements, application security testing requirements, application security testing requirement types and frequency, application security testing requirements for third-party components, secure application deployment standards, and application security testing requirements for updates. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  updated_at = NOW()
WHERE control_id = '16.1' AND framework_name = 'CIS Controls';

-- Update 17.1
UPDATE requirements_library 
SET 
  title = 'Designate Personnel to Manage Incident Handling',
  description = 'Designate one key person, and at least one backup, who will manage the enterprise''s incident handling process. Management personnel are responsible for the coordination and documentation of incident response and recovery efforts and can consist of employees of the enterprise, third-party vendors, or a hybrid approach. If using a third-party vendor, designate at least one person internal to the enterprise to oversee any third-party work. Review annually, or when significant enterprise changes occur that could impact this Safeguard.',
  updated_at = NOW()
WHERE control_id = '17.1' AND framework_name = 'CIS Controls';

-- Update 17.2
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain Contact Information for Reporting Security Incidents',
  description = 'Establish and maintain contact information for parties that need to be informed of security incidents. Contacts may include internal staff, third-party vendors, law enforcement, cyber insurance providers, relevant government agencies, Information Sharing and Analysis Center (ISAC) partners, or Information Sharing and Analysis Organization (ISAO) partners. Verify contacts annually to ensure that information is up-to-date.',
  updated_at = NOW()
WHERE control_id = '17.2' AND framework_name = 'CIS Controls';

-- Update 17.3
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain an Enterprise Process for Reporting Incidents',
  description = 'Establish and maintain an enterprise process for the workforce to report suspected cybersecurity incidents. The process includes reporting timeframe, personnel to report to, mechanism for reporting, and the minimum information to be reported. Ensure the workforce is trained on the process and equipped with the necessary information to report incidents. Review annually, or when significant enterprise changes occur that could impact this Safeguard.',
  updated_at = NOW()
WHERE control_id = '17.3' AND framework_name = 'CIS Controls';

-- Update 18.1
UPDATE requirements_library 
SET 
  title = 'Establish and Maintain a Penetration Testing Program',
  description = 'Establish and maintain a penetration testing program appropriate to the size, complexity, and maturity of the enterprise. Penetration testing program characteristics include scope, such as network, web application, Application Programming Interface (API), hosted services, and physical premise controls; frequency; limitations, such as acceptable hours, and excluded attack types; point of contact information; remediation, such as how findings will be routed internally; and retrospective requirements.',
  updated_at = NOW()
WHERE control_id = '18.1' AND framework_name = 'CIS Controls';