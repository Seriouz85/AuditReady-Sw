import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Building, PlusCircle, Eye, Edit, Trash2, MapPin, Phone, Mail, User, Tag, ListChecks, CheckCircle, XCircle, Clock, MinusCircle, Info, ChevronsUpDown, Network } from 'lucide-react';
import { Link } from "react-router-dom";

// --- Data Structures ---
const organizationTypes = [
  { value: "parent", label: "Parent Company", hierarchyLevel: 1 },
  { value: "subsidiary", label: "Subsidiary", hierarchyLevel: 2 },
  { value: "division", label: "Division", hierarchyLevel: 3 },
  { value: "region", label: "Region", hierarchyLevel: 4 },
  { value: "department", label: "Department", hierarchyLevel: 5 },
  { value: "section", label: "Section / Unit / Project team", hierarchyLevel: 6 },
  { value: "branch", label: "Office / Branch / Site", hierarchyLevel: 7 }
] as const;

type OrganizationType = typeof organizationTypes[number]["value"];

const complianceScopes = ["SOC2", "ISO27001", "PCI-DSS", "GDPR", "CCPA", "HIPAA"] as const;
type ComplianceScope = typeof complianceScopes[number];

const requirementStatuses = ["Fulfilled", "Not Fulfilled", "Partially Fulfilled", "In Progress", "Not Applicable"] as const;
type RequirementStatus = typeof requirementStatuses[number];

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  hierarchyLevel: number;
  parentId?: string; // ID of the parent organization
  corporateId?: string; 
  address: {
    street: string;
    city: string;
    state?: string;
    zip: string;
    country: string;
  };
  securityContact: {
    name: string;
    email: string;
  };
  legalContact?: {
    name: string;
    email: string;
  };
  description?: string;
  complianceScopeTags: ComplianceScope[];
}

// Mock data for demonstration
export const mockOrganizations: Organization[] = [
  // Parent Company
  {
    id: "org-parent-1",
    name: "TechCorp International",
    type: "parent",
    hierarchyLevel: 1,
    corporateId: "TCI12345678",
    address: {
      street: "1 Innovation Drive",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      country: "United States",
    },
    securityContact: {
      name: "Sarah Johnson",
      email: "sarah.johnson@techcorp.com",
    },
    description: "Global technology company providing innovative solutions.",
    complianceScopeTags: ["SOC2", "ISO27001", "GDPR"] as ComplianceScope[],
  },

  // Subsidiaries (3)
  {
    id: "org-sub-1",
    name: "TechCorp North America",
    type: "subsidiary",
    hierarchyLevel: 2,
    parentId: "org-parent-1",
    corporateId: "TCNA987654",
    address: {
      street: "200 Tech Park",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      country: "United States",
    },
    securityContact: {
      name: "Michael Chen",
      email: "michael.chen@techcorp.com",
    },
    description: "North American operations and headquarters.",
    complianceScopeTags: ["SOC2", "ISO27001", "GDPR"] as ComplianceScope[],
  },
  {
    id: "org-sub-2",
    name: "TechCorp Europe",
    type: "subsidiary",
    hierarchyLevel: 2,
    parentId: "org-parent-1",
    corporateId: "TCE789012",
    address: {
      street: "100 Innovation Square",
      city: "London",
      zip: "EC1A 1BB",
      country: "United Kingdom",
    },
    securityContact: {
      name: "Emma Wilson",
      email: "emma.wilson@techcorp.com",
    },
    description: "European operations and regional headquarters.",
    complianceScopeTags: ["SOC2", "ISO27001", "GDPR"] as ComplianceScope[],
  },
  {
    id: "org-sub-3",
    name: "TechCorp Asia Pacific",
    type: "subsidiary",
    hierarchyLevel: 2,
    parentId: "org-parent-1",
    corporateId: "TCAP345678",
    address: {
      street: "50 Tech Hub",
      city: "Singapore",
      zip: "038988",
      country: "Singapore",
    },
    securityContact: {
      name: "David Lee",
      email: "david.lee@techcorp.com",
    },
    description: "Asia Pacific operations and regional headquarters.",
    complianceScopeTags: ["SOC2", "ISO27001", "GDPR"] as ComplianceScope[],
  },

  // Divisions (7)
  {
    id: "org-div-1",
    name: "Cloud Services Division",
    type: "division",
    hierarchyLevel: 3,
    parentId: "org-sub-1",
    corporateId: "CSD123456",
    address: {
      street: "300 Cloud Way",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      country: "United States",
    },
    securityContact: {
      name: "Robert Cloud",
      email: "robert.cloud@techcorp.com",
    },
    description: "Cloud infrastructure and services division.",
    complianceScopeTags: ["SOC2", "ISO27001"] as ComplianceScope[],
  },
  {
    id: "org-div-2",
    name: "Security Operations Division",
    type: "division",
    hierarchyLevel: 3,
    parentId: "org-sub-1",
    corporateId: "SOD789012",
    address: {
      street: "400 Security Blvd",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      country: "United States",
    },
    securityContact: {
      name: "Lisa Security",
      email: "lisa.security@techcorp.com",
    },
    description: "Global security operations and monitoring.",
    complianceScopeTags: ["SOC2", "ISO27001"] as ComplianceScope[],
  },
  {
    id: "org-div-3",
    name: "Network Infrastructure Division",
    type: "division",
    hierarchyLevel: 3,
    parentId: "org-sub-1",
    corporateId: "NID345678",
    address: {
      street: "500 Network Lane",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      country: "United States",
    },
    securityContact: {
      name: "Tom Network",
      email: "tom.network@techcorp.com",
    },
    description: "Network infrastructure and connectivity services.",
    complianceScopeTags: ["SOC2", "ISO27001"] as ComplianceScope[],
  },
  {
    id: "org-div-4",
    name: "Software Development Division",
    type: "division",
    hierarchyLevel: 3,
    parentId: "org-sub-2",
    corporateId: "SDD123456",
    address: {
      street: "100 Code Street",
      city: "London",
      zip: "EC1A 1BB",
      country: "United Kingdom",
    },
    securityContact: {
      name: "James Developer",
      email: "james.developer@techcorp.com",
    },
    description: "Software development and engineering.",
    complianceScopeTags: ["SOC2", "GDPR"] as ComplianceScope[],
  },
  {
    id: "org-div-5",
    name: "Quality Assurance Division",
    type: "division",
    hierarchyLevel: 3,
    parentId: "org-sub-2",
    corporateId: "QAD789012",
    address: {
      street: "200 Test Avenue",
      city: "London",
      zip: "EC1A 1BB",
      country: "United Kingdom",
    },
    securityContact: {
      name: "Anna Tester",
      email: "anna.tester@techcorp.com",
    },
    description: "Quality assurance and testing services.",
    complianceScopeTags: ["SOC2", "GDPR"] as ComplianceScope[],
  },
  {
    id: "org-div-6",
    name: "Data Science Division",
    type: "division",
    hierarchyLevel: 3,
    parentId: "org-sub-3",
    corporateId: "DSD345678",
    address: {
      street: "300 Data Street",
      city: "Singapore",
      zip: "038988",
      country: "Singapore",
    },
    securityContact: {
      name: "Peter Scientist",
      email: "peter.scientist@techcorp.com",
    },
    description: "Data science and analytics services.",
    complianceScopeTags: ["SOC2", "GDPR"] as ComplianceScope[],
  },
  {
    id: "org-div-7",
    name: "Business Intelligence Division",
    type: "division",
    hierarchyLevel: 3,
    parentId: "org-sub-3",
    corporateId: "BID123456",
    address: {
      street: "400 BI Boulevard",
      city: "Singapore",
      zip: "038988",
      country: "Singapore",
    },
    securityContact: {
      name: "Sophie Analyst",
      email: "sophie.analyst@techcorp.com",
    },
    description: "Business intelligence and reporting services.",
    complianceScopeTags: ["SOC2", "GDPR"] as ComplianceScope[],
  },

  // Departments (13)
  {
    id: "org-dept-1",
    name: "Security Operations",
    type: "department",
    hierarchyLevel: 5,
    parentId: "org-div-2",
    corporateId: "SEC789012",
    address: {
      street: "400 Security Blvd",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      country: "United States",
    },
    securityContact: {
      name: "Mike Security",
      email: "mike.security@techcorp.com",
    },
    description: "Security operations and monitoring team.",
    complianceScopeTags: ["SOC2", "ISO27001"] as ComplianceScope[],
  },
  {
    id: "org-dept-2",
    name: "Network Operations",
    type: "department",
    hierarchyLevel: 5,
    parentId: "org-div-3",
    corporateId: "NET345678",
    address: {
      street: "500 Network Lane",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      country: "United States",
    },
    securityContact: {
      name: "Nancy Network",
      email: "nancy.network@techcorp.com",
    },
    description: "Network operations and maintenance team.",
    complianceScopeTags: ["SOC2", "ISO27001"] as ComplianceScope[],
  },
  {
    id: "org-dept-3",
    name: "Cloud Operations",
    type: "department",
    hierarchyLevel: 5,
    parentId: "org-div-1",
    corporateId: "CLO123456",
    address: {
      street: "300 Cloud Way",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      country: "United States",
    },
    securityContact: {
      name: "Oscar Cloud",
      email: "oscar.cloud@techcorp.com",
    },
    description: "Cloud infrastructure operations team.",
    complianceScopeTags: ["SOC2", "ISO27001"] as ComplianceScope[],
  },
  {
    id: "org-dept-4",
    name: "Frontend Development",
    type: "department",
    hierarchyLevel: 5,
    parentId: "org-div-4",
    corporateId: "FED789012",
    address: {
      street: "100 Code Street",
      city: "London",
      zip: "EC1A 1BB",
      country: "United Kingdom",
    },
    securityContact: {
      name: "Patricia Frontend",
      email: "patricia.frontend@techcorp.com",
    },
    description: "Frontend development team.",
    complianceScopeTags: ["SOC2", "GDPR"] as ComplianceScope[],
  },
  {
    id: "org-dept-5",
    name: "Backend Development",
    type: "department",
    hierarchyLevel: 5,
    parentId: "org-div-4",
    corporateId: "BED345678",
    address: {
      street: "100 Code Street",
      city: "London",
      zip: "EC1A 1BB",
      country: "United Kingdom",
    },
    securityContact: {
      name: "Quentin Backend",
      email: "quentin.backend@techcorp.com",
    },
    description: "Backend development team.",
    complianceScopeTags: ["SOC2", "GDPR"] as ComplianceScope[],
  },
  {
    id: "org-dept-6",
    name: "Quality Assurance",
    type: "department",
    hierarchyLevel: 5,
    parentId: "org-div-5",
    corporateId: "QAD123456",
    address: {
      street: "200 Test Avenue",
      city: "London",
      zip: "EC1A 1BB",
      country: "United Kingdom",
    },
    securityContact: {
      name: "Rachel QA",
      email: "rachel.qa@techcorp.com",
    },
    description: "Quality assurance team.",
    complianceScopeTags: ["SOC2", "GDPR"] as ComplianceScope[],
  },
  {
    id: "org-dept-7",
    name: "Data Engineering",
    type: "department",
    hierarchyLevel: 5,
    parentId: "org-div-6",
    corporateId: "DEG789012",
    address: {
      street: "300 Data Street",
      city: "Singapore",
      zip: "038988",
      country: "Singapore",
    },
    securityContact: {
      name: "Sam Engineer",
      email: "sam.engineer@techcorp.com",
    },
    description: "Data engineering team.",
    complianceScopeTags: ["SOC2", "GDPR"] as ComplianceScope[],
  },
  {
    id: "org-dept-8",
    name: "Machine Learning",
    type: "department",
    hierarchyLevel: 5,
    parentId: "org-div-6",
    corporateId: "MLD345678",
    address: {
      street: "300 Data Street",
      city: "Singapore",
      zip: "038988",
      country: "Singapore",
    },
    securityContact: {
      name: "Tom ML",
      email: "tom.ml@techcorp.com",
    },
    description: "Machine learning team.",
    complianceScopeTags: ["SOC2", "GDPR"] as ComplianceScope[],
  },
  {
    id: "org-dept-9",
    name: "Business Analytics",
    type: "department",
    hierarchyLevel: 5,
    parentId: "org-div-7",
    corporateId: "BAD123456",
    address: {
      street: "400 BI Boulevard",
      city: "Singapore",
      zip: "038988",
      country: "Singapore",
    },
    securityContact: {
      name: "Ursula Analyst",
      email: "ursula.analyst@techcorp.com",
    },
    description: "Business analytics team.",
    complianceScopeTags: ["SOC2", "GDPR"] as ComplianceScope[],
  },
  {
    id: "org-dept-10",
    name: "Reporting Services",
    type: "department",
    hierarchyLevel: 5,
    parentId: "org-div-7",
    corporateId: "RSD789012",
    address: {
      street: "400 BI Boulevard",
      city: "Singapore",
      zip: "038988",
      country: "Singapore",
    },
    securityContact: {
      name: "Victor Report",
      email: "victor.report@techcorp.com",
    },
    description: "Reporting services team.",
    complianceScopeTags: ["SOC2", "GDPR"] as ComplianceScope[],
  },
  {
    id: "org-dept-11",
    name: "DevOps",
    type: "department",
    hierarchyLevel: 5,
    parentId: "org-div-1",
    corporateId: "DOP345678",
    address: {
      street: "300 Cloud Way",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      country: "United States",
    },
    securityContact: {
      name: "Wendy DevOps",
      email: "wendy.devops@techcorp.com",
    },
    description: "DevOps team.",
    complianceScopeTags: ["SOC2", "ISO27001"] as ComplianceScope[],
  },
  {
    id: "org-dept-12",
    name: "Database Administration",
    type: "department",
    hierarchyLevel: 5,
    parentId: "org-div-1",
    corporateId: "DBA123456",
    address: {
      street: "300 Cloud Way",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      country: "United States",
    },
    securityContact: {
      name: "Xavier DBA",
      email: "xavier.dba@techcorp.com",
    },
    description: "Database administration team.",
    complianceScopeTags: ["SOC2", "ISO27001"] as ComplianceScope[],
  },
  {
    id: "org-dept-13",
    name: "System Administration",
    type: "department",
    hierarchyLevel: 5,
    parentId: "org-div-1",
    corporateId: "SAD789012",
    address: {
      street: "300 Cloud Way",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      country: "United States",
    },
    securityContact: {
      name: "Yvonne SysAdmin",
      email: "yvonne.sysadmin@techcorp.com",
    },
    description: "System administration team.",
    complianceScopeTags: ["SOC2", "ISO27001"] as ComplianceScope[],
  },

  // Branches (3)
  {
    id: "org-branch-1",
    name: "San Francisco Office",
    type: "branch",
    hierarchyLevel: 7,
    parentId: "org-dept-1",
    corporateId: "SFO345678",
    address: {
      street: "400 Security Blvd",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      country: "United States",
    },
    securityContact: {
      name: "Zach Office",
      email: "zach.office@techcorp.com",
    },
    description: "Main office location in San Francisco.",
    complianceScopeTags: ["SOC2"] as ComplianceScope[],
  },
  {
    id: "org-branch-2",
    name: "London Office",
    type: "branch",
    hierarchyLevel: 7,
    parentId: "org-dept-4",
    corporateId: "LON123456",
    address: {
      street: "100 Code Street",
      city: "London",
      zip: "EC1A 1BB",
      country: "United Kingdom",
    },
    securityContact: {
      name: "Alice Office",
      email: "alice.office@techcorp.com",
    },
    description: "Main office location in London.",
    complianceScopeTags: ["SOC2"] as ComplianceScope[],
  },
  {
    id: "org-branch-3",
    name: "Singapore Office",
    type: "branch",
    hierarchyLevel: 7,
    parentId: "org-dept-7",
    corporateId: "SIN789012",
    address: {
      street: "300 Data Street",
      city: "Singapore",
      zip: "038988",
      country: "Singapore",
    },
    securityContact: {
      name: "Bob Office",
      email: "bob.office@techcorp.com",
    },
    description: "Main office location in Singapore.",
    complianceScopeTags: ["SOC2"] as ComplianceScope[],
  }
];

// --- Zod Schema for Form Validation ---
const organizationSchema = z.object({
  name: z.string().min(2, { message: "Organization name must be at least 2 characters." }),
  type: z.enum(organizationTypes.map(t => t.value) as [OrganizationType, ...OrganizationType[]], { 
    required_error: "Organization type is required." 
  }),
  parentId: z.string().optional(),
  corporateId: z.string().optional(),
  street: z.string().min(3, { message: "Street address is required." }),
  city: z.string().min(2, { message: "City is required." }),
  state: z.string().optional(),
  zip: z.string().min(3, { message: "ZIP/Postal code is required." }),
  country: z.string().min(2, { message: "Country is required." }),
  securityContactName: z.string().min(2, { message: "Security contact name is required." }),
  securityContactEmail: z.string().email({ message: "Invalid email address." }),
  legalContactName: z.string().optional(),
  legalContactEmail: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  description: z.string().optional(),
  complianceScopeTags: z.array(z.enum(complianceScopes)).min(1, { message: "Select at least one compliance scope." }),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

// --- Requirements Placeholder ---
// In a real app, this would come from your requirements data
const mockRequirements = [
  { id: 'req-001', name: 'Access Control Policy', scope: ['SOC2', 'ISO27001'], status: 'Fulfilled' as RequirementStatus },
  { id: 'req-002', name: 'Data Encryption Standard', scope: ['SOC2', 'PCI-DSS', 'GDPR'], status: 'In Progress' as RequirementStatus },
  { id: 'req-003', name: 'Incident Response Plan', scope: ['SOC2', 'ISO27001'], status: 'Not Fulfilled' as RequirementStatus },
  { id: 'req-004', name: 'Vendor Security Assessment', scope: ['SOC2'], status: 'Partially Fulfilled' as RequirementStatus },
  { id: 'req-005', name: 'Employee Background Checks', scope: ['ISO27001'], status: 'Not Applicable' as RequirementStatus },
];

const RequirementStatusIcon = ({ status }: { status: RequirementStatus }) => {
  switch (status) {
    case 'Fulfilled': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'Not Fulfilled': return <XCircle className="h-4 w-4 text-red-500" />;
    case 'Partially Fulfilled': return <MinusCircle className="h-4 w-4 text-yellow-500" />;
    case 'In Progress': return <Clock className="h-4 w-4 text-blue-500" />;
    case 'Not Applicable': return <Info className="h-4 w-4 text-gray-500" />;
    default: return null;
  }
};

// --- Main Component ---
const Organizations: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [isRegisterSheetOpen, setIsRegisterSheetOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Organization; direction: 'asc' | 'desc' }>({
    key: 'hierarchyLevel',
    direction: 'asc'
  });
  const { toast } = useToast();

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      type: undefined,
      parentId: "",
      corporateId: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      securityContactName: "",
      securityContactEmail: "",
      legalContactName: "",
      legalContactEmail: "",
      description: "",
      complianceScopeTags: [],
    },
  });

  // Watch organization type to update available parent organizations
  const selectedType = form.watch("type");
  const selectedParentId = form.watch("parentId");

  // Get available parent organizations based on selected type
  const getAvailableParents = () => {
    if (!selectedType) return [];
    
    const typeInfo = organizationTypes.find(t => t.value === selectedType);
    if (!typeInfo) return [];

    // Filter organizations that can be parents based on hierarchy level
    return organizations.filter(org => 
      org.hierarchyLevel < typeInfo.hierarchyLevel
    );
  };

  // Generate corporate ID based on organization type and parent
  const generateCorporateId = (type: OrganizationType, parentId?: string) => {
    const prefix = type.charAt(0).toUpperCase();
    const parentOrg = parentId ? organizations.find(o => o.id === parentId) : null;
    const parentPrefix = parentOrg ? parentOrg.corporateId?.substring(0, 2) : '';
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${parentPrefix}${prefix}${random}`;
  };

  const onSubmit = async (data: OrganizationFormData) => {
    try {
      // Validate parent organization if required
      if (data.type !== 'parent' && !data.parentId) {
        toast({
          title: "Validation Error",
          description: "Please select a parent organization.",
          variant: "destructive",
        });
        return;
      }

      // Generate corporate ID
      const corporateId = generateCorporateId(data.type, data.parentId);

      const newOrg: Organization = {
        id: `org-${Date.now()}`,
        name: data.name,
        type: data.type,
        hierarchyLevel: organizationTypes.find(t => t.value === data.type)?.hierarchyLevel || 0,
        parentId: data.type === 'parent' ? undefined : data.parentId,
        corporateId,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zip: data.zip,
          country: data.country,
        },
        securityContact: {
          name: data.securityContactName,
          email: data.securityContactEmail,
        },
        legalContact: data.legalContactName && data.legalContactEmail ? {
          name: data.legalContactName,
          email: data.legalContactEmail,
        } : undefined,
        description: data.description,
        complianceScopeTags: data.complianceScopeTags,
      };

      // Add new organization to the list
      setOrganizations(prev => [...prev, newOrg]);
      
      // Show success message
      toast({
        title: "Organization Registered",
        description: `${data.name} has been successfully added to the organizational structure.`,
      });

      // Reset form and close dialog
      form.reset();
      setIsRegisterSheetOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register the organization. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (org: Organization) => {
    setSelectedOrganization(org);
    setIsDetailsDialogOpen(true);
  };

  const handleRequirementStatusChange = (reqId: string, newStatus: RequirementStatus) => {
    console.log(`Requirement ${reqId} status changed to ${newStatus} for org ${selectedOrganization?.id}`);
    // TODO: Implement logic to save this status change, likely per organization-requirement pair
    toast({ title: "Status Updated", description: `Requirement status set to ${newStatus}.` });
  };

  // Filter requirements applicable to the selected organization
  const applicableRequirements = selectedOrganization
    ? mockRequirements.filter(req => 
        req.scope.some(scopeTag => selectedOrganization.complianceScopeTags.includes(scopeTag))
      )
    : [];

  const handleSort = (key: keyof Organization) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedAndFilteredOrganizations = () => {
    let filtered = organizations.filter(org => 
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.address.country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortConfig.key === 'hierarchyLevel') {
      filtered.sort((a, b) => {
        const result = a.hierarchyLevel - b.hierarchyLevel;
        return sortConfig.direction === 'asc' ? result : -result;
      });
    } else if (sortConfig.key === 'name') {
      filtered.sort((a, b) => {
        const result = a.name.localeCompare(b.name);
        return sortConfig.direction === 'asc' ? result : -result;
      });
    } else if (sortConfig.key === 'type') {
      filtered.sort((a, b) => {
        const result = a.type.localeCompare(b.type);
        return sortConfig.direction === 'asc' ? result : -result;
      });
    } else if (sortConfig.key === 'address') {
      filtered.sort((a, b) => {
        const result = `${a.address.city}, ${a.address.country}`.localeCompare(`${b.address.city}, ${b.address.country}`);
        return sortConfig.direction === 'asc' ? result : -result;
      });
    }

    return filtered;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Organizations</h1>
        <div className="flex gap-2">
          <Link to="/organizations/chart">
            <Button variant="outline">
              <Network className="mr-2 h-4 w-4" />
              View Org Chart
            </Button>
          </Link>
          <Sheet open={isRegisterSheetOpen} onOpenChange={setIsRegisterSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Organization
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-2xl">
              <ScrollArea className="h-full pr-6">
                <SheetHeader>
                  <SheetTitle>Register New Organization</SheetTitle>
                  <SheetDescription>
                    Fill in the details for the new organization. Click save when done.
                  </SheetDescription>
                </SheetHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                    {/* Basic Info */}
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl><Input placeholder="Enter organization name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>

                    <FormField control={form.control} name="type" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Type <span className="text-red-500">*</span></FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Clear parent when type changes
                            form.setValue("parentId", "");
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl><SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger></FormControl>
                          <SelectContent>
                            {organizationTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}/>

                    {selectedType && selectedType !== 'parent' && (
                      <FormField control={form.control} name="parentId" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent Organization <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select parent organization..." /></SelectTrigger></FormControl>
                            <SelectContent>
                              {getAvailableParents().map(org => (
                                <SelectItem key={org.id} value={org.id}>
                                  {org.name} ({organizationTypes.find(t => t.value === org.type)?.label})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}/>
                    )}

                    {/* Address */}
                    <h3 className="text-lg font-semibold border-t pt-4">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="street" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input placeholder="123 Main St" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                      <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem>
                          <FormLabel>City <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input placeholder="Metropolis" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                      <FormField control={form.control} name="state" render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province</FormLabel>
                          <FormControl><Input placeholder="CA" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                      <FormField control={form.control} name="zip" render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP/Postal Code <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input placeholder="90210" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                      <FormField control={form.control} name="country" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select country..." /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="United States">United States</SelectItem>
                              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                              <SelectItem value="Ireland">Ireland</SelectItem>
                              <SelectItem value="Germany">Germany</SelectItem>
                              <SelectItem value="France">France</SelectItem>
                              <SelectItem value="Japan">Japan</SelectItem>
                              <SelectItem value="Australia">Australia</SelectItem>
                              <SelectItem value="Canada">Canada</SelectItem>
                              <SelectItem value="Singapore">Singapore</SelectItem>
                              <SelectItem value="Netherlands">Netherlands</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}/>
                    </div>

                    {/* Contacts */}
                    <h3 className="text-lg font-semibold border-t pt-4">Key Contacts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="securityContactName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Security Contact Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input placeholder="Alice Secure" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                      <FormField control={form.control} name="securityContactEmail" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Security Contact Email <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input type="email" placeholder="security@example.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="legalContactName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Legal Contact Name</FormLabel>
                          <FormControl><Input placeholder="Bob Lawful" {...field} /></FormControl>
                          <FormDescription>Optional</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}/>
                      <FormField control={form.control} name="legalContactEmail" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Legal Contact Email</FormLabel>
                          <FormControl><Input type="email" placeholder="legal@example.com" {...field} /></FormControl>
                          <FormDescription>Optional</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}/>
                    </div>

                    {/* Other Info */}
                    <h3 className="text-lg font-semibold border-t pt-4">Additional Information</h3>
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description / Relationship</FormLabel>
                        <FormControl><Textarea placeholder="e.g., Provides critical cloud hosting services..." {...field} /></FormControl>
                        <FormDescription>Briefly describe the organization or its relationship.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="complianceScopeTags" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compliance Scope Tags <span className="text-red-500">*</span></FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {complianceScopes.map((scope: ComplianceScope) => (
                            <FormField
                              key={scope}
                              control={form.control}
                              name="complianceScopeTags"
                              render={({ field }) => {
                                return (
                                  <FormItem key={scope} className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
                                        checked={field.value?.includes(scope as ComplianceScope)}
                                        onChange={(e) => {
                                          const currentScopes: ComplianceScope[] = field.value || [];
                                          let newScopes: ComplianceScope[];
                                          if (e.target.checked) {
                                            // Add if not already present
                                            newScopes = currentScopes.includes(scope as ComplianceScope) 
                                              ? currentScopes 
                                              : [...currentScopes, scope as ComplianceScope];
                                          } else {
                                            // Remove the scope
                                            newScopes = currentScopes.filter(s => s !== scope);
                                          }
                                          field.onChange(newScopes); // Pass the correctly typed array
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{scope}</FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormDescription>Select all applicable compliance frameworks/regulations.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}/>

                    <SheetFooter className="mt-6">
                      <SheetClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </SheetClose>
                      <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Saving..." : "Save Organization"}
                      </Button>
                    </SheetFooter>
                  </form>
                </Form>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Organizational Structure</CardTitle>
              <CardDescription>Hierarchical view of TechCorp International and its entities.</CardDescription>
            </div>
            <div className="w-full md:w-auto">
              <Input
                placeholder="Search organizations by name, type, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-[400px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Name
                    {sortConfig.key === 'name' && (
                      <ChevronsUpDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center gap-2">
                    Type
                    {sortConfig.key === 'type' && (
                      <ChevronsUpDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('hierarchyLevel')}
                >
                  <div className="flex items-center gap-2">
                    Hierarchy Level
                    {sortConfig.key === 'hierarchyLevel' && (
                      <ChevronsUpDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Parent Organization</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('address')}
                >
                  <div className="flex items-center gap-2">
                    Location
                    {sortConfig.key === 'address' && (
                      <ChevronsUpDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Security Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getSortedAndFilteredOrganizations().length > 0 ? (
                getSortedAndFilteredOrganizations().map((org) => (
                  <TableRow 
                    key={org.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewDetails(org)}
                  >
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>{organizationTypes.find(t => t.value === org.type)?.label}</TableCell>
                    <TableCell>{org.hierarchyLevel}</TableCell>
                    <TableCell>
                      {org.parentId ? (
                        organizations.find(o => o.id === org.parentId)?.name || 'Unknown'
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {org.address.city}, {org.address.country}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {org.securityContact.name}<br/>{org.securityContact.email}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" disabled title="Edit (Not Implemented)">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" disabled title="Delete (Not Implemented)" className="text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No organizations found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        {selectedOrganization && (
          <DialogContent className="max-w-3xl">
            <ScrollArea className="max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5"/> {selectedOrganization.name}
                </DialogTitle>
                <DialogDescription>{organizationTypes.find(t => t.value === selectedOrganization.type)?.label} Organization Details</DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 px-1">
                {/* Column 1: Details */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle className="text-lg">Basic Information</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p><strong>Type:</strong> {organizationTypes.find(t => t.value === selectedOrganization.type)?.label}</p>
                      {selectedOrganization.parentId && (
                        <p><strong>Parent:</strong> {organizations.find(o => o.id === selectedOrganization.parentId)?.name || 'Unknown'}</p>
                      )}
                      {selectedOrganization.corporateId && (
                        <p><strong>Corp ID:</strong> {selectedOrganization.corporateId}</p>
                      )}
                      {selectedOrganization.description && (
                        <p><strong>Description:</strong> {selectedOrganization.description}</p>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-lg">Address</CardTitle></CardHeader>
                    <CardContent className="space-y-1 text-sm">
                      <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground"/> 
                        {selectedOrganization.address.street}, {selectedOrganization.address.city},
                        {selectedOrganization.address.state && ` ${selectedOrganization.address.state},`}
                        {` ${selectedOrganization.address.zip}`}, {selectedOrganization.address.country}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-lg">Contacts</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p className="font-medium">Security Contact:</p>
                      <p className="flex items-center gap-2 ml-2"><User className="h-4 w-4 text-muted-foreground"/> {selectedOrganization.securityContact.name}</p>
                      <p className="flex items-center gap-2 ml-2"><Mail className="h-4 w-4 text-muted-foreground"/> {selectedOrganization.securityContact.email}</p>
                      {selectedOrganization.legalContact && (
                        <>
                          <p className="font-medium pt-2">Legal Contact:</p>
                          <p className="flex items-center gap-2 ml-2"><User className="h-4 w-4 text-muted-foreground"/> {selectedOrganization.legalContact.name}</p>
                          <p className="flex items-center gap-2 ml-2"><Mail className="h-4 w-4 text-muted-foreground"/> {selectedOrganization.legalContact.email}</p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Column 2: Compliance */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle className="text-lg">Compliance Scope</CardTitle></CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      {selectedOrganization.complianceScopeTags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ListChecks className="h-5 w-5"/> Applicable Requirements
                      </CardTitle>
                      <CardDescription>Status of requirements based on compliance scope.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {applicableRequirements.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Requirement</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {applicableRequirements.map(req => (
                              <TableRow key={req.id}>
                                <TableCell className="text-sm">{req.name}</TableCell>
                                <TableCell>
                                  <Select 
                                    defaultValue={req.status} // Assuming mock data holds current status
                                    onValueChange={(value) => handleRequirementStatusChange(req.id, value as RequirementStatus)}>
                                    <SelectTrigger className="h-8 text-xs w-[150px]">
                                      <div className="flex items-center gap-1">
                                        <RequirementStatusIcon status={req.status}/>
                                        <SelectValue placeholder="Set status..." />
                                      </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {requirementStatuses.map(status => (
                                        <SelectItem key={status} value={status} className="text-xs">
                                          <div className="flex items-center gap-2">
                                            <RequirementStatusIcon status={status}/>
                                            {status}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No applicable requirements found based on the selected compliance scopes.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              <DialogFooter className="mt-4 pr-1">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Close</Button>
                </DialogClose>
              </DialogFooter>
            </ScrollArea>
          </DialogContent>
        )} 
      </Dialog>
    </div>
  );
};

export default Organizations; 