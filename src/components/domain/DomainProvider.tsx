import React, { createContext, useContext, useEffect, useState } from 'react';
import { multiDomainService, DomainConfig } from '@/services/domain/MultiDomainService';

interface DomainContextType {
  currentDomain: string;
  organizationId: string | null;
  isCustomDomain: boolean;
  branding: {
    logo?: string;
    primaryColor?: string;
    name?: string;
  };
  routes: { [key: string]: string };
}

const DomainContext = createContext<DomainContextType | undefined>(undefined);

export function DomainProvider({ children }: { children: React.ReactNode }) {
  const [domainConfig, setDomainConfig] = useState<DomainContextType>({
    currentDomain: '',
    organizationId: null,
    isCustomDomain: false,
    branding: {},
    routes: {}
  });

  useEffect(() => {
    const currentDomain = multiDomainService.getCurrentDomain();
    const organizationId = multiDomainService.getOrganizationFromDomain();
    const isCustomDomain = multiDomainService.isCustomDomain();
    const branding = multiDomainService.getDomainBranding();
    const routes = multiDomainService.getDomainSpecificRoutes();

    setDomainConfig({
      currentDomain,
      organizationId,
      isCustomDomain,
      branding,
      routes
    });

    // Set CSS custom properties for domain-specific branding
    if (branding.primaryColor) {
      document.documentElement.style.setProperty('--domain-primary', branding.primaryColor);
    }
  }, []);

  return (
    <DomainContext.Provider value={domainConfig}>
      {children}
    </DomainContext.Provider>
  );
}

export function useDomain() {
  const context = useContext(DomainContext);
  if (context === undefined) {
    throw new Error('useDomain must be used within a DomainProvider');
  }
  return context;
}