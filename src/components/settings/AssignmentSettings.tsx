import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/utils/toast";
import { Edit, UserPlus } from "lucide-react";

interface AssignmentSettingsProps {
  displayUsers: any[];
  isDemo: boolean;
  RequirementAssignmentInterface: React.ComponentType<{
    users: any[];
    isDemo: boolean;
  }>;
}

export const AssignmentSettings = ({
  displayUsers,
  isDemo,
  RequirementAssignmentInterface
}: AssignmentSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Requirement Assignments</CardTitle>
        <CardDescription>
          Assign requirements to team members based on their roles and expertise
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isDemo && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              📋 Demo Mode: Assignment features are demonstration only. In production, these would create real user assignments.
            </p>
          </div>
        )}

        {/* Enhanced Requirement Assignment Interface */}
        <RequirementAssignmentInterface 
          users={displayUsers}
          isDemo={isDemo}
        />

        <div className="border-t pt-6">
          <h4 className="font-medium mb-4">Current Assignment Rules</h4>
          <div className="space-y-3">
            {isDemo && (
              <>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge style={{ backgroundColor: '#A21CAF20', color: '#A21CAF' }}>Identity</Badge>
                    <span className="text-sm">→ Demo CISO (ciso)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">15 requirements</Badge>
                    <Button size="sm" variant="ghost" onClick={() => {
                      toast.info("Edit assignment rule: Modify which user types should receive these requirements.");
                      // In production, this would open assignment rule editor
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge style={{ backgroundColor: '#3B82F620', color: '#3B82F6' }}>Endpoint</Badge>
                    <span className="text-sm">→ Demo Analyst (analyst)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">12 requirements</Badge>
                    <Button size="sm" variant="ghost" onClick={() => {
                      toast.info("Edit assignment rule: Modify which user types should receive these requirements.");
                      // In production, this would open assignment rule editor
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge style={{ backgroundColor: '#F59E4220', color: '#F59E42' }}>Awareness</Badge>
                    <span className="text-sm">→ Demo Admin (admin)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">8 requirements</Badge>
                    <Button size="sm" variant="ghost" onClick={() => {
                      toast.info("Edit assignment rule: Modify which user types should receive these requirements.");
                      // In production, this would open assignment rule editor
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
            
            {!isDemo && (
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No assignment rules configured yet.</p>
                <p className="text-sm">Create bulk assignments above to get started.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};