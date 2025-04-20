import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText, 
  History, 
  MessageSquare,
  Shield, 
  Trash2, 
  UserCircle2 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/PageHeader';

// Mock risk data
const mockRisk = {
  id: "1",
  title: "Unauthorized Access to Production Systems",
  type: "access_control",
  status: "open",
  likelihood: "likely",
  consequence: "major",
  riskLevel: "high",
  owner: "John Doe",
  reportedDate: "2024-04-15",
  dueDate: "2024-05-15",
  description: "There is a risk of unauthorized access to production systems due to weak access controls and password policies. This could lead to data breaches and system compromise.",
  affectedSystems: ["Production Database", "Customer Portal", "Admin Dashboard"],
  mitigationSteps: [
    { id: "1", description: "Implement multi-factor authentication", status: "pending", assignee: "Jane Smith" },
    { id: "2", description: "Review and update access control policies", status: "in_progress", assignee: "Mike Johnson" },
    { id: "3", description: "Conduct security awareness training", status: "completed", assignee: "Sarah Williams" }
  ],
  comments: [
    { id: "1", user: "Jane Smith", date: "2024-04-16", text: "I've assigned this to the security team for assessment." },
    { id: "2", user: "Mike Johnson", date: "2024-04-17", text: "Initial assessment complete. MFA implementation planning in progress." }
  ],
  history: [
    { id: "1", date: "2024-04-15", action: "Risk reported", user: "John Doe" },
    { id: "2", date: "2024-04-16", action: "Risk assigned to Security Team", user: "Jane Smith" },
    { id: "3", date: "2024-04-17", action: "Risk assessment started", user: "Mike Johnson" }
  ]
};

const RiskDetail = () => {
  const { riskId } = useParams<{ riskId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [newComment, setNewComment] = useState("");
  
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-500 text-white";
      case "in_progress":
        return "bg-yellow-500 text-white";
      case "mitigated":
        return "bg-green-500 text-white";
      case "accepted":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === "") return;
    
    // In a real app, you would send this to the backend
    console.log("New comment:", newComment);
    
    // Reset the form
    setNewComment("");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/app/risk-management/manage/risks")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Risks
        </Button>
        <PageHeader 
          title={`Risk #${risk.id}`} 
          description="Manage and update risk details"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Main risk information */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">{risk.title}</CardTitle>
                <Badge className={getRiskLevelColor(risk.riskLevel)}>
                  {risk.riskLevel.toUpperCase()}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                Reported on {risk.reportedDate} • Due by {risk.dueDate}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="mitigation">Mitigation</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                      {risk.description}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Risk Assessment</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="likelihood">Likelihood</Label>
                        <Select defaultValue={risk.likelihood}>
                          <SelectTrigger id="likelihood">
                            <SelectValue placeholder="Select likelihood" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rare">Rare</SelectItem>
                            <SelectItem value="unlikely">Unlikely</SelectItem>
                            <SelectItem value="possible">Possible</SelectItem>
                            <SelectItem value="likely">Likely</SelectItem>
                            <SelectItem value="almost_certain">Almost Certain</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="consequence">Consequence</Label>
                        <Select defaultValue={risk.consequence}>
                          <SelectTrigger id="consequence">
                            <SelectValue placeholder="Select consequence" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="insignificant">Insignificant</SelectItem>
                            <SelectItem value="minor">Minor</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="major">Major</SelectItem>
                            <SelectItem value="severe">Severe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Affected Systems</h3>
                    <div className="flex flex-wrap gap-2">
                      {risk.affectedSystems.map((system, index) => (
                        <Badge key={index} variant="outline" className="bg-slate-100 dark:bg-slate-800">
                          {system}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="mitigation" className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Mitigation Steps</h3>
                      <Button variant="outline" size="sm">
                        Add Step
                      </Button>
                    </div>
                    
                    {risk.mitigationSteps.map((step) => (
                      <div key={step.id} className="border rounded-md p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h4 className="font-medium">{step.description}</h4>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <UserCircle2 className="h-3 w-3" />
                              Assignee: {step.assignee}
                            </p>
                          </div>
                          <Badge className={
                            step.status === "completed" 
                              ? "bg-green-500 text-white" 
                              : step.status === "in_progress" 
                              ? "bg-yellow-500 text-white" 
                              : "bg-slate-500 text-white"
                          }>
                            {step.status.replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          {step.status !== "completed" && (
                            <Button variant="ghost" size="sm" className="text-green-600 dark:text-green-500">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="comments" className="space-y-6">
                  <form onSubmit={handleSubmitComment} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="comment">Add Comment</Label>
                      <Textarea 
                        id="comment" 
                        placeholder="Type your comment here..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                    </div>
                    <Button type="submit" disabled={newComment.trim() === ""}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Post Comment
                    </Button>
                  </form>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    {risk.comments.map((comment) => (
                      <div key={comment.id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <UserCircle2 className="h-5 w-5 text-slate-500" />
                            <span className="font-medium">{comment.user}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{comment.date}</span>
                        </div>
                        <p className="text-sm">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="history" className="space-y-4">
                  <div className="relative pl-6 space-y-6 before:absolute before:top-0 before:bottom-0 before:left-2.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                    {risk.history.map((event, index) => (
                      <div key={event.id} className="relative">
                        <div className="absolute -left-6 h-4 w-4 rounded-full bg-slate-300 dark:bg-slate-600 ring-4 ring-white dark:ring-slate-900 top-1" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{event.action}</p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {event.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <UserCircle2 className="h-3 w-3" />
                              {event.user}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" size="sm" className="text-red-600 dark:text-red-500">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Risk
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Cancel</Button>
                <Button variant="default" size="sm">Save Changes</Button>
              </div>
            </CardFooter>
          </Card>
        </div>
        
        {/* Right column - Status and metadata */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Risk Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="status">Current Status</Label>
                <Select defaultValue={risk.status}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="mitigated">Mitigated</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="owner">Risk Owner</Label>
                <Input id="owner" value={risk.owner} />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" value={risk.dueDate} type="date" />
              </div>
              
              <Button className="w-full mt-2">
                <Shield className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Related Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">Risk Assessment Report</span>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">Vulnerability Scan</span>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
              
              <Button variant="outline" className="w-full">
                Attach Document
              </Button>
            </CardContent>
          </Card>
          
          <Button 
            variant="default" 
            className="w-full"
            onClick={() => navigate(`/app/risk-management/manage/risks/${riskId}/assign`)}
          >
            Assign Risk
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RiskDetail; 