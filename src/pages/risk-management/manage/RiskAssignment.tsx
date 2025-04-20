import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Calendar,
  Check,
  Clock,
  Mail,
  Search,
  Shield, 
  UserCircle2,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/PageHeader';
import { Checkbox } from '@/components/ui/checkbox';

// Mock risk data
const mockRisk = {
  id: "1",
  title: "Unauthorized Access to Production Systems",
  type: "access_control",
  status: "open",
  riskLevel: "high",
  owner: "John Doe",
  reportedDate: "2024-04-15",
  dueDate: "2024-05-15",
  description: "There is a risk of unauthorized access to production systems due to weak access controls and password policies. This could lead to data breaches and system compromise."
};

// Mock team members for assignment
const mockTeamMembers = [
  { id: "1", name: "Jane Smith", role: "Security Analyst", email: "jane.smith@example.com", avatar: "/avatars/01.png" },
  { id: "2", name: "Mike Johnson", role: "Security Engineer", email: "mike.johnson@example.com", avatar: "/avatars/02.png" },
  { id: "3", name: "Sarah Williams", role: "Compliance Manager", email: "sarah.williams@example.com", avatar: "/avatars/03.png" },
  { id: "4", name: "David Brown", role: "System Administrator", email: "david.brown@example.com", avatar: "/avatars/04.png" },
  { id: "5", name: "Emily Davis", role: "Risk Analyst", email: "emily.davis@example.com", avatar: "/avatars/05.png" }
];

const RiskAssignment = () => {
  const { riskId } = useParams<{ riskId: string }>();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [emailSubject, setEmailSubject] = useState(`[Risk Assignment] #${riskId} - ${mockRisk.title}`);
  const [emailMessage, setEmailMessage] = useState(
    `You have been assigned to work on risk #${riskId}: ${mockRisk.title}.\n\nPlease review the risk details and implement the necessary mitigations.\n\nDue date: ${mockRisk.dueDate}`
  );
  const [sendEmail, setSendEmail] = useState(true);
  
  // For a real application, you would fetch the risk data based on riskId
  const risk = mockRisk;
  
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };
  
  // Filter team members based on search query
  const filteredTeamMembers = mockTeamMembers.filter(
    member => 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle team member selection
  const toggleMemberSelection = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };
  
  // Handle assignment submission
  const handleSubmitAssignment = () => {
    // In a real app, you would send this to the backend
    console.log("Assigning risk to:", selectedMembers.map(id => 
      mockTeamMembers.find(member => member.id === id)?.name
    ));
    console.log("Email subject:", emailSubject);
    console.log("Email message:", emailMessage);
    console.log("Send email:", sendEmail);
    
    // Navigate back to risk detail
    navigate(`/app/risk-management/manage/risks/${riskId}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(`/app/risk-management/manage/risks/${riskId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Risk
        </Button>
        <PageHeader 
          title={`Assign Risk #${risk.id}`} 
          description="Assign this risk to team members for resolution"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Summary Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Risk Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-base">{risk.title}</h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Badge className={getRiskLevelColor(risk.riskLevel)}>
                  {risk.riskLevel.toUpperCase()}
                </Badge>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Due: {risk.dueDate}
                </span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">{risk.description}</p>
            </div>
            
            <div className="pt-2">
              <Button variant="outline" className="w-full" onClick={() => navigate(`/app/risk-management/manage/risks/${riskId}`)}>
                View Full Details
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Assignment Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Assignment Details</CardTitle>
            <CardDescription>Select team members to assign this risk to</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Team Members List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {filteredTeamMembers.length > 0 ? (
                filteredTeamMembers.map(member => (
                  <div 
                    key={member.id} 
                    className={`flex items-center justify-between p-3 rounded-md border ${
                      selectedMembers.includes(member.id) 
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    } cursor-pointer transition-colors`}
                    onClick={() => toggleMemberSelection(member.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground hidden sm:inline-block">{member.email}</span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        selectedMembers.includes(member.id)
                          ? "bg-blue-500 text-white"
                          : "border border-slate-300 dark:border-slate-600"
                      }`}>
                        {selectedMembers.includes(member.id) && <Check className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCircle2 className="mx-auto h-8 w-8 mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm">No team members found</p>
                </div>
              )}
            </div>
            
            <Separator />
            
            {/* Email Notification */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="send-email" 
                  checked={sendEmail} 
                  onCheckedChange={(checked) => setSendEmail(!!checked)} 
                />
                <Label htmlFor="send-email" className="flex items-center gap-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Send email notification
                </Label>
              </div>
              
              {sendEmail && (
                <div className="space-y-4 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="email-subject">Email Subject</Label>
                    <Input
                      id="email-subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email-message">Email Message</Label>
                    <Textarea
                      id="email-message"
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      rows={6}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/app/risk-management/manage/risks/${riskId}`)}
            >
              Cancel
            </Button>
            <Button 
              disabled={selectedMembers.length === 0}
              onClick={handleSubmitAssignment}
            >
              <Shield className="mr-2 h-4 w-4" />
              Assign Risk
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* The sheet is not really needed anymore with the full page approach,
          but keeping it here as an alternative if we want to switch back */}
      <Sheet open={false} onOpenChange={setIsOpen}>
        <SheetContent className="sm:max-w-md lg:max-w-lg">
          <SheetHeader>
            <SheetTitle>Assign Risk #{riskId}</SheetTitle>
            <SheetDescription>
              Select team members to assign this risk to.
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 py-6">
            {/* Sheet content would go here if needed */}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default RiskAssignment; 