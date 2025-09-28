import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Building, 
  Users, 
  Search, 
  Plus, 
  Crown, 
  CheckCircle, 
  AlertTriangle, 
  CreditCard, 
  DollarSign, 
  Globe, 
  Clock, 
  Calendar, 
  ExternalLink, 
  Settings, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Power, 
  Trash2 
} from 'lucide-react';
import { formatDate, formatCurrency, getTierBadgeVariant } from '../shared/AdminUtilities';
import type { OrganizationSummary } from '../shared/AdminSharedTypes';

interface OrganizationsManagementProps {
  organizations: OrganizationSummary[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreateOrganization: () => void;
  onEditOrganization: (org: OrganizationSummary) => void;
  onToggleOrganizationStatus: (org: OrganizationSummary) => void;
  onDeleteOrganization: (org: OrganizationSummary) => void;
  onCreateCustomerPortal: (stripeCustomerId: string) => void;
}

export const OrganizationsManagement: React.FC<OrganizationsManagementProps> = ({
  organizations,
  loading,
  searchTerm,
  onSearchChange,
  onCreateOrganization,
  onEditOrganization,
  onToggleOrganizationStatus,
  onDeleteOrganization,
  onCreateCustomerPortal
}) => {
  const navigate = useNavigate();

  const filteredOrganizations = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.tier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Customer Organizations
            </h2>
            <p className="text-muted-foreground mt-2">Manage customer accounts, subscriptions, and billing</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Customer Organizations
          </h2>
          <p className="text-muted-foreground mt-2">Manage customer accounts, subscriptions, and billing</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button 
            onClick={onCreateOrganization} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Organization
          </Button>
        </div>
      </div>

      {filteredOrganizations.length === 0 ? (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-12 text-center">
            <div className="rounded-full bg-blue-100 p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Building className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-blue-900">
              {searchTerm ? 'No Matching Organizations' : 'No Organizations Yet'}
            </h3>
            <p className="text-blue-700 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? `No organizations found matching "${searchTerm}". Try adjusting your search.`
                : 'Create your first customer organization to start managing subscriptions and billing.'
              }
            </p>
            {!searchTerm && (
              <Button onClick={onCreateOrganization} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Plus className="w-5 h-5 mr-2" />
                Create First Organization
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrganizations.map((org) => (
            <Card key={org.id} className="bg-white/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 border border-gray-200/50 hover:border-blue-300/50 group">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-3 text-white">
                      <Building className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {org.name}
                      </CardTitle>
                      <div className="flex items-center space-x-3 mt-2">
                        <Badge 
                          variant={getTierBadgeVariant(org.tier) as any}
                          className="px-3 py-1 font-medium"
                        >
                          <Crown className="w-3 h-3 mr-1" />
                          {org.tier.toUpperCase()}
                        </Badge>
                        {org.isActive ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                        {org.stripeCustomerId && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            <CreditCard className="w-3 h-3 mr-1" />
                            Stripe Connected
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      {org.userCount} users
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      Active since {formatDate(org.lastActivity)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(org.lastActivity)}
                    </div>
                    {org.revenue && (
                      <div className="flex items-center text-sm font-semibold text-green-600">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {formatCurrency(org.revenue)}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-1" />
                      ID: {org.id.slice(0, 8)}...
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Last activity {formatDate(org.lastActivity)}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {/* Stripe Customer Portal */}
                    {org.stripeCustomerId && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onCreateCustomerPortal(org.stripeCustomerId!)}
                        className="border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Stripe Portal
                      </Button>
                    )}
                    
                    {/* User Management */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/admin/organizations/${org.id}`)}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Users className="w-3 h-3 mr-1" />
                      Users
                    </Button>
                    
                    {/* Settings */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEditOrganization(org)}
                      className="border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Settings
                    </Button>
                    
                    {/* More Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 hover:bg-gray-50">
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => navigate(`/admin/organizations/${org.id}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditOrganization(org)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Organization
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleOrganizationStatus(org)}>
                          <Power className="w-4 h-4 mr-2" />
                          {org.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDeleteOrganization(org)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Organization
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};