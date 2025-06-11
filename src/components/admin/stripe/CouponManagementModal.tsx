import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { stripeAdminService, StripeCoupon, StripePromotionCode } from '@/services/stripe/StripeAdminService';
import { toast } from '@/utils/toast';
import { 
  Percent, 
  DollarSign, 
  Plus, 
  Copy, 
  Trash2, 
  Calendar,
  Users,
  TrendingUp,
  Loader,
  Gift,
  Tag,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';

interface CouponManagementModalProps {
  open: boolean;
  onClose: () => void;
  coupon?: StripeCoupon | null;
  onCouponUpdated: () => void;
}

export const CouponManagementModal: React.FC<CouponManagementModalProps> = ({
  open,
  onClose,
  coupon,
  onCouponUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [promotionCodes, setPromotionCodes] = useState<StripePromotionCode[]>([]);
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [couponData, setCouponData] = useState({
    id: '',
    name: '',
    percent_off: 10,
    amount_off: 1000, // in cents
    currency: 'usd',
    duration: 'once' as 'forever' | 'once' | 'repeating',
    duration_in_months: 1,
    max_redemptions: undefined as number | undefined,
    redeem_by: undefined as number | undefined,
  });
  const [promoCodeData, setPromoCodeData] = useState({
    code: '',
    expires_at: undefined as number | undefined,
    max_redemptions: undefined as number | undefined,
    minimum_amount: undefined as number | undefined,
    minimum_amount_currency: 'usd',
  });

  useEffect(() => {
    if (coupon) {
      setCouponData({
        id: coupon.id,
        name: coupon.name || '',
        percent_off: coupon.percent_off || 10,
        amount_off: coupon.amount_off || 1000,
        currency: coupon.currency || 'usd',
        duration: coupon.duration,
        duration_in_months: coupon.duration_in_months || 1,
        max_redemptions: coupon.max_redemptions || undefined,
        redeem_by: coupon.redeem_by || undefined,
      });
      setDiscountType(coupon.percent_off ? 'percentage' : 'amount');
      loadPromotionCodes();
    } else {
      resetForm();
    }
  }, [coupon]);

  const resetForm = () => {
    setCouponData({
      id: '',
      name: '',
      percent_off: 10,
      amount_off: 1000,
      currency: 'usd',
      duration: 'once',
      duration_in_months: 1,
      max_redemptions: undefined,
      redeem_by: undefined,
    });
    setPromoCodeData({
      code: '',
      expires_at: undefined,
      max_redemptions: undefined,
      minimum_amount: undefined,
      minimum_amount_currency: 'usd',
    });
    setPromotionCodes([]);
    setDiscountType('percentage');
  };

  const loadPromotionCodes = async () => {
    if (!coupon) return;
    
    try {
      const promoCodes = await stripeAdminService.listPromotionCodes(coupon.id);
      setPromotionCodes(promoCodes);
    } catch (error) {
      console.error('Failed to load promotion codes:', error);
      toast.error('Failed to load promotion codes');
    }
  };

  const handleSaveCoupon = async () => {
    setLoading(true);
    try {
      const couponPayload = {
        id: couponData.id || undefined,
        name: couponData.name || undefined,
        duration: couponData.duration,
        duration_in_months: couponData.duration === 'repeating' ? couponData.duration_in_months : undefined,
        max_redemptions: couponData.max_redemptions || undefined,
        redeem_by: couponData.redeem_by || undefined,
        metadata: { created_via: 'admin_console' },
        ...(discountType === 'percentage' 
          ? { percent_off: couponData.percent_off }
          : { 
              amount_off: Math.round(couponData.amount_off), 
              currency: couponData.currency 
            }
        )
      };

      if (coupon) {
        // Can only update name and metadata for existing coupons
        await stripeAdminService.updateCoupon(coupon.id, {
          name: couponData.name || undefined,
          metadata: { updated_via: 'admin_console' },
        });
        toast.success('Coupon updated successfully!');
      } else {
        await stripeAdminService.createCoupon(couponPayload);
        toast.success('Coupon created successfully!');
      }
      
      onCouponUpdated();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromotionCode = async () => {
    if (!coupon) return;
    
    setLoading(true);
    try {
      const promoPayload = {
        coupon: coupon.id,
        code: promoCodeData.code || undefined,
        expires_at: promoCodeData.expires_at || undefined,
        max_redemptions: promoCodeData.max_redemptions || undefined,
        restrictions: (promoCodeData.minimum_amount && promoCodeData.minimum_amount > 0) ? {
          minimum_amount: Math.round(promoCodeData.minimum_amount * 100), // Convert to cents
          minimum_amount_currency: promoCodeData.minimum_amount_currency,
        } : undefined,
        metadata: { created_via: 'admin_console' },
      };

      await stripeAdminService.createPromotionCode(promoPayload);
      toast.success('Promotion code created successfully!');
      
      // Reset promo code form
      setPromoCodeData({
        code: '',
        expires_at: undefined,
        max_redemptions: undefined,
        minimum_amount: undefined,
        minimum_amount_currency: 'usd',
      });
      
      loadPromotionCodes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create promotion code');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePromotionCode = async (promoCodeId: string, currentActive: boolean) => {
    try {
      await stripeAdminService.updatePromotionCode(promoCodeId, { active: !currentActive });
      toast.success(`Promotion code ${!currentActive ? 'activated' : 'deactivated'} successfully!`);
      loadPromotionCodes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update promotion code');
    }
  };

  const handleDeleteCoupon = async () => {
    if (!coupon || !confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      await stripeAdminService.deleteCoupon(coupon.id);
      toast.success('Coupon deleted successfully!');
      onCouponUpdated();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete coupon');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setPromoCodeData({ ...promoCodeData, code: result });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDiscountDisplay = () => {
    if (discountType === 'percentage') {
      return `${couponData.percent_off}% off`;
    } else {
      return `${formatAmount(couponData.amount_off, couponData.currency)} off`;
    }
  };

  const getDurationDisplay = () => {
    switch (couponData.duration) {
      case 'forever':
        return 'Forever';
      case 'once':
        return 'One time use';
      case 'repeating':
        return `${couponData.duration_in_months} month${couponData.duration_in_months > 1 ? 's' : ''}`;
      default:
        return couponData.duration;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            {coupon ? 'Edit Coupon' : 'Create New Coupon'}
          </DialogTitle>
          <DialogDescription>
            {coupon ? `Manage ${coupon.name || coupon.id} and its promotion codes` : 'Create a new discount coupon with promotion codes'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="coupon" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="coupon">Coupon Details</TabsTrigger>
            <TabsTrigger value="promotion-codes" disabled={!coupon}>
              Promotion Codes ({promotionCodes.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" disabled={!coupon}>
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="coupon" className="space-y-6">
            {/* Discount Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Discount Type</CardTitle>
                <CardDescription>Choose between percentage or fixed amount discount</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Card 
                    className={`cursor-pointer border-2 transition-colors ${
                      discountType === 'percentage' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setDiscountType('percentage')}
                  >
                    <CardContent className="p-4 text-center">
                      <Percent className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-semibold">Percentage Off</h3>
                      <p className="text-sm text-muted-foreground">10%, 25%, 50% etc.</p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className={`cursor-pointer border-2 transition-colors ${
                      discountType === 'amount' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setDiscountType('amount')}
                  >
                    <CardContent className="p-4 text-center">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <h3 className="font-semibold">Fixed Amount</h3>
                      <p className="text-sm text-muted-foreground">$10, $50, $100 etc.</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Coupon Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Coupon Configuration</CardTitle>
                <CardDescription>Set up your discount parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="coupon-id">Coupon ID {!coupon && '*'}</Label>
                    <Input
                      id="coupon-id"
                      value={couponData.id}
                      onChange={(e) => setCouponData({ ...couponData, id: e.target.value })}
                      placeholder="SUMMER2024, WELCOME10, etc."
                      disabled={!!coupon}
                    />
                    {!coupon && (
                      <p className="text-xs text-muted-foreground">
                        Leave empty to auto-generate, or specify custom ID
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="coupon-name">Display Name</Label>
                    <Input
                      id="coupon-name"
                      value={couponData.name}
                      onChange={(e) => setCouponData({ ...couponData, name: e.target.value })}
                      placeholder="Summer Sale, Welcome Discount, etc."
                    />
                  </div>
                </div>

                {discountType === 'percentage' ? (
                  <div className="space-y-2">
                    <Label htmlFor="percent-off">Percentage Off</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="percent-off"
                        type="number"
                        min="1"
                        max="100"
                        value={couponData.percent_off}
                        onChange={(e) => setCouponData({ ...couponData, percent_off: parseInt(e.target.value) || 0 })}
                        className="w-24"
                      />
                      <span className="text-muted-foreground">%</span>
                      <div className="flex-1 px-3 py-2 bg-muted rounded-md">
                        Preview: <strong>{couponData.percent_off}% off</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="amount-off">Amount Off</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                          $
                        </span>
                        <Input
                          id="amount-off"
                          type="number"
                          step="0.01"
                          value={couponData.amount_off / 100}
                          onChange={(e) => setCouponData({ ...couponData, amount_off: Math.round((parseFloat(e.target.value) || 0) * 100) })}
                          className="rounded-l-none"
                          placeholder="10.00"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <select
                        id="currency"
                        value={couponData.currency}
                        onChange={(e) => setCouponData({ ...couponData, currency: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        disabled={!!coupon}
                      >
                        <option value="usd">USD</option>
                        <option value="eur">EUR</option>
                        <option value="gbp">GBP</option>
                        <option value="cad">CAD</option>
                        <option value="aud">AUD</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <select
                    id="duration"
                    value={couponData.duration}
                    onChange={(e) => setCouponData({ ...couponData, duration: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={!!coupon}
                  >
                    <option value="once">One time use</option>
                    <option value="forever">Forever</option>
                    <option value="repeating">Repeating (months)</option>
                  </select>
                </div>

                {couponData.duration === 'repeating' && (
                  <div className="space-y-2">
                    <Label htmlFor="duration-months">Duration in Months</Label>
                    <Input
                      id="duration-months"
                      type="number"
                      min="1"
                      value={couponData.duration_in_months}
                      onChange={(e) => setCouponData({ ...couponData, duration_in_months: parseInt(e.target.value) || 1 })}
                      disabled={!!coupon}
                    />
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="max-redemptions">Max Redemptions (Optional)</Label>
                    <Input
                      id="max-redemptions"
                      type="number"
                      min="1"
                      value={couponData.max_redemptions || ''}
                      onChange={(e) => setCouponData({ 
                        ...couponData, 
                        max_redemptions: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      placeholder="Unlimited"
                      disabled={!!coupon}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="redeem-by">Expires On (Optional)</Label>
                    <Input
                      id="redeem-by"
                      type="date"
                      value={couponData.redeem_by ? new Date(couponData.redeem_by * 1000).toISOString().split('T')[0] : ''}
                      onChange={(e) => setCouponData({ 
                        ...couponData, 
                        redeem_by: e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : undefined 
                      })}
                      disabled={!!coupon}
                    />
                  </div>
                </div>

                {/* Preview */}
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-purple-900">Coupon Preview</h4>
                        <p className="text-sm text-purple-700">
                          {getDiscountDisplay()} • {getDurationDisplay()}
                        </p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">
                        {couponData.id || 'AUTO-GENERATED'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="promotion-codes" className="space-y-6">
            {/* Existing Promotion Codes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Promotion Codes</h3>
                <Badge variant="outline">{promotionCodes.length} codes</Badge>
              </div>
              
              {promotionCodes.length > 0 ? (
                <div className="grid gap-4">
                  {promotionCodes.map((promoCode) => (
                    <Card key={promoCode.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Tag className="h-4 w-4 text-blue-600" />
                              <span className="text-xl font-bold font-mono">
                                {promoCode.code}
                              </span>
                            </div>
                            
                            <Badge 
                              variant={promoCode.active ? "default" : "secondary"}
                              className={promoCode.active ? "bg-green-100 text-green-800" : ""}
                            >
                              {promoCode.active ? 'Active' : 'Inactive'}
                            </Badge>
                            
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {promoCode.times_redeemed} used
                                {promoCode.max_redemptions && ` / ${promoCode.max_redemptions}`}
                              </div>
                              
                              {promoCode.expires_at && (
                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Expires {formatDate(promoCode.expires_at)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigator.clipboard.writeText(promoCode.code)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTogglePromotionCode(promoCode.id, promoCode.active)}
                            >
                              {promoCode.active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`https://dashboard.stripe.com/promotion_codes/${promoCode.id}`, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {promoCode.restrictions?.minimum_amount && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            Minimum order: {formatAmount(
                              promoCode.restrictions.minimum_amount, 
                              promoCode.restrictions.minimum_amount_currency || 'usd'
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Promotion Codes Yet</h3>
                    <p className="text-muted-foreground">Create your first promotion code below</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Add New Promotion Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Promotion Code
                </CardTitle>
                <CardDescription>
                  Generate customer-facing codes for this coupon
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="promo-code">Promotion Code</Label>
                    <div className="flex">
                      <Input
                        id="promo-code"
                        value={promoCodeData.code}
                        onChange={(e) => setPromoCodeData({ ...promoCodeData, code: e.target.value.toUpperCase() })}
                        placeholder="SUMMER2024"
                        className="font-mono"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateRandomCode}
                        className="ml-2"
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="promo-expires">Expires At (Optional)</Label>
                    <Input
                      id="promo-expires"
                      type="datetime-local"
                      value={promoCodeData.expires_at ? new Date(promoCodeData.expires_at * 1000).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setPromoCodeData({ 
                        ...promoCodeData, 
                        expires_at: e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : undefined 
                      })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="promo-max-redemptions">Max Uses (Optional)</Label>
                    <Input
                      id="promo-max-redemptions"
                      type="number"
                      min="1"
                      value={promoCodeData.max_redemptions || ''}
                      onChange={(e) => setPromoCodeData({ 
                        ...promoCodeData, 
                        max_redemptions: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      placeholder="Unlimited"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="minimum-amount">Minimum Order (Optional)</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                        $
                      </span>
                      <Input
                        id="minimum-amount"
                        type="number"
                        step="0.01"
                        value={promoCodeData.minimum_amount || ''}
                        onChange={(e) => setPromoCodeData({ 
                          ...promoCodeData, 
                          minimum_amount: e.target.value ? parseFloat(e.target.value) : undefined 
                        })}
                        className="rounded-l-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleCreatePromotionCode} disabled={loading || !coupon}>
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Promotion Code
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {coupon && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700">Times Redeemed</p>
                        <p className="text-2xl font-bold text-blue-900">{coupon.times_redeemed}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700">Promotion Codes</p>
                        <p className="text-2xl font-bold text-green-900">{promotionCodes.length}</p>
                      </div>
                      <Tag className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-700">Active Codes</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {promotionCodes.filter(pc => pc.active).length}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-700">Remaining Uses</p>
                        <p className="text-2xl font-bold text-orange-900">
                          {coupon.max_redemptions ? coupon.max_redemptions - coupon.times_redeemed : '∞'}
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {coupon && coupon.redeem_by && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Expiration Date</p>
                      <p className="text-sm text-muted-foreground">
                        This coupon expires on {formatDate(coupon.redeem_by)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <div>
              {coupon && (
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteCoupon} 
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Coupon
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSaveCoupon} disabled={loading}>
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {coupon ? 'Update Coupon' : 'Create Coupon'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};