import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/utils/toast';
import { formatDate } from '@/utils/formatDate';
import { CollaborationService, Comment } from '@/services/collaboration/CollaborationService';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessageSquare, Send, Reply, Edit, Trash2, 
  AtSign, Clock, MoreHorizontal 
} from 'lucide-react';

interface CommentsPanelProps {
  resourceType: string;
  resourceId: string;
  resourceTitle?: string;
  allowComments?: boolean;
}

export const CommentsPanel: React.FC<CommentsPanelProps> = ({
  resourceType,
  resourceId,
  resourceTitle,
  allowComments = true
}) => {
  const { user, isDemo } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [collaborationService] = useState(() => CollaborationService.getInstance());

  useEffect(() => {
    loadComments();
    
    // Subscribe to real-time comments
    const unsubscribe = collaborationService.subscribeToComments(
      resourceType,
      resourceId,
      (comment: Comment) => {
        setComments(prev => [...prev, comment]);
      }
    );

    return unsubscribe;
  }, [resourceType, resourceId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await collaborationService.getComments(resourceType, resourceId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    if (isDemo && comments.length >= 5) {
      toast.info('Comment limit reached in demo mode');
      return;
    }

    try {
      setSubmitting(true);
      const result = await collaborationService.addComment({
        content: newComment,
        resourceType,
        resourceId,
        parentCommentId: replyTo || undefined
      });

      if (result.success && result.comment) {
        setComments(prev => {
          if (replyTo) {
            // Add reply to parent comment
            return prev.map(comment => {
              if (comment.id === replyTo) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), result.comment!]
                };
              }
              return comment;
            });
          } else {
            // Add new top-level comment
            return [...prev, result.comment!];
          }
        });
        
        setNewComment('');
        setReplyTo(null);
        toast.success('Comment added successfully');
      } else {
        toast.error(result.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return formatDate(dateString);
  };

  const extractMentions = (content: string) => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`space-y-3 ${isReply ? 'ml-8 pl-4 border-l-2 border-muted' : ''}`}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author_avatar} />
          <AvatarFallback className="text-xs">
            {comment.author_name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{comment.author_name}</span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(comment.created_at)}
            </span>
            {comment.is_edited && (
              <Badge variant="secondary" className="text-xs">edited</Badge>
            )}
          </div>
          
          <div className="text-sm text-foreground">
            {comment.content.split(/(@\w+)/g).map((part, index) => {
              if (part.startsWith('@')) {
                return (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs mx-1 bg-blue-100 text-blue-700"
                  >
                    {part}
                  </Badge>
                );
              }
              return part;
            })}
          </div>
          
          {comment.mentions.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <AtSign className="h-3 w-3" />
              <span>Mentioned: {comment.mentions.join(', ')}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setReplyTo(comment.id)}
              disabled={!allowComments}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
            
            {comment.author_id === user?.id && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  disabled={isDemo}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                  disabled={isDemo}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading comments...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments
          {comments.length > 0 && (
            <Badge variant="secondary">{comments.length}</Badge>
          )}
        </CardTitle>
        {resourceTitle && (
          <p className="text-sm text-muted-foreground">
            Discussing: {resourceTitle}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add Comment Form */}
        {allowComments && (
          <div className="space-y-3">
            {replyTo && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Reply className="h-4 w-4" />
                <span>Replying to comment</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(null)}
                  className="h-6 px-2"
                >
                  Cancel
                </Button>
              </div>
            )}
            
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="text-xs">
                  {user?.user_metadata?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-20 resize-none"
                  disabled={submitting}
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Use @username to mention team members
                  </div>
                  <Button
                    size="sm"
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submitting}
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {replyTo ? 'Reply' : 'Comment'}
                  </Button>
                </div>
              </div>
            </div>
            
            {isDemo && comments.length >= 3 && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border">
                Demo Mode: Limited to {5 - comments.length} more comments
              </div>
            )}
          </div>
        )}
        
        <Separator />
        
        {/* Comments List */}
        <ScrollArea className="h-96">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No comments yet</p>
              {allowComments && (
                <p className="text-sm">Be the first to start the discussion</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map(comment => renderComment(comment))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};