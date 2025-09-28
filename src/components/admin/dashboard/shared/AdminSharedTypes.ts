// Admin Dashboard Shared Types
// Extracted from AdminDashboard.tsx to support component architecture

export interface PlatformStats {
  totalOrganizations: number;
  totalUsers: number;
  totalStandards: number;
  totalRequirements: number;
  activeAssessments: number;
  recentUpdates: number;
}

export interface StandardSummary {
  id: string;
  name: string;
  version: string;
  type: string;
  requirementCount: number;
  organizationCount: number;
  lastUpdated: string;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  tier: string;
  userCount: number;
  assessmentCount: number;
  lastActivity: string;
  isActive: boolean;
  industry?: string;
  companySize?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  revenue?: number;
}

export interface StripeStats {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  customers: number;
  connectionStatus: boolean;
}

// Admin Dashboard Component Props
export interface AdminDashboardHeaderProps {
  stats: PlatformStats | null;
  stripeStats: StripeStats | null;
  authUser: any;
  signOut: () => void;
}

export interface StatsWidgetProps {
  stats: PlatformStats | null;
  organizations: OrganizationSummary[];
  standards: StandardSummary[];
  loading: boolean;
}

// Tab Management Props
export interface TabManagementProps {
  standards: StandardSummary[];
  organizations: OrganizationSummary[];
  stripeProducts: any[];
  stripePrices: any[];
  stripeCoupons: any[];
  stripeCustomers: any[];
  stripeStats: StripeStats | null;
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onRefresh: () => Promise<void>;
}

// Organization Form Interface
export interface OrganizationForm {
  name: string;
  subscription_tier: string;
  industry: string;
  company_size: string;
}

// Modal States Interface
export interface ModalStates {
  productModalOpen: boolean;
  couponModalOpen: boolean;
  createStandardModalOpen: boolean;
  orgSettingsOpen: boolean;
  setProductModalOpen: (open: boolean) => void;
  setCouponModalOpen: (open: boolean) => void;
  setCreateStandardModalOpen: (open: boolean) => void;
  setOrgSettingsOpen: (open: boolean) => void;
}

// Selected Items Interface
export interface SelectedItems {
  selectedProduct: any | null;
  selectedCoupon: any | null;
  selectedOrg: OrganizationSummary | null;
  editingOrg: OrganizationSummary | null;
  setSelectedProduct: (product: any | null) => void;
  setSelectedCoupon: (coupon: any | null) => void;
  setSelectedOrg: (org: OrganizationSummary | null) => void;
  setEditingOrg: (org: OrganizationSummary | null) => void;
}

// Form Management Interface
export interface FormManagement {
  orgForm: OrganizationForm;
  setOrgForm: (form: OrganizationForm) => void;
}