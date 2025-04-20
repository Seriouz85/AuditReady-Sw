import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Supplier, Standard, Requirement, InternalUser, RequirementStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Filter, 
  Mail, 
  Printer, 
  Send, 
  X,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/utils/toast';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SupplierReviewReportProps {
  supplier: Supplier;
  standards: Standard[];
  requirements: Requirement[];
  internalUser: InternalUser;
  selectedStandardIds: string[];
  onClose: () => void;
  onSend?: (emailData: EmailData) => void;
  previewMode?: boolean;
  directExport?: {
    standardId: string;
    onComplete?: () => void;
  };
}

interface EmailData {
  to: string;
  subject: string;
  message: string;
  includeRequirements: boolean;
  standardIds: string[];
}

interface RequirementWithStatus extends Requirement {
  supplierStatus?: RequirementStatus;
  supplierNotes?: string;
  supplierEvidence?: string;
}

export const SupplierReviewReport = ({ 
  supplier, 
  standards, 
  requirements,
  internalUser,
  selectedStandardIds,
  onClose,
  onSend,
  previewMode = false,
  directExport
}: SupplierReviewReportProps) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [activeStandardId, setActiveStandardId] = useState<string | undefined>(
    selectedStandardIds.length > 0 ? selectedStandardIds[0] : undefined
  );
  const [enhancedRequirements, setEnhancedRequirements] = useState<RequirementWithStatus[]>([]);
  
  const selectedStandards = standards.filter(std => 
    selectedStandardIds.includes(std.id)
  );
  
  useEffect(() => {
    console.log('SupplierReviewReport: Updating enhanced requirements for standards prop:', selectedStandardIds);
    
    const relevantRequirements = requirements.filter(req => 
      selectedStandardIds.includes(req.standardId)
    );

    const enhanced = relevantRequirements.map(req => {
      const isAssociated = supplier.associatedStandards
        .find(s => s.standardId === req.standardId)?.requirementIds
        .includes(req.id);
        
      return {
        ...req,
        supplierStatus: isAssociated ? 'fulfilled' : 'not-fulfilled' as RequirementStatus, 
        supplierNotes: '',
        supplierEvidence: '',
      };
    });
    
    console.log(`Processed ${enhanced.length} requirements for the report.`);
    
    setEnhancedRequirements(enhanced);
    
    if (selectedStandardIds.length > 0 && (!activeStandardId || !selectedStandardIds.includes(activeStandardId))) {
      setActiveStandardId(selectedStandardIds[0]);
    } else if (selectedStandardIds.length === 0) {
      setActiveStandardId(undefined);
    }

  }, [selectedStandardIds, requirements, supplier.associatedStandards, activeStandardId]);
  
  const filteredRequirements = activeStandardId 
    ? enhancedRequirements.filter(req => req.standardId === activeStandardId)
    : enhancedRequirements;
  
  const totalRequirements = filteredRequirements.length;
  const fulfilledCount = filteredRequirements.filter(req => req.supplierStatus === 'fulfilled').length;
  const partialCount = filteredRequirements.filter(req => req.supplierStatus === 'partially-fulfilled').length;
  const notFulfilledCount = filteredRequirements.filter(req => req.supplierStatus === 'not-fulfilled').length;
  const notApplicableCount = filteredRequirements.filter(req => req.supplierStatus === 'not-applicable').length;
  
  const total = totalRequirements - notApplicableCount;
  const score = total > 0 
    ? Math.round((fulfilledCount + partialCount * 0.5) / total * 100) 
    : 0;
  
  const groupedRequirements = filteredRequirements.reduce((acc, req) => {
    const section = req.section;
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(req);
    return acc;
  }, {} as Record<string, RequirementWithStatus[]>);

  const calculateScore = (requirements: RequirementWithStatus[]) => {
    const total = requirements.length;
    const fulfilledCount = requirements.filter(req => req.supplierStatus === 'fulfilled').length;
    const partialCount = requirements.filter(req => req.supplierStatus === 'partially-fulfilled').length;
    const notApplicableCount = requirements.filter(req => req.supplierStatus === 'not-applicable').length;
    
    const relevantTotal = total - notApplicableCount;
    if (relevantTotal === 0) return 0;
    
    return Math.round((fulfilledCount + partialCount * 0.5) / relevantTotal * 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'High Compliance';
    if (score >= 50) return 'Moderate Compliance';
    return 'Low Compliance';
  };

  const handleRequirementStatusChange = (reqId: string, status: RequirementStatus) => {
    setEnhancedRequirements(prev => 
      prev.map(req => 
        req.id === reqId ? { ...req, supplierStatus: status } : req
      )
    );
    
    // Show immediate feedback
    const score = calculateScore(enhancedRequirements);
    toast.info(`Compliance score updated: ${score}% - ${getScoreLabel(score)}`);
  };

  const handleRequirementNotesChange = (reqId: string, notes: string) => {
    setEnhancedRequirements(prev => 
      prev.map(req => 
        req.id === reqId ? { ...req, supplierNotes: notes } : req
      )
    );
  };

  const handleRequirementEvidenceChange = (reqId: string, evidence: string) => {
    setEnhancedRequirements(prev => 
      prev.map(req => 
        req.id === reqId ? { ...req, supplierEvidence: evidence } : req
      )
    );
  };

  const handlePrintToPDF = useReactToPrint({
    content: () => reportRef.current,
    onBeforeGetContent: () => {
      toast.info('Preparing document for printing...');
      return Promise.resolve();
    },
    onAfterPrint: () => {
      toast.success('Document ready for save');
    },
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .no-print {
          display: none;
        }
        .print-only {
          display: block;
        }
        .page-break {
          page-break-after: always;
        }
      }
    `
  });

  useEffect(() => {
    if (directExport && !previewMode) {
      setTimeout(() => {
        console.log('Automatically triggering PDF export');
        handlePrintToPDF();
        
        if (directExport.onComplete) {
          setTimeout(() => {
            directExport.onComplete();
          }, 1000);
        }
      }, 500);
    }
  }, [directExport, previewMode, handlePrintToPDF]);

  const handleSendEmail = () => {
    if (onSend) {
      const emailInfo = {
        to: supplier.contact.email,
        subject: `Security Requirements Review from ${internalUser.department || 'Our Company'}`,
        message: `Dear ${supplier.contact.name},\n\nAs part of our ongoing supplier security assessment program, we're sending you the attached security requirements that apply to your organization.\n\nPlease review these requirements and provide evidence of compliance at your earliest convenience.\n\nBest regards,\n${internalUser.name}\n${internalUser.title || 'Security Team'}\n${internalUser.email}`,
        includeRequirements: true,
        standardIds: selectedStandardIds
      };
      onSend(emailInfo);
      toast.success(`Requirements sent to ${supplier.contact.name}`);
    }
  };

  useEffect(() => {
    if (directExport) {
      console.log('Direct export mode activated for standard:', directExport.standardId);
    }
  }, [directExport]);

  return (
    <div className={`${previewMode ? '' : 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50'} flex flex-col`}>
      {!previewMode && (
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h2 className="text-xl font-bold">Supplier Requirements Review</h2>
          </div>
          <div className="flex items-center gap-2">
            {selectedStandards.length > 0 && (
              <div className="flex items-center gap-2 mr-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select 
                  value={activeStandardId || ''}
                  onValueChange={(value) => setActiveStandardId(value || undefined)}
                >
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Filter by standard" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {selectedStandards.map(std => (
                        <SelectItem key={std.id} value={std.id}>
                          {std.name} {std.version}
                        </SelectItem>
                      ))}
                      {selectedStandards.length > 1 && <SelectItem value="">All Selected Standards</SelectItem>}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrintToPDF} 
              className="gap-1 mr-2"
            >
              <Printer className="h-4 w-4" />
              <span>Generate PDF</span>
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSendEmail}
              className="gap-1 mr-2"
            >
              <Send className="h-4 w-4" />
              <span>Send to Supplier</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="gap-1">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      <div className={`${previewMode ? '' : 'flex-1 overflow-auto p-6'}`}>
        <div 
          ref={reportRef} 
          className="supplier-report-content bg-white dark:bg-slate-900 max-w-4xl mx-auto p-8 shadow-sm border rounded-md print:shadow-none print:border-none print:p-6"
        >
          <div className="mb-8 border-b pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2">Supplier Security Assessment</h1>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Supplier: {supplier.name}</p>
                  <p>Generated: {format(new Date(), 'MMMM d, yyyy')}</p>
                  <p>Generated by: {internalUser.name} ({internalUser.department || 'Security Team'})</p>
                </div>
              </div>
              <div className="flex gap-2 no-print">
                <Button 
                  variant="outline" 
                  onClick={handlePrintToPDF}
                  className="gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Generate PDF
                </Button>
                {onSend && (
                  <Button 
                    variant="default"
                    onClick={handleSendEmail}
                    className="gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Send to Supplier
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="hidden print:block fixed top-0 left-0 right-0 p-4 border-b bg-white text-sm text-muted-foreground">
            <div className="flex justify-between items-center">
              <div>{supplier?.name} - Compliance Assessment</div>
              <div>{format(new Date(), "PPP")}</div>
            </div>
          </div>
          
          <div className="hidden print:block fixed bottom-0 left-0 right-0 p-4 border-t bg-white text-sm text-muted-foreground">
            <div className="flex justify-between items-center">
              <div>Generated by: {internalUser.name}</div>
              <div>Confidential</div>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Compliance Score</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Overall Compliance</h3>
                  <Badge variant="outline" className={cn(
                    "text-sm",
                    score >= 80 ? "bg-green-50 text-green-700 border-green-200" :
                    score >= 50 ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-red-50 text-red-700 border-red-200"
                  )}>
                    {getScoreLabel(score)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 rounded-full bg-gray-100"></div>
                    <div 
                      className={cn(
                        "absolute inset-0 rounded-full",
                        getScoreColor(score)
                      )}
                      style={{
                        clipPath: `polygon(0 0, 100% 0, 100% ${score}%, 0 ${score}%)`
                      }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">{score}%</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Fulfilled</span>
                        <span className="font-medium">{fulfilledCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Partially Fulfilled</span>
                        <span className="font-medium">{partialCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Not Fulfilled</span>
                        <span className="font-medium">{notFulfilledCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Not Applicable</span>
                        <span className="font-medium">{notApplicableCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium mb-4">Requirements by Section</h3>
                <div className="space-y-4">
                  {Object.entries(groupedRequirements).map(([section, reqs]) => {
                    const sectionScore = calculateScore(reqs);
                    return (
                      <div key={section} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Section {section}</span>
                          <span className="text-sm font-medium">{sectionScore}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className={cn(
                              "h-2 rounded-full",
                              getScoreColor(sectionScore)
                            )}
                            style={{ width: `${sectionScore}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {Object.entries(groupedRequirements).map(([section, requirements]) => (
              <div key={section} className="page-break">
                <h2 className="text-xl font-bold mb-4">Section {section}</h2>
                <div className="space-y-4">
                  {requirements.map((req) => (
                    <div 
                      key={req.id} 
                      className={cn(
                        "border rounded-lg p-4",
                        req.supplierStatus === 'fulfilled' && "bg-green-50 border-green-200",
                        req.supplierStatus === 'partially-fulfilled' && "bg-amber-50 border-amber-200",
                        req.supplierStatus === 'not-fulfilled' && "bg-red-50 border-red-200",
                        req.supplierStatus === 'not-applicable' && "bg-slate-50 border-slate-200"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{req.name}</h3>
                          <p className="text-sm text-muted-foreground">{req.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={req.supplierStatus}
                            onValueChange={(value) => handleRequirementStatusChange(req.id, value as RequirementStatus)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fulfilled">Fulfilled</SelectItem>
                              <SelectItem value="partially-fulfilled">Partially Fulfilled</SelectItem>
                              <SelectItem value="not-fulfilled">Not Fulfilled</SelectItem>
                              <SelectItem value="not-applicable">Not Applicable</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {req.guidance && (
                        <div className="mt-2 p-3 bg-muted/30 rounded-md">
                          <p className="text-sm">
                            <span className="font-medium">Guidance:</span> {req.guidance}
                          </p>
                        </div>
                      )}
                      <div className="mt-4 space-y-2">
                        <Label htmlFor={`notes-${req.id}`}>Notes</Label>
                        <Textarea
                          id={`notes-${req.id}`}
                          value={req.supplierNotes || ''}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleRequirementNotesChange(req.id, e.target.value)}
                          placeholder="Add notes about this requirement..."
                          className="min-h-[80px]"
                        />
                      </div>
                      <div className="mt-2 space-y-2">
                        <Label htmlFor={`evidence-${req.id}`}>Evidence</Label>
                        <Textarea
                          id={`evidence-${req.id}`}
                          value={req.supplierEvidence || ''}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleRequirementEvidenceChange(req.id, e.target.value)}
                          placeholder="Add evidence of compliance..."
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 pt-4 border-t text-sm text-center text-muted-foreground">
            <p>Generated by: {internalUser.name} ({internalUser.email})</p>
            <p className="mt-1">This assessment is confidential and contains information intended only for the supplier named above.</p>
          </div>
        </div>
      </div>
    </div>
  );
};