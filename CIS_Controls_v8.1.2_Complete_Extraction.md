# CIS Controls Version 8.1.2 - Complete Requirements Extraction

## Overview
This document contains the complete extraction of all CIS Controls Version 8.1.2 requirements from the official Excel document. The controls are organized by chapters/domains with their safeguards, descriptions, and Implementation Group (IG) classifications.

**Total Controls:** 18  
**Total Safeguards:** 153  
**Implementation Groups:** IG1, IG2, IG3

---

## Control 1: Inventory and Control of Enterprise Assets

### 1.1: Establish and Maintain Detailed Enterprise Asset Inventory

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Establish and maintain an accurate, detailed, and up-to-date inventory of all enterprise assets with the potential to store or process data, to include: end-user devices (including portable and mobile), network devices, non-computing/IoT devices, and servers. Ensure the inventory records the network address (if static), hardware address, machine name, enterprise asset owner, department for each asset, and whether the asset has been approved to connect to the network. For mobile end-user devices, MDM type tools can support this process, where appropriate. This inventory includes assets connected to the infrastructure physically, virtually, remotely, and those within cloud environments. Additionally, it includes assets that are regularly connected to the enterprise's network infrastructure, even if they are not under control of the enterprise. Review and update the inventory of all enterprise assets bi-annually, or more frequently.

---

### 1.2: Address Unauthorized Assets

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Ensure that a process exists to address unauthorized assets on a weekly basis. The enterprise may choose to remove the asset from the network, deny the asset from connecting remotely to the network, or quarantine the asset.

---

### 1.3: Utilize an Active Discovery Tool

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Utilize an active discovery tool to identify assets connected to the enterprise's network. Configure the active discovery tool to execute daily, or more frequently.

---

### 1.4: Use Dynamic Host Configuration Protocol (DHCP) Logging to Update Enterprise Asset Inventory

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Use DHCP logging on all DHCP servers or Internet Protocol (IP) address management tools to update the enterprise's asset inventory. Review and use logs to update the enterprise's asset inventory weekly, or more frequently.

---

### 1.5: Use a Passive Asset Discovery Tool

**Implementation Groups:** IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Use a passive discovery tool to identify assets connected to the enterprise's network. Review and use scans to update the enterprise's asset inventory at least weekly, or more frequently.

---

## Control 2: Inventory and Control of Software Assets

### 2.1: Establish and Maintain a Software Inventory

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Establish and maintain a detailed inventory of all licensed software installed on enterprise assets. The software inventory must document the title, publisher, initial install/use date, and business purpose for each entry; where appropriate, include the Uniform Resource Locator (URL), app store(s), version(s), deployment mechanism, decommission date, and number of licenses. Review and update the software inventory bi-annually, or more frequently.

---

### 2.2: Ensure Authorized Software is Currently Supported

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Ensure that only currently supported software is designated as authorized in the software inventory for enterprise assets. If software is unsupported, yet necessary for the fulfillment of the enterprise’s mission, document an exception detailing mitigating controls and residual risk acceptance. For any unsupported software without an exception documentation, designate as unauthorized. Review the software list to verify software support at least monthly, or more frequently.

---

### 2.3: Address Unauthorized Software

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Ensure that unauthorized software is either removed from use on enterprise assets or receives a documented exception. Review monthly, or more frequently.

---

### 2.4: Utilize Automated Software Inventory Tools

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Utilize software inventory tools, when possible, throughout the enterprise to automate the discovery and documentation of installed software.

---

### 2.5: Allowlist Authorized Software

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Use technical controls, such as application allowlisting, to ensure that only authorized software can execute or be accessed. Reassess bi-annually, or more frequently.

---

### 2.6: Allowlist Authorized Libraries

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Use technical controls to ensure that only authorized software libraries, such as specific .dll, .ocx, and .so files, are allowed to load into a system process. Block unauthorized libraries from loading into a system process. Reassess bi-annually, or more frequently.

---

### 2.7: Allowlist Authorized Scripts

**Implementation Groups:** IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Use technical controls, such as digital signatures and version control, to ensure that only authorized scripts, such as specific .ps1 and .py files, are allowed to execute. Block unauthorized scripts from executing. Reassess bi-annually, or more frequently.

---

## Control 3: Data Protection

### 3.1: Establish and Maintain a Data Management Process

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Establish and maintain a documented data management process. In the process, address data sensitivity, data owner, handling of data, data retention limits, and disposal requirements, based on sensitivity and retention standards for the enterprise. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.

---

### 3.2: Establish and Maintain a Data Inventory

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Establish and maintain a data inventory based on the enterprise’s data management process. Inventory sensitive data, at a minimum. Review and update inventory annually, at a minimum, with a priority on sensitive data.

---

### 3.3: Configure Data Access Control Lists

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Configure data access control lists based on a user’s need to know. Apply data access control lists, also known as access permissions, to local and remote file systems, databases, and applications.

---

### 3.4: Enforce Data Retention

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Retain data according to the enterprise’s documented data management process. Data retention must include both minimum and maximum timelines.

---

### 3.5: Securely Dispose of Data

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Securely dispose of data as outlined in the enterprise’s documented data management process. Ensure the disposal process and method are commensurate with the data sensitivity.

---

### 3.6: Encrypt Data on End-User Devices

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Encrypt data on end-user devices containing sensitive data. Example implementations can include: Windows BitLocker®, Apple FileVault®, Linux® dm-crypt.

---

### 3.7: Establish and Maintain a Data Classification Scheme

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Establish and maintain an overall data classification scheme for the enterprise. Enterprises may use labels, such as “Sensitive,” “Confidential,” and “Public,” and classify their data according to those labels. Review and update the classification scheme annually, or when significant enterprise changes occur that could impact this Safeguard.

---

### 3.8: Document Data Flows

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Document data flows. Data flow documentation includes service provider data flows and should be based on the enterprise’s data management process. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.

---

### 3.9: Encrypt Data on Removable Media

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Encrypt data on removable media.

---

### 3.10: Encrypt Sensitive Data in Transit

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Encrypt sensitive data in transit. Example implementations can include: Transport Layer Security (TLS) and Open Secure Shell (OpenSSH).

---

### 3.11: Encrypt Sensitive Data at Rest

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Encrypt sensitive data at rest on servers, applications, and databases. Storage-layer encryption, also known as server-side encryption, meets the minimum requirement of this Safeguard. Additional encryption methods may include application-layer encryption, also known as client-side encryption, where access to the data storage device(s) does not permit access to the plain-text data.

---

### 3.12: Segment Data Processing and Storage Based on Sensitivity

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Segment data processing and storage based on the sensitivity of the data. Do not process sensitive data on enterprise assets intended for lower sensitivity data.

---

### 3.13: Deploy a Data Loss Prevention Solution

**Implementation Groups:** IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Implement an automated tool, such as a host-based Data Loss Prevention (DLP) tool to identify all sensitive data stored, processed, or transmitted through enterprise assets, including those located onsite or at a remote service provider, and update the enterprise's data inventory.

---

### 3.14: Log Sensitive Data Access

**Implementation Groups:** IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Log sensitive data access, including modification and disposal.

---

## Control 4: Secure Configuration of Enterprise Assets and Software

### 4.1: Establish and Maintain a Secure Configuration Process

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Documentation  
**Security Function:**   

**Description:** Establish and maintain a documented secure configuration process for enterprise assets (end-user devices, including portable and mobile, non-computing/IoT devices, and servers) and software (operating systems and applications). Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.

---

### 4.2: Establish and Maintain a Secure Configuration Process for Network Infrastructure

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Documentation  
**Security Function:**   

**Description:** Establish and maintain a documented secure configuration process for network devices. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.

---

### 4.3: Configure Automatic Session Locking on Enterprise Assets

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Configure automatic session locking on enterprise assets after a defined period of inactivity. For general purpose operating systems, the period must not exceed 15 minutes. For mobile end-user devices, the period must not exceed 2 minutes.

---

### 4.4: Implement and Manage a Firewall on Servers

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Implement and manage a firewall on servers, where supported. Example implementations include a virtual firewall, operating system firewall, or a third-party firewall agent.

---

### 4.5: Implement and Manage a Firewall on End-User Devices

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Implement and manage a host-based firewall or port-filtering tool on end-user devices, with a default-deny rule that drops all traffic except those services and ports that are explicitly allowed.

---

### 4.6: Securely Manage Enterprise Assets and Software

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Securely manage enterprise assets and software. Example implementations include managing configuration through version-controlled Infrastructure-as-Code (IaC) and accessing administrative interfaces over secure network protocols, such as Secure Shell (SSH) and Hypertext Transfer Protocol Secure (HTTPS). Do not use insecure management protocols, such as Telnet (Teletype Network) and HTTP, unless operationally essential.

---

### 4.7: Manage Default Accounts on Enterprise Assets and Software

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Manage default accounts on enterprise assets and software, such as root, administrator, and other pre-configured vendor accounts. Example implementations can include: disabling default accounts or making them unusable.

---

### 4.8: Uninstall or Disable Unnecessary Services on Enterprise Assets and Software

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Uninstall or disable unnecessary services on enterprise assets and software, such as an unused file sharing service, web application module, or service function.

---

### 4.9: Configure Trusted DNS Servers on Enterprise Assets

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Configure trusted DNS servers on network infrastructure. Example implementations include configuring network devices to use enterprise-controlled DNS servers and/or reputable externally accessible DNS servers.

---

### 4.10: Enforce Automatic Device Lockout on Portable End-User Devices

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Enforce automatic device lockout following a predetermined threshold of local failed authentication attempts on portable end-user devices, where supported. For laptops, do not allow more than 20 failed authentication attempts; for tablets and smartphones, no more than 10 failed authentication attempts. Example implementations include Microsoft® InTune Device Lock and Apple® Configuration Profile maxFailedAttempts.

---

### 4.11: Enforce Remote Wipe Capability on Portable End-User Devices

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Remotely wipe enterprise data from enterprise-owned portable end-user devices when deemed appropriate such as lost or stolen devices, or when an individual no longer supports the enterprise.

---

### 4.12: Separate Enterprise Workspaces on Mobile End-User Devices

**Implementation Groups:** IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Ensure separate enterprise workspaces are used on mobile end-user devices, where supported. Example implementations include using an Apple® Configuration Profile or Android™ Work Profile to separate enterprise applications and data from personal applications and data.

---

## Control 5: Account Management

### 5.1: Establish and Maintain an Inventory of Accounts

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Establish and maintain an inventory of all accounts managed in the enterprise. The inventory must at a minimum include user, administrator, and service accounts. The inventory, at a minimum, should contain the person’s name, username, start/stop dates, and department. Validate that all active accounts are authorized, on a recurring schedule at a minimum quarterly, or more frequently.

---

### 5.2: Use Unique Passwords

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Use unique passwords for all enterprise assets. Best practice implementation includes, at a minimum, an 8-character password for accounts using Multi-Factor Authentication (MFA) and a 14-character password for accounts not using MFA.

---

### 5.3: Disable Dormant Accounts

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Delete or disable any dormant accounts after a period of 45 days of inactivity, where supported.

---

### 5.4: Restrict Administrator Privileges to Dedicated Administrator Accounts

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Restrict administrator privileges to dedicated administrator accounts on enterprise assets. Conduct general computing activities, such as internet browsing, email, and productivity suite use, from the user’s primary, non-privileged account.

---

### 5.5: Establish and Maintain an Inventory of Service Accounts

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Establish and maintain an inventory of service accounts. The inventory, at a minimum, must contain department owner, review date, and purpose. Perform service account reviews to validate that all active accounts are authorized, on a recurring schedule at a minimum quarterly, or more frequently.

---

### 5.6: Centralize Account Management

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Centralize account management through a directory or identity service.

---

## Control 6: Access Control Management

### 6.1: Establish an Access Granting Process

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Documentation  
**Security Function:**   

**Description:** Establish and follow a documented process, preferably automated, for granting access to enterprise assets upon new hire or role change of a user.

---

### 6.2: Establish an Access Revoking Process

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Documentation  
**Security Function:**   

**Description:** Establish and follow a process, preferably automated, for revoking access to enterprise assets, through disabling accounts immediately upon termination, rights revocation, or role change of a user. Disabling accounts, instead of deleting accounts, may be necessary to preserve audit trails.

---

### 6.3: Require MFA for Externally-Exposed Applications

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Require all externally-exposed enterprise or third-party applications to enforce MFA, where supported. Enforcing MFA through a directory service or SSO provider is a satisfactory implementation of this Safeguard.

---

### 6.4: Require MFA for Remote Network Access

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Require MFA for remote network access.

---

### 6.5: Require MFA for Administrative Access

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Require MFA for all administrative access accounts, where supported, on all enterprise assets, whether managed on-site or through a service provider.

---

### 6.6: Establish and Maintain an Inventory of Authentication and Authorization Systems

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Establish and maintain an inventory of the enterprise’s authentication and authorization systems, including those hosted on-site or at a remote service provider. Review and update the inventory, at a minimum, annually, or more frequently.

---

### 6.7: Centralize Access Control

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Centralize access control for all enterprise assets through a directory service or SSO provider, where supported.

---

### 6.8: Define and Maintain Role-Based Access Control

**Implementation Groups:** IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Define and maintain role-based access control, through determining and documenting the access rights necessary for each role within the enterprise to successfully carry out its assigned duties. Perform access control reviews of enterprise assets to validate that all privileges are authorized, on a recurring schedule at a minimum annually, or more frequently.

---

## Control 7: Continuous Vulnerability Management

### 7.1: Establish and Maintain a Vulnerability Management Process

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Documentation  
**Security Function:**   

**Description:** Establish and maintain a documented vulnerability management process for enterprise assets. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.

---

### 7.2: Establish and Maintain a Remediation Process

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Documentation  
**Security Function:**   

**Description:** Establish and maintain a risk-based remediation strategy documented in a remediation process, with monthly, or more frequent, reviews.

---

### 7.3: Perform Automated Operating System Patch Management

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Perform operating system updates on enterprise assets through automated patch management on a monthly, or more frequent, basis.

---

### 7.4: Perform Automated Application Patch Management

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Perform application updates on enterprise assets through automated patch management on a monthly, or more frequent, basis.

---

### 7.5: Perform Automated Vulnerability Scans of Internal Enterprise Assets

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Perform automated vulnerability scans of internal enterprise assets on a quarterly, or more frequent, basis. Conduct both authenticated and unauthenticated scans.

---

### 7.6: Perform Automated Vulnerability Scans of Externally-Exposed Enterprise Assets

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Perform automated vulnerability scans of externally-exposed enterprise assets. Perform scans on a monthly, or more frequent, basis.

---

### 7.7: Remediate Detected Vulnerabilities

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Remediate detected vulnerabilities in software through processes and tooling on a monthly, or more frequent, basis, based on the remediation process.

---

## Control 8: Audit Log Management

### 8.1: Establish and Maintain an Audit Log Management Process

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Documentation  
**Security Function:**   

**Description:** Establish and maintain a documented audit log management process that defines the enterprise’s logging requirements. At a minimum, address the collection, review, and retention of audit logs for enterprise assets. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.

---

### 8.2: Collect Audit Logs

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Collect audit logs. Ensure that logging, per the enterprise’s audit log management process, has been enabled across enterprise assets.

---

### 8.3: Ensure Adequate Audit Log Storage

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Ensure that logging destinations maintain adequate storage to comply with the enterprise’s audit log management process.

---

### 8.4: Standardize Time Synchronization

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Network  
**Security Function:**   

**Description:** Standardize time synchronization. Configure at least two synchronized time sources across enterprise assets, where supported.

---

### 8.5: Collect Detailed Audit Logs

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Configure detailed audit logging for enterprise assets containing sensitive data. Include event source, date, username, timestamp, source addresses, destination addresses, and other useful elements that could assist in a forensic investigation.

---

### 8.6: Collect DNS Query Audit Logs

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Collect DNS query audit logs on enterprise assets, where appropriate and supported.

---

### 8.7: Collect URL Request Audit Logs

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Collect URL request audit logs on enterprise assets, where appropriate and supported.

---

### 8.8: Collect Command-Line Audit Logs

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Collect command-line audit logs. Example implementations include collecting audit logs from PowerShell®, BASH™, and remote administrative terminals.

---

### 8.9: Centralize Audit Logs

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Centralize, to the extent possible, audit log collection and retention across enterprise assets in accordance with the documented audit log management process. Example implementations primarily include leveraging a SIEM tool to centralize multiple log sources.

---

### 8.10: Retain Audit Logs

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Retain audit logs across enterprise assets for a minimum of 90 days.

---

### 8.11: Conduct Audit Log Reviews

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Conduct reviews of audit logs to detect anomalies or abnormal events that could indicate a potential threat. Conduct reviews on a weekly, or more frequent, basis.

---

### 8.12: Collect Service Provider Logs

**Implementation Groups:** IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Collect service provider logs, where supported. Example implementations include collecting authentication and authorization events, data creation and disposal events, and user management events.

---

## Control 9: Email and Web Browser Protections

### 9.1: Ensure Use of Only Fully Supported Browsers and Email Clients

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Ensure only fully supported browsers and email clients are allowed to execute in the enterprise, only using the latest version of browsers and email clients provided through the vendor.

---

### 9.2: Use DNS Filtering Services

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Use DNS filtering services on all end-user devices, including remote and on-premises assets, to block access to known malicious domains.

---

### 9.3: Maintain and Enforce Network-Based URL Filters

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Network  
**Security Function:**   

**Description:** Enforce and update network-based URL filters to limit an enterprise asset from connecting to potentially malicious or unapproved websites. Example implementations include category-based filtering, reputation-based filtering, or through the use of block lists. Enforce filters for all enterprise assets.

---

### 9.4: Restrict Unnecessary or Unauthorized Browser and Email Client Extensions

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Restrict, either through uninstalling or disabling, any unauthorized or unnecessary browser or email client plugins, extensions, and add-on applications.

---

### 9.5: Implement DMARC

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Network  
**Security Function:**   

**Description:** To lower the chance of spoofed or modified emails from valid domains, implement DMARC policy and verification, starting with implementing the Sender Policy Framework (SPF) and the DomainKeys Identified Mail (DKIM) standards.

---

### 9.6: Block Unnecessary File Types

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Network  
**Security Function:**   

**Description:** Block unnecessary file types attempting to enter the enterprise’s email gateway.

---

### 9.7: Deploy and Maintain Email Server Anti-Malware Protections

**Implementation Groups:** IG3  
**Asset Class:** Network  
**Security Function:**   

**Description:** Deploy and maintain email server anti-malware protections, such as attachment scanning and/or sandboxing.

---

## Control 10: Malware Defenses

### 10.1: Deploy and Maintain Anti-Malware Software

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Deploy and maintain anti-malware software on all enterprise assets.

---

### 10.2: Configure Automatic Anti-Malware Signature Updates

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Configure automatic updates for anti-malware signature files on all enterprise assets.

---

### 10.3: Disable Autorun and Autoplay for Removable Media

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Disable autorun and autoplay auto-execute functionality for removable media.

---

### 10.4: Configure Automatic Anti-Malware Scanning of Removable Media

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Configure anti-malware software to automatically scan removable media.

---

### 10.5: Enable Anti-Exploitation Features

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Enable anti-exploitation features on enterprise assets and software, where possible, such as Microsoft® Data Execution Prevention (DEP), Windows® Defender Exploit Guard (WDEG), or Apple® System Integrity Protection (SIP) and Gatekeeper™.

---

### 10.6: Centrally Manage Anti-Malware Software

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Centrally manage anti-malware software.

---

### 10.7: Use Behavior-Based Anti-Malware Software

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Use behavior-based anti-malware software.

---

## Control 11: Data Recovery

### 11.1: Establish and Maintain a Data Recovery Process

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Documentation  
**Security Function:**   

**Description:** Establish and maintain a documented data recovery process that includes detailed backup procedures. In the process, address the scope of data recovery activities, recovery prioritization, and the security of backup data. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.

---

### 11.2: Perform Automated Backups

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Perform automated backups of in-scope enterprise assets. Run backups weekly, or more frequently, based on the sensitivity of the data.

---

### 11.3: Protect Recovery Data

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Protect recovery data with equivalent controls to the original data. Reference encryption or data separation, based on requirements.

---

### 11.4: Establish and Maintain an Isolated Instance of Recovery Data

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Establish and maintain an isolated instance of recovery data. Example implementations include, version controlling backup destinations through offline, cloud, or off-site systems or services.

---

### 11.5: Test Data Recovery

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Test backup recovery quarterly, or more frequently, for a sampling of in-scope enterprise assets.

---

## Control 12: Network Infrastructure Management

### 12.1: Ensure Network Infrastructure is Up-to-Date

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Network  
**Security Function:**   

**Description:** Ensure network infrastructure is kept up-to-date. Example implementations include running the latest stable release of software and/or using currently supported network as a service (NaaS) offerings. Review software versions monthly, or more frequently, to verify software support.

---

### 12.2: Establish and Maintain a Secure Network Architecture

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Network  
**Security Function:**   

**Description:** Design and maintain a secure network architecture. A secure network architecture must address segmentation, least privilege, and availability, at a minimum. Example implementations may include documentation, policy, and design components.

---

### 12.3: Securely Manage Network Infrastructure

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Network  
**Security Function:**   

**Description:** Securely manage network infrastructure. Example implementations include version-controlled Infrastructure-as-Code (IaC), and the use of secure network protocols, such as SSH and HTTPS.

---

### 12.4: Establish and Maintain Architecture Diagram(s)

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Documentation  
**Security Function:**   

**Description:** Establish and maintain architecture diagram(s) and/or other network system documentation. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.

---

### 12.5: Centralize Network Authentication, Authorization, and Auditing (AAA)

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Network  
**Security Function:**   

**Description:** Centralize network AAA.

---

### 12.6: Use of Secure Network Management and Communication Protocols

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Network  
**Security Function:**   

**Description:** Adopt secure network management protocols (e.g., 802.1X) and secure communication protocols (e.g., Wi-Fi Protected Access 2 (WPA2) Enterprise or more secure alternatives).

---

### 12.7: Ensure Remote Devices Utilize a VPN and are Connecting to an Enterprise’s AAA Infrastructure

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Require users to authenticate to enterprise-managed VPN and authentication services prior to accessing enterprise resources on end-user devices.

---

### 12.8: Establish and Maintain Dedicated Computing Resources for All Administrative Work

**Implementation Groups:** IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Establish and maintain dedicated computing resources, either physically or logically separated, for all administrative tasks or tasks requiring administrative access. The computing resources should be segmented from the enterprise's primary network and not be allowed internet access.

---

## Control 13: Network Monitoring and Defense

### 13.1: Centralize Security Event Alerting

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Network  
**Security Function:**   

**Description:** Centralize security event alerting across enterprise assets for log correlation and analysis. Best practice implementation requires the use of a SIEM, which includes vendor-defined event correlation alerts. A log analytics platform configured with security-relevant correlation alerts also satisfies this Safeguard.

---

### 13.2: Deploy a Host-Based Intrusion Detection Solution

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Deploy a host-based intrusion detection solution on enterprise assets, where appropriate and/or supported.

---

### 13.3: Deploy a Network Intrusion Detection Solution

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Network  
**Security Function:**   

**Description:** Deploy a network intrusion detection solution on enterprise assets, where appropriate. Example implementations include the use of a Network Intrusion Detection System (NIDS) or equivalent cloud service provider (CSP) service.

---

### 13.4: Perform Traffic Filtering Between Network Segments

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Network  
**Security Function:**   

**Description:** Perform traffic filtering between network segments, where appropriate.

---

### 13.5: Manage Access Control for Remote Assets

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Manage access control for assets remotely connecting to enterprise resources. Determine amount of access to enterprise resources based on: up-to-date anti-malware software installed, configuration compliance with the enterprise’s secure configuration process, and ensuring the operating system and applications are up-to-date.

---

### 13.6: Collect Network Traffic Flow Logs

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Network  
**Security Function:**   

**Description:** Collect network traffic flow logs and/or network traffic to review and alert upon from network devices.

---

### 13.7: Deploy a Host-Based Intrusion Prevention Solution

**Implementation Groups:** IG3  
**Asset Class:** Devices  
**Security Function:**   

**Description:** Deploy a host-based intrusion prevention solution on enterprise assets, where appropriate and/or supported. Example implementations include use of an Endpoint Detection and Response (EDR) client or host-based IPS agent.

---

### 13.8: Deploy a Network Intrusion Prevention Solution

**Implementation Groups:** IG3  
**Asset Class:** Network  
**Security Function:**   

**Description:** Deploy a network intrusion prevention solution, where appropriate. Example implementations include the use of a Network Intrusion Prevention System (NIPS) or equivalent CSP service.

---

### 13.9: Deploy Port-Level Access Control

**Implementation Groups:** IG3  
**Asset Class:** Network  
**Security Function:**   

**Description:** Deploy port-level access control. Port-level access control utilizes 802.1x, or similar network access control protocols, such as certificates, and may incorporate user and/or device authentication.

---

### 13.10: Perform Application Layer Filtering

**Implementation Groups:** IG3  
**Asset Class:** Network  
**Security Function:**   

**Description:** Perform application layer filtering. Example implementations include a filtering proxy, application layer firewall, or gateway.

---

### 13.11: Tune Security Event Alerting Thresholds

**Implementation Groups:** IG3  
**Asset Class:** Network  
**Security Function:**   

**Description:** Tune security event alerting thresholds monthly, or more frequently.

---

## Control 14: Security Awareness and Skills Training

### 14.1: Establish and Maintain a Security Awareness Program

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Documentation  
**Security Function:**   

**Description:** Establish and maintain a security awareness program. The purpose of a security awareness program is to educate the enterprise’s workforce on how to interact with enterprise assets and data in a secure manner. Conduct training at hire and, at a minimum, annually. Review and update content annually, or when significant enterprise changes occur that could impact this Safeguard.

---

### 14.2: Train Workforce Members to Recognize Social Engineering Attacks

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Train workforce members to recognize social engineering attacks, such as phishing, business email compromise (BEC), pretexting, and tailgating.

---

### 14.3: Train Workforce Members on Authentication Best Practices

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Train workforce members on authentication best practices. Example topics include MFA, password composition, and credential management.

---

### 14.4: Train Workforce on Data Handling Best Practices

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Train workforce members on how to identify and properly store, transfer, archive, and destroy sensitive data. This also includes training workforce members on clear screen and desk best practices, such as locking their screen when they step away from their enterprise asset, erasing physical and virtual whiteboards at the end of meetings, and storing data and assets securely.

---

### 14.5: Train Workforce Members on Causes of Unintentional Data Exposure

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Train workforce members to be aware of causes for unintentional data exposure. Example topics include mis-delivery of sensitive data, losing a portable end-user device, or publishing data to unintended audiences.

---

### 14.6: Train Workforce Members on Recognizing and Reporting Security Incidents

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Train workforce members to be able to recognize a potential incident and be able to report such an incident.

---

### 14.7: Train Workforce on How to Identify and Report if Their Enterprise Assets are Missing Security Updates

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Train workforce to understand how to verify and report out-of-date software patches or any failures in automated processes and tools. Part of this training should include notifying IT personnel of any failures in automated processes and tools.

---

### 14.8: Train Workforce on the Dangers of Connecting to and Transmitting Enterprise Data Over Insecure Networks

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Train workforce members on the dangers of connecting to, and transmitting data over, insecure networks for enterprise activities. If the enterprise has remote workers, training must include guidance to ensure that all users securely configure their home network infrastructure.

---

### 14.9: Conduct Role-Specific Security Awareness and Skills Training

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Conduct role-specific security awareness and skills training. Example implementations include secure system administration courses for IT professionals, OWASP® Top 10 vulnerability awareness and prevention training for web application developers, and advanced social engineering awareness training for high-profile roles.

---

## Control 15: Service Provider Management

### 15.1: Establish and Maintain an Inventory of Service Providers

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Establish and maintain an inventory of service providers. The inventory is to list all known service providers, include classification(s), and designate an enterprise contact for each service provider. Review and update the inventory annually, or when significant enterprise changes occur that could impact this Safeguard.

---

### 15.2: Establish and Maintain a Service Provider Management Policy

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Documentation  
**Security Function:**   

**Description:** Establish and maintain a service provider management policy. Ensure the policy addresses the classification, inventory, assessment, monitoring, and decommissioning of service providers. Review and update the policy annually, or when significant enterprise changes occur that could impact this Safeguard.

---

### 15.3: Classify Service Providers

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Classify service providers. Classification consideration may include one or more characteristics, such as data sensitivity, data volume, availability requirements, applicable regulations, inherent risk, and mitigated risk. Update and review classifications annually, or when significant enterprise changes occur that could impact this Safeguard.

---

### 15.4: Ensure Service Provider Contracts Include Security Requirements

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Documentation  
**Security Function:**   

**Description:** Ensure service provider contracts include security requirements. Example requirements may include minimum security program requirements, security incident and/or data breach notification and response, data encryption requirements, and data disposal commitments. These security requirements must be consistent with the enterprise’s service provider management policy. Review service provider contracts annually to ensure contracts are not missing security requirements.

---

### 15.5: Assess Service Providers

**Implementation Groups:** IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Assess service providers consistent with the enterprise’s service provider management policy. Assessment scope may vary based on classification(s), and may include review of standardized assessment reports, such as Service Organization Control 2 (SOC 2) and Payment Card Industry (PCI) Attestation of Compliance (AoC), customized questionnaires, or other appropriately rigorous processes. Reassess service providers annually, at a minimum, or with new and renewed contracts.

---

### 15.6: Monitor Service Providers

**Implementation Groups:** IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Monitor service providers consistent with the enterprise’s service provider management policy. Monitoring may include periodic reassessment of service provider compliance, monitoring service provider release notes, and dark web monitoring.

---

### 15.7: Securely Decommission Service Providers

**Implementation Groups:** IG3  
**Asset Class:** Data  
**Security Function:**   

**Description:** Securely decommission service providers. Example considerations include user and service account deactivation, termination of data flows, and secure disposal of enterprise data within service provider systems.

---

## Control 16: Application Software Security

### 16.1: Establish and Maintain a Secure Application Development Process

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Documentation  
**Security Function:**   

**Description:** Establish and maintain a secure application development process. In the process, address such items as: secure application design standards, secure coding practices, developer training, vulnerability management, security of third-party code, and application security testing procedures. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.

---

### 16.2: Establish and Maintain a Process to Accept and Address Software Vulnerabilities

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Documentation  
**Security Function:**   

**Description:** Establish and maintain a process to accept and address reports of software vulnerabilities, including providing a means for external entities to report. The process is to include such items as: a vulnerability handling policy that identifies reporting process, responsible party for handling vulnerability reports, and a process for intake, assignment, remediation, and remediation testing. As part of the process, use a vulnerability tracking system that includes severity ratings and metrics for measuring timing for identification, analysis, and remediation of vulnerabilities. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.

Third-party application developers need to consider this an externally-facing policy that helps to set expectations for outside stakeholders.

---

### 16.3: Perform Root Cause Analysis on Security Vulnerabilities

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Perform root cause analysis on security vulnerabilities. When reviewing vulnerabilities, root cause analysis is the task of evaluating underlying issues that create vulnerabilities in code, and allows development teams to move beyond just fixing individual vulnerabilities as they arise.

---

### 16.4: Establish and Manage an Inventory of Third-Party Software Components

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Establish and manage an updated inventory of third-party components used in development, often referred to as a “bill of materials,” as well as components slated for future use. This inventory is to include any risks that each third-party component could pose. Evaluate the list at least monthly to identify any changes or updates to these components, and validate that the component is still supported.

---

### 16.5: Use Up-to-Date and Trusted Third-Party Software Components

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Use up-to-date and trusted third-party software components. When possible, choose established and proven frameworks and libraries that provide adequate security. Acquire these components from trusted sources or evaluate the software for vulnerabilities before use.

---

### 16.6: Establish and Maintain a Severity Rating System and Process for Application Vulnerabilities

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Documentation  
**Security Function:**   

**Description:** Establish and maintain a severity rating system and process for application vulnerabilities that facilitates prioritizing the order in which discovered vulnerabilities are fixed. This process includes setting a minimum level of security acceptability for releasing code or applications. Severity ratings bring a systematic way of triaging vulnerabilities that improves risk management and helps ensure the most severe bugs are fixed first. Review and update the system and process annually.

---

### 16.7: Use Standard Hardening Configuration Templates for Application Infrastructure

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Use standard, industry-recommended hardening configuration templates for application infrastructure components. This includes underlying servers, databases, and web servers, and applies to cloud containers, Platform as a Service (PaaS) components, and SaaS components. Do not allow in-house developed software to weaken configuration hardening.

---

### 16.8: Separate Production and Non-Production Systems

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Network  
**Security Function:**   

**Description:** Maintain separate environments for production and non-production systems.

---

### 16.9: Train Developers in Application Security Concepts and Secure Coding

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Ensure that all software development personnel receive training in writing secure code for their specific development environment and responsibilities. Training can include general security principles and application security standard practices. Conduct training at least annually and design in a way to promote security within the development team, and build a culture of security among the developers.

---

### 16.10: Apply Secure Design Principles in Application Architectures

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Apply secure design principles in application architectures. Secure design principles include the concept of least privilege and enforcing mediation to validate every operation that the user makes, promoting the concept of "never trust user input." Examples include ensuring that explicit error checking is performed and documented for all input, including for size, data type, and acceptable ranges or formats. Secure design also means minimizing the application infrastructure attack surface, such as turning off unprotected ports and services, removing unnecessary programs and files, and renaming or removing default accounts.

---

### 16.11: Leverage Vetted Modules or Services for Application Security Components

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Leverage vetted modules or services for application security components, such as identity management, encryption, auditing, and logging. Using platform features in critical security functions will reduce developers’ workload and minimize the likelihood of design or implementation errors. Modern operating systems provide effective mechanisms for identification, authentication, and authorization and make those mechanisms available to applications. Use only standardized, currently accepted, and extensively reviewed encryption algorithms. Operating systems also provide mechanisms to create and maintain secure audit logs.

---

### 16.12: Implement Code-Level Security Checks

**Implementation Groups:** IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Apply static and dynamic analysis tools within the application life cycle to verify that secure coding practices are being followed.

---

### 16.13: Conduct Application Penetration Testing

**Implementation Groups:** IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Conduct application penetration testing. For critical applications, authenticated penetration testing is better suited to finding business logic vulnerabilities than code scanning and automated security testing. Penetration testing relies on the skill of the tester to manually manipulate an application as an authenticated and unauthenticated user.

---

### 16.14: Conduct Threat Modeling

**Implementation Groups:** IG3  
**Asset Class:** Software  
**Security Function:**   

**Description:** Conduct threat modeling. Threat modeling is the process of identifying and addressing application security design flaws within a design, before code is created. It is conducted through specially trained individuals who evaluate the application design and gauge security risks for each entry point and access level. The goal is to map out the application, architecture, and infrastructure in a structured way to understand its weaknesses.

---

## Control 17: Incident Response Management

### 17.1: Designate Personnel to Manage Incident Handling

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Designate one key person, and at least one backup, who will manage the enterprise’s incident handling process. Management personnel are responsible for the coordination and documentation of incident response and recovery efforts and can consist of employees internal to the enterprise, service providers, or a hybrid approach. If using a service provider, designate at least one person internal to the enterprise to oversee any third-party work. Review annually, or when significant enterprise changes occur that could impact this Safeguard.

---

### 17.2: Establish and Maintain Contact Information for Reporting Security Incidents

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Documentation  
**Security Function:**   

**Description:** Establish and maintain contact information for parties that need to be informed of security incidents. Contacts may include internal staff, service providers, law enforcement, cyber insurance providers, relevant government agencies, Information Sharing and Analysis Center (ISAC) partners, or other stakeholders. Verify contacts annually to ensure that information is up-to-date.

---

### 17.3: Establish and Maintain an Enterprise Process for Reporting Incidents

**Implementation Groups:** IG1 | IG2 | IG3  
**Asset Class:** Documentation  
**Security Function:**   

**Description:** Establish and maintain a documented enterprise process for the workforce to report security incidents. The process includes reporting timeframe, personnel to report to, mechanism for reporting, and the minimum information to be reported. Ensure the process is publicly available to all of the workforce. Review annually, or when significant enterprise changes occur that could impact this Safeguard.

---

### 17.4: Establish and Maintain an Incident Response Process

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Documentation  
**Security Function:**   

**Description:** Establish and maintain a documented incident response process that addresses roles and responsibilities, compliance requirements, and a communication plan. Review annually, or when significant enterprise changes occur that could impact this Safeguard.

---

### 17.5: Assign Key Roles and Responsibilities

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Assign key roles and responsibilities for incident response, including staff from legal, IT, information security, facilities, public relations, human resources, incident responders, analysts, and relevant third parties. Review annually, or when significant enterprise changes occur that could impact this Safeguard.

---

### 17.6: Define Mechanisms for Communicating During Incident Response

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Determine which primary and secondary mechanisms will be used to communicate and report during a security incident. Mechanisms can include phone calls, emails, secure chat, or notification letters. Keep in mind that certain mechanisms, such as emails, can be affected during a security incident. Review annually, or when significant enterprise changes occur that could impact this Safeguard.

---

### 17.7: Conduct Routine Incident Response Exercises

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Plan and conduct routine incident response exercises and scenarios for key personnel involved in the incident response process to prepare for responding to real-world incidents. Exercises need to test communication channels, decision making, and workflows. Conduct testing on an annual basis, at a minimum.

---

### 17.8: Conduct Post-Incident Reviews

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Users  
**Security Function:**   

**Description:** Conduct post-incident reviews. Post-incident reviews help prevent incident recurrence through identifying lessons learned and follow-up action.

---

### 17.9: Establish and Maintain Security Incident Thresholds

**Implementation Groups:** IG3  
**Asset Class:** Documentation  
**Security Function:**   

**Description:** Establish and maintain security incident thresholds, including, at a minimum, differentiating between an incident and an event. Examples can include: abnormal activity, security vulnerability, security weakness, data breach, privacy incident, etc. Review annually, or when significant enterprise changes occur that could impact this Safeguard.

---

## Control 18: Penetration Testing

### 18.1: Establish and Maintain a Penetration Testing Program

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Documentation  
**Security Function:**   

**Description:** Establish and maintain a penetration testing program appropriate to the size, complexity, industry, and maturity of the enterprise. Penetration testing program characteristics include scope, such as network, web application, Application Programming Interface (API), hosted services, and physical premise controls; frequency; limitations, such as acceptable hours, and excluded attack types; point of contact information; remediation, such as how findings will be routed internally; and retrospective requirements.

---

### 18.2: Perform Periodic External Penetration Tests

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Network  
**Security Function:**   

**Description:** Perform periodic external penetration tests based on program requirements, no less than annually. External penetration testing must include enterprise and environmental reconnaissance to detect exploitable information. Penetration testing requires specialized skills and experience and must be conducted through a qualified party. The testing may be clear box or opaque box.

---

### 18.3: Remediate Penetration Test Findings

**Implementation Groups:** IG2 | IG3  
**Asset Class:** Network  
**Security Function:**   

**Description:** Remediate penetration test findings based on the enterprise’s documented vulnerability remediation process. This should include determining a timeline and level of effort based on the impact and prioritization of each identified finding.

---

### 18.4: Validate Security Measures

**Implementation Groups:** IG3  
**Asset Class:** Network  
**Security Function:**   

**Description:** Validate security measures after each penetration test. If deemed necessary, modify rulesets and capabilities to detect the techniques used during testing.

---

### 18.5: Perform Periodic Internal Penetration Tests

**Implementation Groups:** IG3  
**Asset Class:** Network  
**Security Function:**   

**Description:** Perform periodic internal penetration tests based on program requirements, no less than annually. The testing may be clear box or opaque box.

---
