import React, { useState, useEffect } from 'react';
import { useOrganizations } from '@/hooks/useOrganizations';
import OrgChart from './OrgChart';
import { Organization, OrganizationNode } from '@/types/organization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Settings, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const OrganizationStructureView: React.FC = () => {
  const { organizations, isLoading, error } = useOrganizations();
  const { toast } = useToast();
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  // Handle node click
  const handleNodeClick = (node: OrganizationNode) => {
    // Find the organization in the original data to access all properties
    const org = organizations?.find((o: Organization) => o.id === node.id);
    if (org) {
      setSelectedOrg(org);
      console.log('Selected organization:', org);
    }
  };

  // Handle node edit (for future implementation)
  const handleNodeEdit = (node: OrganizationNode) => {
    toast({
      title: "Edit Organization",
      description: `Editing ${node.name} is not implemented yet.`,
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-[250px]" />
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[600px] flex items-center justify-center">
          <div className="text-center">
            <Skeleton className="h-[400px] w-[600px]" />
            <Skeleton className="h-4 w-[200px] mt-4 mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !organizations) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Organization Structure</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[600px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500">Error loading organization data</p>
            <p>{error?.message || "Unknown error occurred"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Organization Structure</CardTitle>
        <div className="flex space-x-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Info className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>About Organization Chart</SheetTitle>
                <SheetDescription>
                  This chart visualizes your organization structure based on the hierarchy levels 
                  and parent-child relationships defined in your organization list.
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <h3 className="font-medium mb-2">How to use:</h3>
                <ul className="space-y-2 list-disc pl-4">
                  <li>Click on an organization to see its details</li>
                  <li>Use the zoom controls to adjust your view</li>
                  <li>Use the pan button to toggle drag mode</li>
                  <li>The chart is built based on hierarchy level and parent organization settings</li>
                </ul>
              </div>
              {selectedOrg && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium mb-2">Selected Organization:</h3>
                  <p className="font-bold">{selectedOrg.name}</p>
                  <p>Type: {selectedOrg.type}</p>
                  <p>Hierarchy Level: {selectedOrg.hierarchyLevel}</p>
                  {selectedOrg.securityContact && (
                    <p>Security Contact: {selectedOrg.securityContact.name}</p>
                  )}
                </div>
              )}
            </SheetContent>
          </Sheet>
          
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="min-h-[600px]">
        <OrgChart
          organizationList={organizations}
          onNodeClick={handleNodeClick}
          onNodeEdit={handleNodeEdit}
        />
      </CardContent>
    </Card>
  );
};

export default OrganizationStructureView; 