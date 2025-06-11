import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { stripeAdminService, StripeProduct, StripePrice } from '@/services/stripe/StripeAdminService';
import { toast } from '@/utils/toast';
import { 
  Package, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  ExternalLink,
  Loader,
  AlertTriangle,
  CheckCircle,
  Tag,
  Globe,
  RefreshCw,
  Settings
} from 'lucide-react';

interface ProductManagementModalProps {
  open: boolean;
  onClose: () => void;
  product?: StripeProduct | null;
  onProductUpdated: () => void;
}

export const ProductManagementModal: React.FC<ProductManagementModalProps> = ({
  open,
  onClose,
  product,
  onProductUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<StripePrice[]>([]);
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    active: true,
    images: [''],
    url: '',
    metadata: {} as Record<string, string>,
  });
  const [landingPageTier, setLandingPageTier] = useState<string>('none');
  const [newPrice, setNewPrice] = useState({
    currency: 'eur', // Default to EUR for consistency with landing page
    unit_amount: 0,
    recurring: false,
    interval: 'month' as 'day' | 'week' | 'month' | 'year',
    interval_count: 1,
    lookup_key: '',
  });

  useEffect(() => {
    if (product) {
      setProductData({
        name: product.name,
        description: product.description || '',
        active: product.active,
        images: product.images.length > 0 ? product.images : [''],
        url: product.url || '',
        metadata: product.metadata,
      });
      setLandingPageTier(product.metadata?.tier || 'none');
      loadProductPrices();
    } else {
      resetForm();
    }
  }, [product]);

  const resetForm = () => {
    setProductData({
      name: '',
      description: '',
      active: true,
      images: [''],
      url: '',
      metadata: {},
    });
    setLandingPageTier('none');
    setPrices([]);
    setNewPrice({
      currency: 'eur', // Default to EUR for consistency with landing page
      unit_amount: 0,
      recurring: false,
      interval: 'month',
      interval_count: 1,
      lookup_key: '',
    });
  };

  const loadProductPrices = async () => {
    if (!product) return;
    
    try {
      const response = await stripeAdminService.listPrices(product.id);
      setPrices(response || []);
    } catch (error) {
      console.error('Failed to load prices:', error);
      toast.error('Failed to load product prices');
      setPrices([]);
    }
  };

  const handleSaveProduct = async () => {
    setLoading(true);
    try {
      // Include landing page tier in metadata
      const updatedMetadata = { 
        ...productData.metadata,
        ...(landingPageTier && landingPageTier !== 'none' && { tier: landingPageTier })
      };

      const productPayload = {
        name: productData.name,
        description: productData.description || undefined,
        active: productData.active,
        images: productData.images.filter(img => img.trim() !== ''),
        url: productData.url || undefined,
        metadata: updatedMetadata,
      };

      if (product) {
        await stripeAdminService.updateProduct(product.id, productPayload);
        toast.success('Product updated successfully! Landing page will update automatically.');
      } else {
        await stripeAdminService.createProduct(productPayload);
        toast.success('Product created successfully! Landing page will update automatically.');
      }
      
      // Trigger real-time pricing update for landing page
      try {
        localStorage.setItem('stripe_pricing_updated', Date.now().toString());
        // Also dispatch custom event for same-window updates
        window.dispatchEvent(new CustomEvent('stripe_pricing_updated'));
        setTimeout(() => {
          localStorage.removeItem('stripe_pricing_updated');
        }, 100);
      } catch (error) {
        console.warn('Could not trigger pricing update event:', error);
      }

      onProductUpdated();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrice = async () => {
    if (!product) return;
    
    setLoading(true);
    try {
      const pricePayload = {
        product: product.id,
        currency: newPrice.currency,
        unit_amount: Math.round(newPrice.unit_amount * 100), // Convert to cents
        recurring: newPrice.recurring ? {
          interval: newPrice.interval,
          interval_count: newPrice.interval_count,
        } : undefined,
        lookup_key: newPrice.lookup_key || undefined,
        metadata: { created_via: 'admin_console' },
      };

      await stripeAdminService.createPrice(pricePayload);
      toast.success('Price created successfully!');
      
      // Trigger real-time pricing update for landing page
      try {
        localStorage.setItem('stripe_pricing_updated', Date.now().toString());
        // Also dispatch custom event for same-window updates
        window.dispatchEvent(new CustomEvent('stripe_pricing_updated'));
        setTimeout(() => {
          localStorage.removeItem('stripe_pricing_updated');
        }, 100);
      } catch (error) {
        console.warn('Could not trigger pricing update event:', error);
      }
      
      // Reset price form
      setNewPrice({
        currency: 'eur',
        unit_amount: 0,
        recurring: false,
        interval: 'month',
        interval_count: 1,
        lookup_key: '',
      });
      
      loadProductPrices();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create price');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePriceActive = async (priceId: string, currentActive: boolean) => {
    try {
      await stripeAdminService.updatePrice(priceId, { active: !currentActive });
      toast.success(`Price ${!currentActive ? 'activated' : 'deactivated'} successfully!`);
      
      // Trigger real-time pricing update for landing page
      try {
        localStorage.setItem('stripe_pricing_updated', Date.now().toString());
        // Also dispatch custom event for same-window updates
        window.dispatchEvent(new CustomEvent('stripe_pricing_updated'));
        setTimeout(() => {
          localStorage.removeItem('stripe_pricing_updated');
        }, 100);
      } catch (error) {
        console.warn('Could not trigger pricing update event:', error);
      }
      
      loadProductPrices();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update price');
    }
  };

  const handleDuplicatePrice = async (priceId: string) => {
    setLoading(true);
    try {
      // Get the original price first
      const pricesData = await stripeAdminService.listPrices();
      const originalPrice = pricesData?.find(p => p.id === priceId);
      
      if (!originalPrice) {
        throw new Error('Original price not found');
      }

      // Create a duplicate with same properties
      const duplicateData = {
        product: originalPrice.product,
        currency: originalPrice.currency,
        unit_amount: originalPrice.unit_amount,
        recurring: originalPrice.recurring,
        metadata: { 
          ...originalPrice.metadata, 
          duplicated_from: priceId,
          created_via: 'admin_console_duplicate'
        }
      };

      await stripeAdminService.createPrice(duplicateData);
      toast.success('Price duplicated successfully!');
      
      // Trigger real-time pricing update for landing page
      try {
        localStorage.setItem('stripe_pricing_updated', Date.now().toString());
        // Also dispatch custom event for same-window updates
        window.dispatchEvent(new CustomEvent('stripe_pricing_updated'));
        setTimeout(() => {
          localStorage.removeItem('stripe_pricing_updated');
        }, 100);
      } catch (error) {
        console.warn('Could not trigger pricing update event:', error);
      }
      
      loadProductPrices();
    } catch (error: any) {
      toast.error(error.message || 'Failed to duplicate price');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount / 100);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {product ? 'Edit Product' : 'Create New Product'}
          </DialogTitle>
          <DialogDescription>
            {product ? `Manage ${product.name} and its pricing tiers` : 'Create a new product with pricing options'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="product" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="product">Product Details</TabsTrigger>
            <TabsTrigger value="pricing" disabled={!product}>
              Pricing ({prices?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="sync">Landing Page Sync</TabsTrigger>
          </TabsList>

          <TabsContent value="product" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={productData.name}
                  onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="url">Product URL</Label>
                <Input
                  id="url"
                  value={productData.url}
                  onChange={(e) => setProductData({ ...productData, url: e.target.value })}
                  placeholder="https://example.com/product"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={productData.description}
                onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                placeholder="Describe your product..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="landing-page-tier">Landing Page Tier</Label>
              <Select value={landingPageTier} onValueChange={setLandingPageTier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tier for landing page sync" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No landing page sync</SelectItem>
                  <SelectItem value="team">Team Plan</SelectItem>
                  <SelectItem value="business">Business Plan</SelectItem>
                  <SelectItem value="enterprise">Enterprise Plan</SelectItem>
                </SelectContent>
              </Select>
              {landingPageTier && landingPageTier !== 'none' && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Globe className="h-4 w-4" />
                  This product will sync to the {landingPageTier} tier on your landing page
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Product Images (URLs)</Label>
              {productData.images.map((image, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={image}
                    onChange={(e) => {
                      const newImages = [...productData.images];
                      newImages[index] = e.target.value;
                      setProductData({ ...productData, images: newImages });
                    }}
                    placeholder="https://example.com/image.jpg"
                  />
                  {index === productData.images.length - 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setProductData({ 
                        ...productData, 
                        images: [...productData.images, ''] 
                      })}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={productData.active}
                onCheckedChange={(checked) => setProductData({ ...productData, active: checked })}
              />
              <Label htmlFor="active">Product is active</Label>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            {/* Existing Prices */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Existing Prices</h3>
                <Badge variant="outline">{prices?.length || 0} prices</Badge>
              </div>
              
              {prices && prices.length > 0 ? (
                <div className="grid gap-4">
                  {prices.map((price) => (
                    <Card key={price.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-xl font-bold">
                                {formatPrice(price.unit_amount, price.currency)}
                              </span>
                              {price.recurring && (
                                <span className="text-sm text-muted-foreground">
                                  /{price.recurring.interval_count > 1 
                                    ? `${price.recurring.interval_count} ${price.recurring.interval}s` 
                                    : price.recurring.interval}
                                </span>
                              )}
                            </div>
                            
                            <Badge 
                              variant={price.active ? "default" : "secondary"}
                              className={price.active ? "bg-green-100 text-green-800" : ""}
                            >
                              {price.active ? 'Active' : 'Inactive'}
                            </Badge>
                            
                            {price.lookup_key && (
                              <Badge variant="outline">
                                <Tag className="h-3 w-3 mr-1" />
                                {price.lookup_key}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTogglePriceActive(price.id, price.active)}
                            >
                              {price.active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDuplicatePrice(price.id)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`https://dashboard.stripe.com/prices/${price.id}`, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Prices Yet</h3>
                    <p className="text-muted-foreground">Create your first price below</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Add New Price */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Price
                </CardTitle>
                <CardDescription>
                  Create a new pricing tier for this product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                        €
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={newPrice.unit_amount}
                        onChange={(e) => setNewPrice({ ...newPrice, unit_amount: parseFloat(e.target.value) || 0 })}
                        className="rounded-l-none"
                        placeholder="99.99"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <select
                      id="currency"
                      value={newPrice.currency}
                      onChange={(e) => setNewPrice({ ...newPrice, currency: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="eur">EUR</option>
                      <option value="usd">USD</option>
                      <option value="gbp">GBP</option>
                      <option value="cad">CAD</option>
                      <option value="aud">AUD</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="recurring"
                    checked={newPrice.recurring}
                    onCheckedChange={(checked) => setNewPrice({ ...newPrice, recurring: checked })}
                  />
                  <Label htmlFor="recurring">Recurring subscription</Label>
                </div>

                {newPrice.recurring && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="interval">Billing Interval</Label>
                      <select
                        id="interval"
                        value={newPrice.interval}
                        onChange={(e) => setNewPrice({ ...newPrice, interval: e.target.value as any })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="day">Day</option>
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                        <option value="year">Year</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="interval_count">Interval Count</Label>
                      <Input
                        id="interval_count"
                        type="number"
                        min="1"
                        value={newPrice.interval_count}
                        onChange={(e) => setNewPrice({ ...newPrice, interval_count: parseInt(e.target.value) || 1 })}
                        placeholder="1"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="lookup_key">Lookup Key (Optional)</Label>
                  <Input
                    id="lookup_key"
                    value={newPrice.lookup_key}
                    onChange={(e) => setNewPrice({ ...newPrice, lookup_key: e.target.value })}
                    placeholder="team-monthly, enterprise-yearly, etc."
                  />
                </div>

                <Button onClick={handleAddPrice} disabled={loading || !product}>
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Price
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Landing Page Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Configure how this product appears on your landing page pricing section.
                </p>
              </div>

              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  Products with tier metadata automatically sync to the landing page. 
                  Changes to pricing are reflected immediately via real-time updates.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Sync Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure which landing page tier this product represents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Landing Page Tier</Label>
                    <Select value={landingPageTier} onValueChange={setLandingPageTier}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No sync (manual pricing only)</SelectItem>
                        <SelectItem value="team">Team Plan</SelectItem>
                        <SelectItem value="business">Business Plan</SelectItem>
                        <SelectItem value="enterprise">Enterprise Plan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {landingPageTier && landingPageTier !== 'none' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                        <CheckCircle className="h-4 w-4" />
                        Sync Enabled
                      </div>
                      <p className="text-sm text-green-700">
                        This product will appear as the <strong>{landingPageTier}</strong> tier on your landing page.
                        The active monthly price will be displayed automatically.
                      </p>
                    </div>
                  )}

                  {(!landingPageTier || landingPageTier === 'none') && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-800 font-medium mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        No Sync Configured
                      </div>
                      <p className="text-sm text-amber-700">
                        This product won't appear on the landing page. Select a tier above to enable sync.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {product && prices && prices.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Landing Page Preview</CardTitle>
                    <CardDescription>
                      How this product will appear on the landing page
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {landingPageTier && landingPageTier !== 'none' ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-semibold capitalize">{landingPageTier}</h4>
                            <p className="text-sm text-muted-foreground">{productData.description}</p>
                          </div>
                          <div className="text-right">
                            {(() => {
                              const monthlyPrice = prices?.find(p => p.recurring?.interval === 'month' && p.active);
                              return monthlyPrice ? (
                                <div>
                                  <div className="text-2xl font-bold">
                                    {formatPrice(monthlyPrice.unit_amount, monthlyPrice.currency)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">per month</div>
                                </div>
                              ) : (
                                <div className="text-sm text-amber-600">No monthly price configured</div>
                              );
                            })()}
                          </div>
                        </div>
                        
                        {!prices?.find(p => p.recurring?.interval === 'month' && p.active) && (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Missing Monthly Price:</strong> Add an active monthly price in the Pricing tab 
                              for this product to display correctly on the landing page.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select a landing page tier to preview how this product will appear</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Real-time Sync Status</CardTitle>
                  <CardDescription>
                    How changes in this admin panel sync to your landing page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm">Product Updates</span>
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Real-time
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm">Price Changes</span>
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Real-time
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm">Activation/Deactivation</span>
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Real-time
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-3">
                    Changes are synced via localStorage events and the useDynamicPricing hook.
                    No page refresh required.
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSaveProduct} disabled={loading || !productData.name.trim()}>
            {loading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {product ? 'Update Product' : 'Create Product'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};