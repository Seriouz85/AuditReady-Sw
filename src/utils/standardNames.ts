// Standard ID to name mappings
export const STANDARD_NAMES: Record<string, string> = {
  '55742f4e-769b-4efe-912c-1371de5e1cd6': 'ISO/IEC 27001 (2022)',
  'f4e13e2b-1bcc-4865-913f-084fb5599a00': 'NIS2 Directive (2022)',
  '73869227-cd63-47db-9981-c0d633a3d47b': 'GDPR (2018)',
  '8508cfb0-3457-4226-b39a-851be52ef7ea': 'ISO/IEC 27002 (2022)',
  'afe9728d-2084-4b6b-8653-b04e1e92cdff': 'CIS Controls IG1 (8.1.2)',
  '05501cbc-c463-4668-ae84-9acb1a4d5332': 'CIS Controls IG2 (8.1.2)',
  '8ed562f0-915c-40ad-851e-27f6bddaa54e': 'NIS2 Directive (2022)',
  'b1d9e82f-b0c3-40e2-89d7-4c51e216214e': 'NIST Cybersecurity Framework (1.1)',
  // Legacy string IDs for backward compatibility
  'cis-ig1': 'CIS Controls IG1 - v8.1',
  'cis-ig2': 'CIS Controls IG2 - v8.1',
  'cis-ig3': 'CIS Controls IG3 - v8.1'
};

export function getStandardName(standardId: string, fallback: string = 'Unknown Standard'): string {
  return STANDARD_NAMES[standardId] || fallback;
}
