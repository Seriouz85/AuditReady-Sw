import { useEffect, useState } from 'react';
import { firebaseService, Requirement, RequirementStatus, Priority } from '@/services/firebaseService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface NewRequirementForm {
  name: string;
  description: string;
  category: string;
  status: RequirementStatus;
  priority: Priority;
  tags: string[];
  dueDate?: Date;
  assignedTo?: string;
  notes?: string;
  variables: Array<{ name: string; value: string }>;
}

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRequirement, setNewRequirement] = useState<NewRequirementForm>({
    name: '',
    description: '',
    category: '',
    status: 'NOT_FULFILLED',
    priority: 'MEDIUM',
    tags: [],
    variables: [{ name: '', value: '' }]
  });

  useEffect(() => {
    loadRequirements();
  }, []);

  const loadRequirements = async () => {
    try {
      console.log('Loading requirements...');
      setLoading(true);
      setError(null);
      
      const fetchedRequirements = await firebaseService.getRequirements();
      console.log('Raw fetched requirements:', fetchedRequirements);
      
      // Verify each requirement's status
      const verifiedRequirements = fetchedRequirements.map(req => {
        console.log('Verifying requirement:', {
          id: req.id,
          name: req.name,
          currentStatus: req.status,
          currentComplianceScore: req.complianceScore
        });
        
        // Ensure status is one of the valid values
        const validStatuses: RequirementStatus[] = ['FULFILLED', 'PARTIALLY_FULFILLED', 'NOT_FULFILLED', 'NOT_APPLICABLE'];
        const status = validStatuses.includes(req.status) ? req.status : 'NOT_FULFILLED';
        
        // Ensure complianceScore matches status
        let complianceScore = req.complianceScore;
        if (status === 'FULFILLED' && complianceScore !== 100) {
          console.log('Fixing compliance score for FULFILLED requirement');
          complianceScore = 100;
        } else if (status === 'PARTIALLY_FULFILLED' && complianceScore !== 50) {
          console.log('Fixing compliance score for PARTIALLY_FULFILLED requirement');
          complianceScore = 50;
        } else if (status === 'NOT_FULFILLED' && complianceScore !== 0) {
          console.log('Fixing compliance score for NOT_FULFILLED requirement');
          complianceScore = 0;
        } else if (status === 'NOT_APPLICABLE' && complianceScore !== -1) {
          console.log('Fixing compliance score for NOT_APPLICABLE requirement');
          complianceScore = -1;
        }
        
        return {
          ...req,
          status,
          complianceScore
        };
      });
      
      console.log('Verified requirements:', verifiedRequirements);
      setRequirements(verifiedRequirements);
    } catch (err) {
      console.error('Error loading requirements:', err);
      setError('Failed to load requirements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: RequirementStatus) => {
    try {
      console.log('Starting status change in UI:', { id, status });
      setError(null);
      
      // Log the current requirements state
      console.log('Current requirements before update:', requirements);
      
      // Verify the requirement exists
      const requirement = requirements.find(req => req.id === id);
      if (!requirement) {
        console.error('Requirement not found in local state:', id);
        setError('Requirement not found');
        return;
      }
      
      console.log('Found requirement to update:', requirement);
      
      const updatedRequirement = await firebaseService.updateRequirementStatus(id, status);
      console.log('Received updated requirement from service:', updatedRequirement);
      
      if (!updatedRequirement) {
        console.error('No updated requirement returned from service');
        setError('Failed to update requirement');
        return;
      }
      
      // Update the requirements list with the new data
      setRequirements(prevRequirements => {
        const newRequirements = prevRequirements.map(req => {
          if (req.id === id) {
            console.log('Updating requirement:', {
              id: req.id,
              oldStatus: req.status,
              newStatus: status,
              oldComplianceScore: req.complianceScore,
              newComplianceScore: updatedRequirement.complianceScore
            });
            return {
              ...req,
              status: updatedRequirement.status,
              complianceScore: updatedRequirement.complianceScore,
              lastUpdated: updatedRequirement.lastUpdated
            };
          }
          return req;
        });
        console.log('Updated requirements list:', newRequirements);
        return newRequirements;
      });

      // Force a re-render by updating the state
      setRequirements(prev => [...prev]);
      
      // Verify the update was successful
      const updatedRequirements = await firebaseService.getRequirements();
      const verifiedRequirement = updatedRequirements.find(req => req.id === id);
      console.log('Verified updated requirement in Firebase:', verifiedRequirement);
      
      if (!verifiedRequirement || verifiedRequirement.status !== status) {
        console.error('Status update verification failed');
        setError('Failed to verify status update');
      }
    } catch (err) {
      console.error('Error in handleStatusChange:', err);
      if (err instanceof Error) {
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
      }
      setError('Failed to update requirement status. Please try again.');
    }
  };

  const handleVariableChange = async (requirementId: string, variableId: string, value: string) => {
    try {
      console.log('Updating variable:', { requirementId, variableId, value });
      await firebaseService.updateVariable(requirementId, variableId, value);
      await loadRequirements();
    } catch (err) {
      console.error('Error updating variable:', err);
    }
  };

  const handleCreateRequirement = async () => {
    try {
      console.log('Creating new requirement:', newRequirement);
      const { variables, ...requirementData } = newRequirement;
      const requirement = await firebaseService.createRequirement({
        ...requirementData,
        complianceScore: 0 // Add default compliance score
      });
      
      // Create variables
      for (const variable of variables) {
        if (variable.name && variable.value) {
          await firebaseService.createVariable(requirement.id!, {
            name: variable.name,
            value: variable.value,
            requirementId: requirement.id!
          });
        }
      }

      setIsDialogOpen(false);
      setNewRequirement({
        name: '',
        description: '',
        category: '',
        status: 'NOT_FULFILLED',
        priority: 'MEDIUM',
        tags: [],
        variables: [{ name: '', value: '' }]
      });
      await loadRequirements();
    } catch (err) {
      console.error('Error creating requirement:', err);
    }
  };

  const addVariableField = () => {
    setNewRequirement(prev => ({
      ...prev,
      variables: [...prev.variables, { name: '', value: '' }]
    }));
  };

  const testFirebaseConnection = async () => {
    try {
      console.log('Testing Firebase connection...');
      const result = await firebaseService.testConnection();
      if (result) {
        setError('Firebase connection test successful!');
      } else {
        setError('Firebase connection test failed. Check console for details.');
      }
    } catch (err) {
      console.error('Error testing Firebase connection:', err);
      setError('Error testing Firebase connection. Check console for details.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Requirements</h1>
        <div className="flex gap-2">
          <Button onClick={testFirebaseConnection} variant="outline">
            Test Firebase Connection
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Requirement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Requirement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Name"
                  value={newRequirement.name}
                  onChange={(e) => setNewRequirement(prev => ({ ...prev, name: e.target.value }))}
                />
                <Textarea
                  placeholder="Description"
                  value={newRequirement.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    setNewRequirement(prev => ({ ...prev, description: e.target.value }))
                  }
                />
                <Input
                  placeholder="Category"
                  value={newRequirement.category}
                  onChange={(e) => setNewRequirement(prev => ({ ...prev, category: e.target.value }))}
                />
                <Select
                  value={newRequirement.status}
                  onValueChange={(value) => setNewRequirement(prev => ({ ...prev, status: value as RequirementStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULFILLED">Fulfilled</SelectItem>
                    <SelectItem value="PARTIALLY_FULFILLED">Partially Fulfilled</SelectItem>
                    <SelectItem value="NOT_FULFILLED">Not Fulfilled</SelectItem>
                    <SelectItem value="NOT_APPLICABLE">Not Applicable</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={newRequirement.priority}
                  onValueChange={(value) => setNewRequirement(prev => ({ ...prev, priority: value as Priority }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Tags (comma separated)"
                  value={newRequirement.tags.join(', ')}
                  onChange={(e) => setNewRequirement(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()) }))}
                />
                <Input
                  type="date"
                  placeholder="Due Date"
                  value={newRequirement.dueDate?.toISOString().split('T')[0]}
                  onChange={(e) => setNewRequirement(prev => ({ ...prev, dueDate: e.target.value ? new Date(e.target.value) : undefined }))}
                />
                <Input
                  placeholder="Assigned To"
                  value={newRequirement.assignedTo}
                  onChange={(e) => setNewRequirement(prev => ({ ...prev, assignedTo: e.target.value }))}
                />
                <Textarea
                  placeholder="Notes"
                  value={newRequirement.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    setNewRequirement(prev => ({ ...prev, notes: e.target.value }))
                  }
                />
                <div className="space-y-2">
                  {newRequirement.variables.map((variable, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Variable name"
                        value={variable.name}
                        onChange={(e) => {
                          const newVariables = [...newRequirement.variables];
                          newVariables[index].name = e.target.value;
                          setNewRequirement(prev => ({ ...prev, variables: newVariables }));
                        }}
                      />
                      <Input
                        placeholder="Value"
                        value={variable.value}
                        onChange={(e) => {
                          const newVariables = [...newRequirement.variables];
                          newVariables[index].value = e.target.value;
                          setNewRequirement(prev => ({ ...prev, variables: newVariables }));
                        }}
                      />
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addVariableField}>
                    Add Variable
                  </Button>
                </div>
                <Button onClick={handleCreateRequirement}>Create Requirement</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid gap-4">
        {requirements.map((requirement) => (
          <Card key={requirement.id}>
            <CardHeader>
              <CardTitle>{requirement.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Priority: {requirement.priority}</span>
                <span>•</span>
                <span>Category: {requirement.category}</span>
                <span>•</span>
                <span>Compliance: {requirement.complianceScore}%</span>
              </div>
              {requirement.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {requirement.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <p className="mb-4">{requirement.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={requirement.status}
                    onValueChange={(value) => handleStatusChange(requirement.id!, value as RequirementStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULFILLED">Fulfilled</SelectItem>
                      <SelectItem value="PARTIALLY_FULFILLED">Partially Fulfilled</SelectItem>
                      <SelectItem value="NOT_FULFILLED">Not Fulfilled</SelectItem>
                      <SelectItem value="NOT_APPLICABLE">Not Applicable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assigned To</Label>
                  <Input
                    value={requirement.assignedTo}
                    onChange={(e) => {
                      // Add handler for updating assignedTo
                    }}
                  />
                </div>
              </div>
              {requirement.notes && (
                <div className="mb-4">
                  <Label>Notes</Label>
                  <Textarea value={requirement.notes} readOnly />
                </div>
              )}
              <div className="space-y-2">
                {requirement.variables?.map((variable) => (
                  <div key={variable.id} className="flex items-center gap-2">
                    <span className="font-medium">{variable.name}:</span>
                    <Input
                      value={variable.value}
                      onChange={(e) => handleVariableChange(requirement.id!, variable.id!, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 