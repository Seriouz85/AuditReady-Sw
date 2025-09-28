import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Receipt, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Sparkles 
} from 'lucide-react';
import type { StripeStats } from '../shared/AdminSharedTypes';

interface BillingManagementProps {
  stripeStats: StripeStats | null;
  stripeCustomers: any[];
  loading: boolean;
}

export const BillingManagement: React.FC<BillingManagementProps> = ({
  stripeStats,
  stripeCustomers,
  loading
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Billing & Revenue
            </h2>
            <p className="text-muted-foreground mt-2">Monitor revenue, subscriptions, and billing analytics</p>
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
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Billing & Revenue
          </h2>
          <p className="text-muted-foreground mt-2">Monitor revenue, subscriptions, and billing analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={`px-3 py-1 ${stripeStats?.connectionStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {stripeStats?.connectionStatus ? (
              <><CheckCircle className="w-3 h-3 mr-1" />Stripe Connected</>
            ) : (
              <><AlertCircle className="w-3 h-3 mr-1" />Stripe Disconnected</>
            )}
          </Badge>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900">
              ${stripeStats?.totalRevenue?.toLocaleString() || 0}
            </div>
            <div className="flex items-center mt-2 text-sm text-emerald-600">
              <DollarSign className="w-4 h-4 mr-1" />
              All time
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              ${stripeStats?.monthlyRevenue?.toLocaleString() || 0}
            </div>
            <div className="flex items-center mt-2 text-sm text-blue-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              MRR
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">
              {stripeStats?.activeSubscriptions || 0}
            </div>
            <div className="flex items-center mt-2 text-sm text-purple-600">
              <CreditCard className="w-4 h-4 mr-1" />
              Paying customers
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">
              {stripeStats?.customers || 0}
            </div>
            <div className="flex items-center mt-2 text-sm text-orange-600">
              <Users className="w-4 h-4 mr-1" />
              In Stripe
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-emerald-600" />
              Recent Transactions
            </CardTitle>
            <CardDescription>Latest billing activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stripeCustomers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="w-8 h-8 mx-auto mb-2" />
                  <p>No transactions yet</p>
                </div>
              ) : (
                stripeCustomers.slice(0, 5).map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-full bg-emerald-100 p-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-medium">Payment received</div>
                        <div className="text-sm text-gray-500">Customer #{index + 1}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-emerald-600">+$99.00</div>
                      <div className="text-xs text-gray-500">Just now</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Status */}
        <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
              Subscription Status
            </CardTitle>
            <CardDescription>Active subscription breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Active Subscriptions</div>
                    <div className="text-sm text-gray-500">Paid and current</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {stripeStats?.activeSubscriptions || 0}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <div>
                    <div className="font-medium">Pending Payments</div>
                    <div className="text-sm text-gray-500">Awaiting payment</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-yellow-600">0</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="font-medium">Failed Payments</div>
                    <div className="text-sm text-gray-500">Requires attention</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600">0</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing Tools */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center text-emerald-800">
            <Sparkles className="w-5 h-5 mr-2" />
            Billing Management Tools
          </CardTitle>
          <CardDescription>Quick actions for managing billing and revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-16 flex-col border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              <Receipt className="w-5 h-5 mb-1" />
              <span className="text-sm">Invoices</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              <CreditCard className="w-5 h-5 mb-1" />
              <span className="text-sm">Subscriptions</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              <Users className="w-5 h-5 mb-1" />
              <span className="text-sm">Customers</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              <TrendingUp className="w-5 h-5 mb-1" />
              <span className="text-sm">Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};