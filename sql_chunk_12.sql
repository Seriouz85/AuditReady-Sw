-- Update 8.16: Monitoring activities...\nUPDATE requirements_library SET\n  title = 'Monitoring activities',\n  description = 'Networks, systems and applications shall be monitored for anomalous behavior and appropriate actions taken to evaluate potential information security incidents.',\n  updated_at = NOW()\nWHERE id = '1559ca11-1be2-4c56-ac00-cd07ba50ec14';

-- Update 8.17: Clock synchronization...\nUPDATE requirements_library SET\n  title = 'Clock synchronization',\n  description = 'The clocks of information processing systems used by the organization shall be synchronized to approved time sources.',\n  updated_at = NOW()\nWHERE id = 'b6cf0d8d-a026-4509-a33a-e0fc0172d726';

-- Update 8.18: Use of privileged utility programs...\nUPDATE requirements_library SET\n  title = 'Use of privileged utility programs',\n  description = 'The use of utility programs that can be capable of overriding system and application controls shall be restricted and tightly controlled.',\n  updated_at = NOW()\nWHERE id = '7f99c088-1d52-468b-bf7e-2d7af5e44d47';

-- Update 8.19: Installation of software on operational systems...\nUPDATE requirements_library SET\n  title = 'Installation of software on operational systems',\n  description = 'Procedures shall be implemented to control the installation of software on operational systems.',\n  updated_at = NOW()\nWHERE id = 'b627c34a-6787-40be-a43e-4ac756569b36';

-- Update 8.20: Networks security management...\nUPDATE requirements_library SET\n  title = 'Networks security management',\n  description = 'Networks and network devices shall be managed and controlled to protect information in systems and applications.',\n  updated_at = NOW()\nWHERE id = 'df3e7f11-adb5-42ff-9cee-c9187f38dff9';

-- Update 8.21: Security of network services...\nUPDATE requirements_library SET\n  title = 'Security of network services',\n  description = 'Security mechanisms, service levels and service requirements of network services shall be identified, implemented and monitored.',\n  updated_at = NOW()\nWHERE id = '3304d831-6c84-45b8-aba5-94f474b35c98';

-- Update 8.22: Segregation of networks...\nUPDATE requirements_library SET\n  title = 'Segregation of networks',\n  description = 'Groups of information services, users and information systems shall be segregated in the organization''s networks.',\n  updated_at = NOW()\nWHERE id = '562d1767-ceff-43db-a2d5-40bd40b860c5';

-- Update 8.23: Web filtering...\nUPDATE requirements_library SET\n  title = 'Web filtering',\n  description = 'Access to external websites shall be managed to reduce exposure to malicious content.',\n  updated_at = NOW()\nWHERE id = '87eddce1-fbd5-48fa-b7bf-bcc02edb3614';