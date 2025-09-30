import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PRICING_PLANS } from "@/lib/stripe";
import { createCheckoutSession, redirectToCheckout } from "@/api/stripe";
import { toast } from "@/utils/toast";
import { supabase } from "@/lib/supabase";
import { useDynamicPricing } from "@/hooks/useDynamicPricing";
import { useTheme } from "next-themes";

// Import all extracted components
import { LandingHeader } from "@/components/landing/LandingHeader";
import HeroSection from "@/components/landing/HeroSection";
import LogoShowcase from "@/components/landing/LogoShowcase";
import DashboardPreview from "@/components/landing/DashboardPreview";
import AutomatedAssessmentSection from "@/components/landing/AutomatedAssessmentSection";
import UltraAIShowcase from "@/components/landing/UltraAIShowcase";
import DataGovernanceSection from "@/components/landing/DataGovernanceSection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import IntegrationsSection from "@/components/landing/IntegrationsSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Landing() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { theme } = useTheme();
  const { plans: dynamicPlans, loading: pricingLoading } = useDynamicPricing();

  const handlePricingClick = async (tier: 'free' | 'team' | 'business' | 'enterprise') => {
    if (tier === 'free') {
      // Free tier goes to onboarding
      navigate('/onboarding');
      return;
    }

    if (tier === 'enterprise') {
      // Enterprise goes to contact sales
      navigate('/contact');
      return;
    }

    // Check if Stripe is configured
    const publishableKey = import.meta.env['VITE_STRIPE_PUBLISHABLE_KEY'];
    if (!publishableKey || publishableKey === 'your-stripe-publishable-key') {
      // If Stripe not configured, go to onboarding flow
      navigate('/onboarding');
      return;
    }

    // Get the price ID from dynamic plans or fallback to static config
    const dynamicPlan = dynamicPlans.find(p => p.id === tier);
    const staticPlan = PRICING_PLANS[tier];
    const plan = dynamicPlan || staticPlan;

    if (!plan || !plan.stripePriceId) {
      toast.error('This plan is not yet configured. Please contact support.');
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Store the intended plan and redirect to onboarding
        sessionStorage.setItem('intendedPlan', tier);
        sessionStorage.setItem('intendedPriceId', plan.stripePriceId);
        navigate('/pricing');
        return;
      }

      // Create checkout session with user context
      const result = await createCheckoutSession({
        priceId: plan.stripePriceId,
        customerEmail: user.email || undefined,
        tier: tier
      });

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.sessionId) {
        // Redirect to Stripe Checkout
        await redirectToCheckout(result.sessionId);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Unable to process payment. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className={`min-h-screen overflow-x-hidden ${theme === 'light' ? 'bg-gradient-to-b from-slate-100 to-white' : 'bg-gradient-to-b from-slate-900 to-slate-800'}`}>
      {/* Header */}
      <LandingHeader />

      {/* Hero Section */}
      <HeroSection />

      {/* Logo Showcase */}
      <LogoShowcase />

      {/* Dashboard Preview */}
      <DashboardPreview />

      {/* Automated Assessment Engine */}
      <AutomatedAssessmentSection />

      {/* Ultra AI Showcase */}
      <UltraAIShowcase />

      {/* Data Governance & Security */}
      <DataGovernanceSection />

      {/* Integrations */}
      <IntegrationsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Pricing */}
      <PricingSection
        onPricingClick={handlePricingClick}
        isProcessingPayment={isProcessingPayment}
        pricingLoading={pricingLoading}
        dynamicPlans={dynamicPlans}
      />

      {/* FAQ */}
      <FAQSection />

      {/* CTA */}
      <CTASection />

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
