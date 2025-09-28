import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Tag, 
  TrendingUp, 
  CreditCard,
  Sparkles 
} from 'lucide-react';

interface ProductsManagementProps {
  stripeProducts: any[];
  stripePrices: any[];
  loading: boolean;
  onCreateProduct: () => void;
  onEditProduct: (product: any) => void;
  onDeleteProduct: (productId: string) => void;
}

export const ProductsManagement: React.FC<ProductsManagementProps> = ({
  stripeProducts,
  stripePrices,
  loading,
  onCreateProduct,
  onEditProduct,
  onDeleteProduct
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Products & Pricing
            </h2>
            <p className="text-muted-foreground mt-2">Manage Stripe products, pricing plans, and subscription tiers</p>
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
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Products & Pricing
          </h2>
          <p className="text-muted-foreground mt-2">Manage Stripe products, pricing plans, and subscription tiers</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={onCreateProduct} 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Product
          </Button>
        </div>
      </div>

      {/* Products Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{stripeProducts.length}</div>
            <div className="flex items-center mt-2 text-sm text-purple-600">
              <Package className="w-4 h-4 mr-1" />
              Active products
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Price Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{stripePrices.length}</div>
            <div className="flex items-center mt-2 text-sm text-blue-600">
              <Tag className="w-4 h-4 mr-1" />
              Available pricing
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">$0</div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              This month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      {stripeProducts.length === 0 ? (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-12 text-center">
            <div className="rounded-full bg-purple-100 p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Package className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-purple-900">No Products Yet</h3>
            <p className="text-purple-700 mb-6 max-w-md mx-auto">
              Create your first product to start managing pricing and subscriptions.
            </p>
            <Button onClick={onCreateProduct} size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Plus className="w-5 h-5 mr-2" />
              Create First Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stripeProducts.map((product) => (
            <Card key={product.id} className="bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-2 text-white">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription>{product.description}</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    ID: {product.id.slice(0, 12)}...
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => onEditProduct(product)}>
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDeleteProduct(product.id)}>
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-800">
            <Sparkles className="w-5 h-5 mr-2" />
            Product Management Tools
          </CardTitle>
          <CardDescription>Quick actions for managing your product catalog</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-16 flex-col border-purple-200 text-purple-700 hover:bg-purple-50">
              <Package className="w-5 h-5 mb-1" />
              <span className="text-sm">All Products</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col border-purple-200 text-purple-700 hover:bg-purple-50">
              <Tag className="w-5 h-5 mb-1" />
              <span className="text-sm">Pricing Plans</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col border-purple-200 text-purple-700 hover:bg-purple-50">
              <CreditCard className="w-5 h-5 mb-1" />
              <span className="text-sm">Subscriptions</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col border-purple-200 text-purple-700 hover:bg-purple-50">
              <DollarSign className="w-5 h-5 mb-1" />
              <span className="text-sm">Revenue</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};