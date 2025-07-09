/**
 * Subdomain routing utility for AuditReady
 * Handles routing for subdomains like docs.auditready.xyz
 */

export const getSubdomain = (): string | null => {
  const hostname = window.location.hostname;
  
  // Handle localhost and development environments
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Check for subdomain simulation via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('subdomain');
  }
  
  // Handle production domains
  const parts = hostname.split('.');
  
  // Check if we have a subdomain (more than 2 parts for .xyz or .com domains)
  if (parts.length > 2) {
    // Return the first part as subdomain
    return parts[0];
  }
  
  return null;
};

export const isDocsSubdomain = (): boolean => {
  const subdomain = getSubdomain();
  return subdomain === 'docs';
};

export const redirectToMainSite = (path: string = '/'): void => {
  const hostname = window.location.hostname;
  
  // Handle localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    window.location.href = `${window.location.protocol}//${hostname}:${window.location.port}${path}`;
    return;
  }
  
  // Handle production - remove subdomain
  const parts = hostname.split('.');
  if (parts.length > 2) {
    parts.shift(); // Remove subdomain
    const mainDomain = parts.join('.');
    window.location.href = `${window.location.protocol}//${mainDomain}${path}`;
  }
};

export const redirectToDocsSubdomain = (): void => {
  const hostname = window.location.hostname;
  
  // Handle localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // For local development, just navigate to /documentation
    window.location.href = '/documentation';
    return;
  }
  
  // Handle production
  const parts = hostname.split('.');
  if (parts.length >= 2 && parts[0] !== 'docs') {
    // Add docs subdomain
    const mainDomain = parts[0] === 'www' ? parts.slice(1).join('.') : hostname;
    window.location.href = `${window.location.protocol}//docs.${mainDomain}`;
  }
};