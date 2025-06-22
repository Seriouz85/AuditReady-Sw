import React, { useState, useEffect } from 'react';
import { 
  Share2, User, Calendar, CheckCircle, XCircle, Clock, 
  AlertCircle, Send, MessageSquare, Eye, Lock, Unlock,
  Mail, Link, Copy, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DocumentMetadata, 
  DocumentShare,
  DocumentActivity,
  EnhancedDocumentService 
} from '@/services/documents/EnhancedDocumentService';
import { useToast } from '@/hooks/use-toast';

interface DocumentWorkflowPanelProps {
  document: DocumentMetadata;
  onClose: () => void;
  onUpdate: () => void;
}

export function DocumentWorkflowPanel({ 
  document, 
  onClose, 
  onUpdate 
}: DocumentWorkflowPanelProps) {
  const { toast } = useToast();
  const documentService = EnhancedDocumentService.getInstance();

  const [shares, setShares] = useState<DocumentShare[]>([]);
  const [activities, setActivities] = useState<DocumentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Review workflow state
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'rejected' | 'changes_requested'>('approved');

  // Sharing state
  const [shareEmail, setShareEmail] = useState('');
  const [shareAccessType, setShareAccessType] = useState<'view' | 'download' | 'edit'>('view');
  const [shareExpiry, setShareExpiry] = useState('');
  const [sharePasswordProtected, setSharePasswordProtected] = useState(false);
  const [sharePassword, setSharePassword] = useState('');
  const [maxDownloads, setMaxDownloads] = useState('');

  useEffect(() => {
    loadData();
  }, [document.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sharesData, activitiesData] = await Promise.all([
        documentService.getDocumentShares(document.id),
        documentService.getDocumentActivity(document.id)
      ]);
      setShares(sharesData);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load document workflow data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!reviewerEmail.trim()) {
      toast({
        title: 'Reviewer required',
        description: 'Please enter a reviewer email address',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
      await documentService.submitForReview(document.id, reviewerEmail);
      toast({
        title: 'Success',
        description: 'Document submitted for review'
      });
      onUpdate();
      loadData();
    } catch (error) {
      console.error('Error submitting for review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit document for review',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewDecision = async () => {
    try {
      setSubmitting(true);
      await documentService.reviewDocument(
        document.id,
        reviewDecision,
        reviewNotes
      );
      toast({
        title: 'Success',
        description: `Document ${reviewDecision.replace('_', ' ')}`
      });
      onUpdate();
      loadData();
    } catch (error) {
      console.error('Error processing review:', error);
      toast({
        title: 'Error',
        description: 'Failed to process review decision',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (!shareEmail.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter an email address to share with',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
      await documentService.shareDocument(
        document.id,
        shareEmail,
        shareAccessType,
        shareExpiry || undefined,
        sharePasswordProtected ? sharePassword : undefined
      );
      toast({
        title: 'Success',
        description: 'Document shared successfully'
      });
      setShareEmail('');
      setSharePassword('');
      loadData();
    } catch (error) {
      console.error('Error sharing document:', error);
      toast({
        title: 'Error',
        description: 'Failed to share document',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyShareLink = (share: DocumentShare) => {
    const shareUrl = `${window.location.origin}/shared-document/${share.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Link copied',
      description: 'Share link copied to clipboard'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'under_review': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'published': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'archived': return <XCircle className="h-4 w-4 text-gray-400" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getReviewStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'changes_requested': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAccessTypeIcon = (type: string) => {
    switch (type) {
      case 'view': return <Eye className="h-4 w-4" />;
      case 'download': return <Copy className="h-4 w-4" />;
      case 'edit': return <Settings className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Document Workflow: {document.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="workflow" className="h-full flex flex-col">
            <TabsList className="w-full">
              <TabsTrigger value="workflow" className="flex-1">Workflow</TabsTrigger>
              <TabsTrigger value="sharing" className="flex-1">Sharing</TabsTrigger>
              <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="workflow" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-4 pr-4">
                  {/* Current Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Current Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(document.status)}
                          <span className="font-medium capitalize">
                            {document.status.replace('_', ' ')}
                          </span>
                        </div>
                        <Badge variant="outline">
                          v{document.current_version}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-2">
                        {getReviewStatusIcon(document.review_status)}
                        <span className="text-sm text-gray-600 capitalize">
                          Review: {document.review_status.replace('_', ' ')}
                        </span>
                      </div>

                      {document.review_notes && (
                        <div className="bg-gray-50 p-3 rounded">
                          <Label className="text-sm font-medium">Review Notes</Label>
                          <p className="text-sm mt-1">{document.review_notes}</p>
                        </div>
                      )}

                      {document.is_locked && (
                        <div className="flex items-center space-x-2 text-amber-600">
                          <Lock className="h-4 w-4" />
                          <span className="text-sm">Document is locked for editing</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Submit for Review */}
                  {document.status === 'draft' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Submit for Review</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="reviewer-email">Reviewer Email</Label>
                          <Input
                            id="reviewer-email"
                            type="email"
                            value={reviewerEmail}
                            onChange={(e) => setReviewerEmail(e.target.value)}
                            placeholder="reviewer@company.com"
                          />
                        </div>
                        <Button onClick={handleSubmitForReview} disabled={submitting}>
                          <Send className="h-4 w-4 mr-2" />
                          Submit for Review
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Review Decision */}
                  {document.status === 'under_review' && document.reviewer_id && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Review Decision</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Decision</Label>
                          <Select value={reviewDecision} onValueChange={setReviewDecision as any}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="approved">Approve</SelectItem>
                              <SelectItem value="rejected">Reject</SelectItem>
                              <SelectItem value="changes_requested">Request Changes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="review-notes">Review Notes</Label>
                          <Textarea
                            id="review-notes"
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            placeholder="Add notes about your review decision..."
                            rows={3}
                          />
                        </div>

                        <Button onClick={handleReviewDecision} disabled={submitting}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Submit Review
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="sharing" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-4 pr-4">
                  {/* Share Document */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Share Document</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="share-email">Share with Email</Label>
                        <Input
                          id="share-email"
                          type="email"
                          value={shareEmail}
                          onChange={(e) => setShareEmail(e.target.value)}
                          placeholder="user@company.com"
                        />
                      </div>

                      <div>
                        <Label>Access Type</Label>
                        <Select value={shareAccessType} onValueChange={setShareAccessType as any}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="view">View Only</SelectItem>
                            <SelectItem value="download">View & Download</SelectItem>
                            <SelectItem value="edit">View, Download & Edit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="share-expiry">Expiry Date (Optional)</Label>
                        <Input
                          id="share-expiry"
                          type="datetime-local"
                          value={shareExpiry}
                          onChange={(e) => setShareExpiry(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={sharePasswordProtected}
                          onCheckedChange={setSharePasswordProtected}
                        />
                        <Label>Password Protected</Label>
                      </div>

                      {sharePasswordProtected && (
                        <div>
                          <Label htmlFor="share-password">Password</Label>
                          <Input
                            id="share-password"
                            type="password"
                            value={sharePassword}
                            onChange={(e) => setSharePassword(e.target.value)}
                            placeholder="Enter password"
                          />
                        </div>
                      )}

                      {shareAccessType === 'download' && (
                        <div>
                          <Label htmlFor="max-downloads">Max Downloads (Optional)</Label>
                          <Input
                            id="max-downloads"
                            type="number"
                            value={maxDownloads}
                            onChange={(e) => setMaxDownloads(e.target.value)}
                            placeholder="Unlimited"
                          />
                        </div>
                      )}

                      <Button onClick={handleShare} disabled={submitting}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Document
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Active Shares */}
                  {shares.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Active Shares</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {shares.map((share) => (
                            <div 
                              key={share.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  {getAccessTypeIcon(share.access_type)}
                                  <span className="font-medium">
                                    {share.shared_with_email}
                                  </span>
                                  <Badge variant="outline" className="capitalize">
                                    {share.access_type}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  <span>Shared {formatDate(share.created_at)}</span>
                                  {share.expires_at && (
                                    <span> • Expires {formatDate(share.expires_at)}</span>
                                  )}
                                  {share.download_count > 0 && (
                                    <span> • {share.download_count} downloads</span>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyShareLink(share)}
                              >
                                <Link className="h-4 w-4 mr-2" />
                                Copy Link
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="activity" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-3 pr-4">
                  {activities.map((activity) => (
                    <Card key={activity.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {activity.action === 'created' && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {activity.action === 'uploaded' && <CheckCircle className="h-4 w-4 text-blue-500" />}
                            {activity.action === 'downloaded' && <Copy className="h-4 w-4 text-gray-500" />}
                            {activity.action === 'viewed' && <Eye className="h-4 w-4 text-gray-500" />}
                            {activity.action === 'locked' && <Lock className="h-4 w-4 text-amber-500" />}
                            {activity.action === 'unlocked' && <Unlock className="h-4 w-4 text-green-500" />}
                            {activity.action === 'approved' && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {activity.action === 'rejected' && <XCircle className="h-4 w-4 text-red-500" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium capitalize">
                                {activity.action.replace('_', ' ')}
                              </span>
                              <span className="text-sm text-gray-500">
                                by You
                              </span>
                            </div>
                            {activity.details && (
                              <p className="text-sm text-gray-600 mt-1">
                                {activity.details}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(activity.created_at)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {activities.length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
                      <p className="text-gray-500">Document activity will appear here as users interact with it.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}