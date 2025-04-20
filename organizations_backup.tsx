import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Building2, Users, Network, Phone, Mail, Building, FileText, Shield } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

// Organization type definition
interface Organization {
  id: string;
  name: string;
  type: string;
  parentId?: string;
  hierarchyLevel: number;
  registrationNumber: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  securityContact: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  complianceStatus: {
    totalRequirements: number;
    completedRequirements: number;
    progress: number;
  };
  description: string;
  industry: string;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}

// Form schema
const organizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.string(),
  parentId: z.string().optional(),
  hierarchyLevel: z.number().min(1).max(10),
  registrationNumber: z.string(),
  street: z.string(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string(),
  phone: z.string(),
  email: z.string().email(),
  website: z.string().url().optional(),
  securityContactName: z.string(),
  securityContactEmail: z.string().email(),
  securityContactPhone: z.string(),
  securityContactRole: z.string(),
  description: z.string(),
  industry: z.string(),
  employeeCount: z.number().positive(),
});

// Mock data for demonstration
const mockOrganizations: Organization[] = [
  {
    id: "org-1",
    name: "Main Corporation",
    type: "Parent",
    hierarchyLevel: 1,
    registrationNumber: "REG123456",
    address: {
      street: "123 Main St",
      city: "Stockholm",
      postalCode: "11111",
      country: "Sweden",
    },
    contact: {
      phone: "+46 123 456 789",
      email: "contact@maincorp.com",
      website: "https://maincorp.com",
    },
    securityContact: {
      name: "John Doe",
      email: "security@maincorp.com",
      phone: "+46 123 456 790",
      role: "CISO",
    },
    complianceStatus: {
      totalRequirements: 150,
      completedRequirements: 120,
      progress: 80,
    },
    description: "Main parent corporation",
    industry: "Technology",
    employeeCount: 5000,
    createdAt: "2024-01-01",
    updatedAt: "2024-04-15",
  },
  // Add more mock organizations as needed
];

export default function Organizations() {
  const [organizations] = useState<Organization[]>(mockOrganizations);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof organizationSchema>>({
    resolver: zodResolver(organizationSchema),
  });

  const onSubmit = (data: z.infer<typeof organizationSchema>) => {
    console.log(data);
    toast({
      title: "Organization registered",
      description: "The organization has been successfully registered.",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-muted-foreground">
            Manage your organizational structure and compliance requirements
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Building2 className="mr-2 h-4 w-4" />
              Register New Organization
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Register New Organization</DialogTitle>
              <DialogDescription>
                Add a new organization to your compliance management structure.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[600px]">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Basic Information */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter organization name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="parent">Parent Company</SelectItem>
                              <SelectItem value="subsidiary">Subsidiary</SelectItem>
                              <SelectItem value="department">Department</SelectItem>
                              <SelectItem value="branch">Branch Office</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Add more form fields for other properties */}
                    <FormField
                      control={form.control}
                      name="hierarchyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hierarchy Level (1-10)</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max="10" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                          </FormControl>
                          <FormDescription>1 is top level, 10 is lowest level</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="registrationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter organization registration number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select industry" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="manufacturing">Manufacturing</SelectItem>
                              <SelectItem value="retail">Retail</SelectItem>
                              <SelectItem value="energy">Energy</SelectItem>
                              <SelectItem value="telecommunications">Telecommunications</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="employeeCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Employees</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" placeholder="Enter number of employees" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Address Information */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Address Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter street address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter city" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter postal code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter country" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Contact Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter website URL" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Security Contact Information */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Security Contact Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="securityContactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Security Contact Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter security contact name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="securityContactRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Security Contact Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ciso">CISO</SelectItem>
                                <SelectItem value="security-manager">Security Manager</SelectItem>
                                <SelectItem value="it-director">IT Director</SelectItem>
                                <SelectItem value="security-officer">Security Officer</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="securityContactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Security Contact Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter security contact email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="securityContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Security Contact Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter security contact phone" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Additional Information</h3>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter a description of the organization"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="submit" className="w-full">Register Organization</Button>
                  </div>
                </form>
              </Form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Organization Structure */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            <Network className="inline-block mr-2" />
            Organizational Structure
          </CardTitle>
          <CardDescription>
            View and manage your organizational hierarchy
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Add organizational chart visualization here */}
          <div className="grid gap-4">
            {organizations.map((org) => (
              <Card key={org.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{org.name}</h3>
                    <p className="text-sm text-muted-foreground">Level {org.hierarchyLevel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Compliance Progress</p>
                    <Progress value={org.complianceStatus.progress} className="w-[200px]" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {org.complianceStatus.completedRequirements} of {org.complianceStatus.totalRequirements} requirements met
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div className="space-y-2">
                    <p className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {org.employeeCount} employees
                    </p>
                    <p className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {org.contact.phone}
                    </p>
                    <p className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {org.contact.email}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-center">
                      <Building className="w-4 h-4 mr-2" />
                      {org.address.city}, {org.address.country}
                    </p>
                    <p className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      {org.registrationNumber}
                    </p>
                    <p className="flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      {org.securityContact.name} (CISO)
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 