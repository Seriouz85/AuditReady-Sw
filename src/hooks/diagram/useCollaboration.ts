/**
 * Real-time Collaboration Hook for AR Editor
 * Implements real-time editing, comments, cursors, and version control
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import { useDiagramStore } from '../../stores/diagramStore';
import { supabase } from '../../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// Types for collaboration
interface CollaboratorCursor {
  userId: string;
  userName: string;
  userColor: string;
  position: { x: number; y: number };
  lastSeen: Date;
}

interface DiagramComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  nodeId?: string;
  position: { x: number; y: number };
  content: string;
  resolved: boolean;
  createdAt: Date;
  replies?: DiagramComment[];
}

interface DiagramVersion {
  id: string;
  version: number;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  authorId: string;
  authorName: string;
  createdAt: Date;
  isPublished: boolean;
  parentVersion?: string;
}

interface PresenceState {
  userId: string;
  userName: string;
  userColor: string;
  cursor: { x: number; y: number };
  selectedNodes: string[];
  isEditing: boolean;
  editingNodeId?: string;
  lastActivity: Date;
}

export const useCollaboration = (diagramId: string, userId: string, userName: string) => {
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState<Map<string, PresenceState>>(new Map());
  const [comments, setComments] = useState<DiagramComment[]>([]);
  const [versions, setVersions] = useState<DiagramVersion[]>([]);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [conflictingChanges, setConflictingChanges] = useState<Map<string, any>>(new Map());
  
  // Refs for real-time updates
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastSyncRef = useRef<Date>(new Date());
  const pendingChangesRef = useRef<any[]>([]);
  const userColorRef = useRef<string>(generateUserColor(userId));
  
  // Store access
  const { nodes, edges, setNodes, setEdges, selectedNodes, isEditing } = useDiagramStore();

  // Generate unique user color
  function generateUserColor(id: string): string {
    const colors = [
      '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
      '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#84cc16'
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash + id.charCodeAt(i)) & 0xffffffff;
    }
    return colors[Math.abs(hash) % colors.length];
  }

  // Initialize collaboration
  const initializeCollaboration = useCallback(async () => {
    try {
      // Create or join diagram room
      const channel = supabase.channel(`diagram:${diagramId}`, {
        config: {
          presence: { key: userId },
          broadcast: { self: true }
        }
      });

      // Handle presence events (user join/leave)
      channel
        .on('presence', { event: 'sync' }, () => {
          const presenceState = channel.presenceState();
          const newCollaborators = new Map<string, PresenceState>();
          
          Object.values(presenceState).forEach((presences: any) => {
            presences.forEach((presence: PresenceState) => {
              if (presence.userId !== userId) {
                newCollaborators.set(presence.userId, presence);
              }
            });
          });
          
          setCollaborators(newCollaborators);
          setActiveUsers(Array.from(newCollaborators.keys()));
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', leftPresences);
        });

      // Handle broadcast events (real-time changes)
      channel
        .on('broadcast', { event: 'node-update' }, ({ payload }) => {
          handleRemoteNodeUpdate(payload);
        })
        .on('broadcast', { event: 'edge-update' }, ({ payload }) => {
          handleRemoteEdgeUpdate(payload);
        })
        .on('broadcast', { event: 'cursor-move' }, ({ payload }) => {
          handleRemoteCursorMove(payload);
        })
        .on('broadcast', { event: 'selection-change' }, ({ payload }) => {
          handleRemoteSelectionChange(payload);
        })
        .on('broadcast', { event: 'comment-added' }, ({ payload }) => {
          handleRemoteCommentAdd(payload);
        })
        .on('broadcast', { event: 'comment-resolved' }, ({ payload }) => {
          handleRemoteCommentResolve(payload);
        });

      // Subscribe and track presence
      await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          
          // Send initial presence
          await channel.track({
            userId,
            userName,
            userColor: userColorRef.current,
            cursor: { x: 0, y: 0 },
            selectedNodes: [],
            isEditing: false,
            lastActivity: new Date()
          });
          
          // Load existing comments and versions
          await loadComments();
          await loadVersions();
        }
      });

      channelRef.current = channel;
    } catch (error) {
      console.error('Failed to initialize collaboration:', error);
    }
  }, [diagramId, userId, userName]);

  // Handle remote node updates
  const handleRemoteNodeUpdate = useCallback((payload: any) => {
    const { nodeId, changes, authorId, timestamp } = payload;
    
    if (authorId === userId) return; // Ignore own changes
    
    // Check for conflicts
    const localTimestamp = lastSyncRef.current;
    if (new Date(timestamp) < localTimestamp) {
      setConflictingChanges(prev => new Map(prev).set(nodeId, { changes, authorId, timestamp }));
      return;
    }
    
    // Apply remote changes
    setNodes(prevNodes =>
      prevNodes.map(node =>
        node.id === nodeId ? { ...node, ...changes } : node
      )
    );
    
    lastSyncRef.current = new Date(timestamp);
  }, [userId, setNodes]);

  // Handle remote edge updates
  const handleRemoteEdgeUpdate = useCallback((payload: any) => {
    const { edgeId, changes, authorId, timestamp } = payload;
    
    if (authorId === userId) return;
    
    setEdges(prevEdges =>
      prevEdges.map(edge =>
        edge.id === edgeId ? { ...edge, ...changes } : edge
      )
    );
  }, [userId, setEdges]);

  // Handle remote cursor movements
  const handleRemoteCursorMove = useCallback((payload: any) => {
    const { userId: remoteUserId, position } = payload;
    
    setCollaborators(prev => {
      const newMap = new Map(prev);
      const collaborator = newMap.get(remoteUserId);
      if (collaborator) {
        newMap.set(remoteUserId, { ...collaborator, cursor: position });
      }
      return newMap;
    });
  }, []);

  // Handle remote selection changes
  const handleRemoteSelectionChange = useCallback((payload: any) => {
    const { userId: remoteUserId, selectedNodes: remoteSelection, isEditing } = payload;
    
    setCollaborators(prev => {
      const newMap = new Map(prev);
      const collaborator = newMap.get(remoteUserId);
      if (collaborator) {
        newMap.set(remoteUserId, {
          ...collaborator,
          selectedNodes: remoteSelection,
          isEditing
        });
      }
      return newMap;
    });
  }, []);

  // Handle remote comment additions
  const handleRemoteCommentAdd = useCallback((payload: DiagramComment) => {
    setComments(prev => [...prev, payload]);
  }, []);

  // Handle remote comment resolutions
  const handleRemoteCommentResolve = useCallback((payload: { commentId: string }) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === payload.commentId
          ? { ...comment, resolved: true }
          : comment
      )
    );
  }, []);

  // Broadcast node updates
  const broadcastNodeUpdate = useCallback((nodeId: string, changes: any) => {
    if (!channelRef.current) return;
    
    channelRef.current.send({
      type: 'broadcast',
      event: 'node-update',
      payload: {
        nodeId,
        changes,
        authorId: userId,
        timestamp: new Date().toISOString()
      }
    });
  }, [userId]);

  // Broadcast edge updates
  const broadcastEdgeUpdate = useCallback((edgeId: string, changes: any) => {
    if (!channelRef.current) return;
    
    channelRef.current.send({
      type: 'broadcast',
      event: 'edge-update',
      payload: {
        edgeId,
        changes,
        authorId: userId,
        timestamp: new Date().toISOString()
      }
    });
  }, [userId]);

  // Broadcast cursor movement
  const broadcastCursorMove = useCallback((position: { x: number; y: number }) => {
    if (!channelRef.current) return;
    
    channelRef.current.send({
      type: 'broadcast',
      event: 'cursor-move',
      payload: {
        userId,
        position
      }
    });
  }, [userId]);

  // Broadcast selection changes
  const broadcastSelectionChange = useCallback((selectedNodes: string[], isEditing: boolean) => {
    if (!channelRef.current) return;
    
    channelRef.current.send({
      type: 'broadcast',
      event: 'selection-change',
      payload: {
        userId,
        selectedNodes,
        isEditing
      }
    });
  }, [userId]);

  // Add comment
  const addComment = useCallback(async (
    position: { x: number; y: number },
    content: string,
    nodeId?: string
  ) => {
    try {
      const comment: DiagramComment = {
        id: `comment-${Date.now()}`,
        userId,
        userName,
        nodeId,
        position,
        content,
        resolved: false,
        createdAt: new Date()
      };

      // Save to database
      const { error } = await supabase
        .from('diagram_comments')
        .insert({
          id: comment.id,
          diagram_id: diagramId,
          user_id: userId,
          user_name: userName,
          node_id: nodeId,
          position: position,
          content,
          resolved: false
        });

      if (error) throw error;

      // Broadcast to other users
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'comment-added',
          payload: comment
        });
      }

      // Update local state
      setComments(prev => [...prev, comment]);
      
      return comment;
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  }, [diagramId, userId, userName]);

  // Resolve comment
  const resolveComment = useCallback(async (commentId: string) => {
    try {
      // Update in database
      const { error } = await supabase
        .from('diagram_comments')
        .update({ resolved: true })
        .eq('id', commentId);

      if (error) throw error;

      // Broadcast to other users
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'comment-resolved',
          payload: { commentId }
        });
      }

      // Update local state
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? { ...comment, resolved: true }
            : comment
        )
      );
    } catch (error) {
      console.error('Failed to resolve comment:', error);
      throw error;
    }
  }, []);

  // Load comments from database
  const loadComments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('diagram_comments')
        .select('*')
        .eq('diagram_id', diagramId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedComments = data?.map(comment => ({
        id: comment.id,
        userId: comment.user_id,
        userName: comment.user_name,
        nodeId: comment.node_id,
        position: comment.position,
        content: comment.content,
        resolved: comment.resolved,
        createdAt: new Date(comment.created_at)
      })) || [];

      setComments(formattedComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  }, [diagramId]);

  // Create new version
  const createVersion = useCallback(async (name: string, description?: string) => {
    try {
      const version: DiagramVersion = {
        id: `version-${Date.now()}`,
        version: versions.length + 1,
        name,
        description,
        nodes,
        edges,
        authorId: userId,
        authorName: userName,
        createdAt: new Date(),
        isPublished: false
      };

      // Save to database
      const { error } = await supabase
        .from('diagram_versions')
        .insert({
          id: version.id,
          diagram_id: diagramId,
          version: version.version,
          name,
          description,
          nodes,
          edges,
          author_id: userId,
          author_name: userName,
          is_published: false
        });

      if (error) throw error;

      setVersions(prev => [...prev, version]);
      return version;
    } catch (error) {
      console.error('Failed to create version:', error);
      throw error;
    }
  }, [diagramId, userId, userName, nodes, edges, versions.length]);

  // Load version
  const loadVersion = useCallback(async (versionId: string) => {
    try {
      const { data, error } = await supabase
        .from('diagram_versions')
        .select('*')
        .eq('id', versionId)
        .single();

      if (error) throw error;

      if (data) {
        setNodes(data.nodes);
        setEdges(data.edges);
      }
    } catch (error) {
      console.error('Failed to load version:', error);
      throw error;
    }
  }, [setNodes, setEdges]);

  // Load versions from database
  const loadVersions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('diagram_versions')
        .select('*')
        .eq('diagram_id', diagramId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedVersions = data?.map(version => ({
        id: version.id,
        version: version.version,
        name: version.name,
        description: version.description,
        nodes: version.nodes,
        edges: version.edges,
        authorId: version.author_id,
        authorName: version.author_name,
        createdAt: new Date(version.created_at),
        isPublished: version.is_published
      })) || [];

      setVersions(formattedVersions);
    } catch (error) {
      console.error('Failed to load versions:', error);
    }
  }, [diagramId]);

  // Handle conflicts
  const resolveConflict = useCallback((nodeId: string, resolution: 'local' | 'remote') => {
    const conflict = conflictingChanges.get(nodeId);
    if (!conflict) return;

    if (resolution === 'remote') {
      setNodes(prevNodes =>
        prevNodes.map(node =>
          node.id === nodeId ? { ...node, ...conflict.changes } : node
        )
      );
    }

    setConflictingChanges(prev => {
      const newMap = new Map(prev);
      newMap.delete(nodeId);
      return newMap;
    });
  }, [conflictingChanges, setNodes]);

  // Auto-save with conflict detection
  const autoSave = useCallback(async () => {
    if (pendingChangesRef.current.length === 0) return;

    try {
      // Save to database with timestamp
      const { error } = await supabase
        .from('diagram_snapshots')
        .upsert({
          diagram_id: diagramId,
          nodes,
          edges,
          last_modified: new Date(),
          modified_by: userId
        });

      if (error) throw error;

      pendingChangesRef.current = [];
      lastSyncRef.current = new Date();
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [diagramId, nodes, edges, userId]);

  // Initialize collaboration on mount
  useEffect(() => {
    initializeCollaboration();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [initializeCollaboration]);

  // Auto-save timer
  useEffect(() => {
    const interval = setInterval(autoSave, 10000); // Auto-save every 10 seconds
    return () => clearInterval(interval);
  }, [autoSave]);

  // Broadcast selection changes
  useEffect(() => {
    broadcastSelectionChange(selectedNodes, isEditing);
  }, [selectedNodes, isEditing, broadcastSelectionChange]);

  return {
    // Connection state
    isConnected,
    activeUsers,
    collaborators: Array.from(collaborators.values()),
    
    // Comments
    comments,
    addComment,
    resolveComment,
    
    // Versions
    versions,
    createVersion,
    loadVersion,
    
    // Real-time updates
    broadcastNodeUpdate,
    broadcastEdgeUpdate,
    broadcastCursorMove,
    
    // Conflict resolution
    conflictingChanges: Array.from(conflictingChanges.entries()),
    resolveConflict,
    
    // User info
    userColor: userColorRef.current,
    
    // Utilities
    autoSave
  };
};