import React from 'react';
import { NextPage } from 'next';
import OrganizationStructureView from './OrganizationStructureView';

const OrganizationStructurePage: NextPage = () => {
  return (
    <div className="container mx-auto py-6">
      <OrganizationStructureView />
    </div>
  );
};

export default OrganizationStructurePage; 