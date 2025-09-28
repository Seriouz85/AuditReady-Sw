import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search,
  UserPlus,
  Group,
  UserRound,
  Check,
  Loader2
} from 'lucide-react';
import { UserData, GroupData, sampleUsers, sampleGroups } from '../types';

interface TargetingConfigProps {
  targetingTab: 'groups' | 'users';
  selectedUsers: string[];
  selectedGroups: string[];
  userSearchQuery: string;
  groupSearchQuery: string;
  riskFilterLevel: string;
  isEntraConnected: boolean;
  isConnecting: boolean;
  setTargetingTab: (tab: 'groups' | 'users') => void;
  setSelectedUsers: (users: string[]) => void;
  setSelectedGroups: (groups: string[]) => void;
  setUserSearchQuery: (query: string) => void;
  setGroupSearchQuery: (query: string) => void;
  setRiskFilterLevel: (level: string) => void;
  onConnectEntra: () => void;
  onToggleUserSelection: (userId: string) => void;
  onToggleGroupSelection: (groupId: string) => void;
}

export const TargetingConfig: React.FC<TargetingConfigProps> = ({
  targetingTab,
  selectedUsers,
  selectedGroups,
  userSearchQuery,
  groupSearchQuery,
  riskFilterLevel,
  isEntraConnected,
  isConnecting,
  setTargetingTab,
  setUserSearchQuery,
  setGroupSearchQuery,
  setRiskFilterLevel,
  onConnectEntra,
  onToggleUserSelection,
  onToggleGroupSelection
}) => {
  // Filter users based on search and risk level
  const filteredUsers = sampleUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                         user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                         user.department.toLowerCase().includes(userSearchQuery.toLowerCase());
    
    const matchesRisk = riskFilterLevel === 'all' || 
                       (riskFilterLevel === 'high' && user.riskScore && user.riskScore >= 70) ||
                       (riskFilterLevel === 'medium' && user.riskScore && user.riskScore >= 30 && user.riskScore < 70) ||
                       (riskFilterLevel === 'low' && user.riskScore && user.riskScore < 30);
    
    return matchesSearch && matchesRisk;
  });

  // Filter groups based on search
  const filteredGroups = sampleGroups.filter(group => 
    group.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) || 
    group.description.toLowerCase().includes(groupSearchQuery.toLowerCase())
  );

  const getTotalTargetedUsers = () => {
    return selectedGroups.reduce((total, groupId) => {
      const group = sampleGroups.find(g => g.id === groupId);
      return total + (group?.memberCount || 0);
    }, 0);
  };

  return (
    <Card className="p-6 rounded-xl border-0 shadow-lg overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">Target Selection</h2>
          <p className="text-sm text-muted-foreground">Choose users and groups to target with phishing campaigns</p>
        </div>
        
        <Button 
          onClick={onConnectEntra}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
          disabled={isEntraConnected || isConnecting}
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : isEntraConnected ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Connected
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Connect to Microsoft Entra ID
            </>
          )}
        </Button>
      </div>
      
      <div className="mt-6 border-t pt-6">
        <div className="flex gap-2 mb-6">
          <Button
            variant={targetingTab === 'groups' ? 'default' : 'outline'}
            onClick={() => setTargetingTab('groups')}
            className="rounded-xl"
          >
            <Group className="mr-2 h-4 w-4" />
            Groups
          </Button>
          <Button
            variant={targetingTab === 'users' ? 'default' : 'outline'}
            onClick={() => setTargetingTab('users')}
            className="rounded-xl"
          >
            <UserRound className="mr-2 h-4 w-4" />
            Individual Users
          </Button>
        </div>
        
        {targetingTab === 'groups' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search groups by name or description" 
                  className="pl-10 rounded-xl"
                  value={groupSearchQuery}
                  onChange={(e) => setGroupSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="border rounded-xl overflow-hidden">
              <div className="bg-gray-50 p-3 border-b grid grid-cols-12 gap-4 font-medium text-gray-500 text-sm">
                <div className="col-span-1"></div>
                <div className="col-span-3">Name</div>
                <div className="col-span-4">Description</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Members</div>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                {filteredGroups.map(group => (
                  <div key={group.id} className="border-b last:border-none hover:bg-gray-50 transition-colors">
                    <div className="p-3 grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-1">
                        <Checkbox 
                          checked={selectedGroups.includes(group.id)}
                          onCheckedChange={() => onToggleGroupSelection(group.id)}
                        />
                      </div>
                      <div className="col-span-3 font-medium">{group.name}</div>
                      <div className="col-span-4 text-sm text-gray-600">{group.description}</div>
                      <div className="col-span-2">
                        <Badge variant="outline" className="capitalize text-xs">
                          {group.type}
                        </Badge>
                      </div>
                      <div className="col-span-2 text-sm">
                        {group.memberCount} users
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {selectedGroups.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-blue-800">{selectedGroups.length} groups selected</span>
                    <p className="text-sm text-blue-600">Will target approximately {getTotalTargetedUsers()} users</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-blue-700 border-blue-200">
                    Save as Target Group
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search users by name, email or department" 
                  className="pl-10 rounded-xl"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                />
              </div>
              <Select 
                value={riskFilterLevel}
                onValueChange={setRiskFilterLevel}
              >
                <SelectTrigger className="w-[180px] rounded-xl">
                  <SelectValue placeholder="Filter by risk score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="border rounded-xl overflow-hidden">
              <div className="bg-gray-50 p-3 border-b grid grid-cols-12 gap-4 font-medium text-gray-500 text-sm">
                <div className="col-span-1"></div>
                <div className="col-span-3">Name</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Department</div>
                <div className="col-span-2">Location</div>
                <div className="col-span-1">Risk</div>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                {filteredUsers.map(user => (
                  <div key={user.id} className="border-b last:border-none hover:bg-gray-50 transition-colors">
                    <div className="p-3 grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-1">
                        <Checkbox 
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => onToggleUserSelection(user.id)}
                        />
                      </div>
                      <div className="col-span-3 font-medium">{user.name}</div>
                      <div className="col-span-3 text-sm">{user.email}</div>
                      <div className="col-span-2 text-sm">{user.department}</div>
                      <div className="col-span-2 text-sm">{user.location}</div>
                      <div className="col-span-1">
                        <Badge className={
                          user.riskScore && user.riskScore >= 70 ? 'bg-red-100 text-red-800' :
                          user.riskScore && user.riskScore >= 30 ? 'bg-amber-100 text-amber-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {user.riskScore && user.riskScore >= 70 ? 'High' : 
                           user.riskScore && user.riskScore >= 30 ? 'Med' : 'Low'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {selectedUsers.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-blue-800">{selectedUsers.length} users selected</span>
                  </div>
                  <Button variant="outline" size="sm" className="text-blue-700 border-blue-200">
                    Save as Target Group
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};