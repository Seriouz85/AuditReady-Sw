import { analytics } from '@/lib/monitoring/analytics';
import { reportError, addBreadcrumb } from '@/lib/monitoring/sentry';
import { alertingService } from '@/lib/monitoring/alerting';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_for_customer' | 'resolved' | 'closed';
export type TicketCategory = 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'general';
export type TicketSource = 'email' | 'chat' | 'phone' | 'web_form' | 'api';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  source: TicketSource;
  customerId: string;
  organizationId?: string;
  assignedTo?: string;
  assignedTeam?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  tags: string[];
  metadata: Record<string, any>;
  attachments: TicketAttachment[];
  escalations: TicketEscalation[];
  satisfaction?: CustomerSatisfaction;
}

interface TicketAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

interface TicketEscalation {
  id: string;
  reason: string;
  escalatedBy: string;
  escalatedTo: string;
  escalatedAt: Date;
  resolved: boolean;
}

interface CustomerSatisfaction {
  rating: number; // 1-5
  feedback?: string;
  submittedAt: Date;
}

interface TicketUpdate {
  id: string;
  ticketId: string;
  type: 'comment' | 'status_change' | 'assignment' | 'escalation' | 'attachment';
  content: string;
  author: string;
  authorType: 'agent' | 'customer' | 'system';
  isPublic: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

interface SupportAgent {
  id: string;
  name: string;
  email: string;
  role: 'agent' | 'senior_agent' | 'team_lead' | 'manager';
  teams: string[];
  skills: string[];
  availability: AgentAvailability;
  currentWorkload: number;
  maxWorkload: number;
  performance: AgentPerformance;
}

interface AgentAvailability {
  status: 'available' | 'busy' | 'away' | 'offline';
  timezone: string;
  workingHours: {
    start: string;
    end: string;
    days: number[]; // 0-6 (Sunday-Saturday)
  };
}

interface AgentPerformance {
  avgResponseTime: number; // in minutes
  avgResolutionTime: number; // in hours
  customerSatisfaction: number; // 1-5
  ticketsResolved: number;
  escalationRate: number; // percentage
}

interface SupportTeam {
  id: string;
  name: string;
  description: string;
  specialties: string[];
  members: string[];
  leaderId: string;
  availability: '24/7' | 'business_hours' | 'weekdays';
  slaTargets: SLATargets;
}

interface SLATargets {
  firstResponseTime: number; // in minutes
  resolutionTime: number; // in hours
  escalationThreshold: number; // in hours
}

interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  helpfulVotes: number;
  unhelpfulVotes: number;
  relatedArticles: string[];
}

interface SupportMetrics {
  totalTickets: number;
  openTickets: number;
  avgFirstResponseTime: number;
  avgResolutionTime: number;
  customerSatisfaction: number;
  slaCompliance: number;
  escalationRate: number;
  agentUtilization: number;
  ticketsByPriority: Record<TicketPriority, number>;
  ticketsByCategory: Record<TicketCategory, number>;
  ticketsByStatus: Record<TicketStatus, number>;
}

class TicketingSystem {
  private tickets: Map<string, Ticket> = new Map();
  private ticketUpdates: Map<string, TicketUpdate[]> = new Map();
  private agents: Map<string, SupportAgent> = new Map();
  private teams: Map<string, SupportTeam> = new Map();
  private knowledgeBase: Map<string, KnowledgeBaseArticle> = new Map();
  private autoAssignmentEnabled = true;
  private escalationRules: EscalationRule[] = [];

  constructor() {
    this.initializeDefaultTeams();
    this.initializeDefaultAgents();
    this.initializeEscalationRules();
    this.startBackgroundTasks();
  }

  private initializeDefaultTeams(): void {
    this.teams.set('technical', {
      id: 'technical',
      name: 'Technical Support',
      description: 'Handles technical issues and product questions',
      specialties: ['API', 'Integration', 'Troubleshooting', 'Performance'],
      members: [],
      leaderId: 'tech-lead-1',
      availability: 'business_hours',
      slaTargets: {
        firstResponseTime: 60, // 1 hour
        resolutionTime: 24, // 24 hours
        escalationThreshold: 4 // 4 hours
      }
    });

    this.teams.set('billing', {
      id: 'billing',
      name: 'Billing Support',
      description: 'Handles billing, subscription, and payment issues',
      specialties: ['Billing', 'Subscriptions', 'Payments', 'Refunds'],
      members: [],
      leaderId: 'billing-lead-1',
      availability: 'business_hours',
      slaTargets: {
        firstResponseTime: 30, // 30 minutes
        resolutionTime: 8, // 8 hours
        escalationThreshold: 2 // 2 hours
      }
    });

    this.teams.set('success', {
      id: 'success',
      name: 'Customer Success',
      description: 'Handles onboarding, training, and general inquiries',
      specialties: ['Onboarding', 'Training', 'Best Practices', 'Feature Requests'],
      members: [],
      leaderId: 'success-lead-1',
      availability: 'business_hours',
      slaTargets: {
        firstResponseTime: 120, // 2 hours
        resolutionTime: 48, // 48 hours
        escalationThreshold: 8 // 8 hours
      }
    });
  }

  private initializeDefaultAgents(): void {
    // This would typically load from database
    // Adding sample agents for demonstration
  }

  private initializeEscalationRules(): void {
    this.escalationRules = [
      {
        condition: 'priority_urgent_no_response',
        triggerAfter: 30, // 30 minutes
        action: 'escalate_to_manager',
        description: 'Escalate urgent tickets with no response after 30 minutes'
      },
      {
        condition: 'high_priority_breached_sla',
        triggerAfter: 240, // 4 hours
        action: 'escalate_to_senior',
        description: 'Escalate high priority tickets that breach SLA'
      },
      {
        condition: 'customer_dissatisfaction',
        triggerAfter: 0, // Immediate
        action: 'escalate_to_team_lead',
        description: 'Escalate tickets with poor satisfaction ratings'
      }
    ];
  }

  private startBackgroundTasks(): void {
    // Check for SLA breaches every 15 minutes
    setInterval(() => {
      this.checkSLABreaches();
    }, 15 * 60 * 1000);

    // Process escalations every 5 minutes
    setInterval(() => {
      this.processEscalations();
    }, 5 * 60 * 1000);

    // Update agent availability every minute
    setInterval(() => {
      this.updateAgentAvailability();
    }, 60 * 1000);

    // Generate daily metrics at midnight
    setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        this.generateDailyMetrics();
      }
    }, 60 * 1000);
  }

  async createTicket(ticketData: {
    subject: string;
    description: string;
    category: TicketCategory;
    priority?: TicketPriority;
    source: TicketSource;
    customerId: string;
    organizationId?: string;
    tags?: string[];
    metadata?: Record<string, any>;
    attachments?: File[];
  }): Promise<string> {
    const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const ticket: Ticket = {
      id: ticketId,
      subject: ticketData.subject,
      description: ticketData.description,
      category: ticketData.category,
      priority: ticketData.priority || this.calculatePriority(ticketData),
      status: 'open',
      source: ticketData.source,
      customerId: ticketData.customerId,
      organizationId: ticketData.organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ticketData.tags || [],
      metadata: ticketData.metadata || {},
      attachments: [],
      escalations: []
    };

    // Process attachments if any
    if (ticketData.attachments && ticketData.attachments.length > 0) {
      ticket.attachments = await this.processAttachments(ticketData.attachments, ticketId);
    }

    // Auto-assign ticket if enabled
    if (this.autoAssignmentEnabled) {
      const assignment = await this.autoAssignTicket(ticket);
      if (assignment) {
        ticket.assignedTo = assignment.agentId;
        ticket.assignedTeam = assignment.teamId;
      }
    }

    this.tickets.set(ticketId, ticket);
    this.ticketUpdates.set(ticketId, []);

    // Add creation update
    await this.addTicketUpdate(ticketId, {
      type: 'comment',
      content: 'Ticket created',
      author: 'system',
      authorType: 'system',
      isPublic: false
    });

    // Send notifications
    await this.sendTicketNotifications(ticket, 'created');

    // Track analytics
    analytics.track('support_ticket_created', {
      ticket_id: ticketId,
      category: ticket.category,
      priority: ticket.priority,
      source: ticket.source,
      customer_id: ticket.customerId,
      organization_id: ticket.organizationId,
      auto_assigned: !!ticket.assignedTo
    });

    addBreadcrumb(
      `Support ticket created: ${ticketId}`,
      'support',
      'info',
      {
        ticket_id: ticketId,
        category: ticket.category,
        priority: ticket.priority
      }
    );

    return ticketId;
  }

  private calculatePriority(ticketData: {
    category: TicketCategory;
    description: string;
    metadata?: Record<string, any>;
  }): TicketPriority {
    // Auto-detect priority based on keywords and category
    const description = ticketData.description.toLowerCase();
    
    // Urgent keywords
    if (description.includes('critical') || 
        description.includes('emergency') || 
        description.includes('down') ||
        description.includes('outage') ||
        description.includes('security breach')) {
      return 'urgent';
    }

    // High priority keywords
    if (description.includes('unable to') ||
        description.includes('cannot') ||
        description.includes('error') ||
        description.includes('broken') ||
        ticketData.category === 'bug_report') {
      return 'high';
    }

    // Medium priority for technical issues
    if (ticketData.category === 'technical') {
      return 'medium';
    }

    // Default to low priority
    return 'low';
  }

  private async processAttachments(files: File[], ticketId: string): Promise<TicketAttachment[]> {
    const attachments: TicketAttachment[] = [];

    for (const file of files) {
      // In production, upload to cloud storage
      const attachment: TicketAttachment = {
        id: `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        url: `https://storage.auditready.com/tickets/${ticketId}/${file.name}`,
        uploadedAt: new Date(),
        uploadedBy: 'customer'
      };

      attachments.push(attachment);
    }

    return attachments;
  }

  private async autoAssignTicket(ticket: Ticket): Promise<{ agentId: string; teamId: string } | null> {
    // Find appropriate team based on category
    let targetTeam: SupportTeam | undefined;
    
    switch (ticket.category) {
      case 'technical':
      case 'bug_report':
        targetTeam = this.teams.get('technical');
        break;
      case 'billing':
        targetTeam = this.teams.get('billing');
        break;
      case 'feature_request':
      case 'general':
        targetTeam = this.teams.get('success');
        break;
      default:
        targetTeam = this.teams.get('success');
    }

    if (!targetTeam) return null;

    // Find available agent with lowest workload
    const availableAgents = Array.from(this.agents.values()).filter(agent => 
      targetTeam!.members.includes(agent.id) &&
      agent.availability.status === 'available' &&
      agent.currentWorkload < agent.maxWorkload
    );

    if (availableAgents.length === 0) return null;

    // Sort by workload and skill match
    availableAgents.sort((a, b) => {
      const aSkillMatch = this.calculateSkillMatch(a, ticket);
      const bSkillMatch = this.calculateSkillMatch(b, ticket);
      
      if (aSkillMatch !== bSkillMatch) {
        return bSkillMatch - aSkillMatch; // Higher skill match first
      }
      
      return a.currentWorkload - b.currentWorkload; // Lower workload first
    });

    const selectedAgent = availableAgents[0];
    selectedAgent.currentWorkload++;

    analytics.track('ticket_auto_assigned', {
      ticket_id: ticket.id,
      agent_id: selectedAgent.id,
      team_id: targetTeam.id,
      skill_match: this.calculateSkillMatch(selectedAgent, ticket)
    });

    return {
      agentId: selectedAgent.id,
      teamId: targetTeam.id
    };
  }

  private calculateSkillMatch(agent: SupportAgent, ticket: Ticket): number {
    let score = 0;
    
    // Check category match
    if (agent.skills.includes(ticket.category)) score += 2;
    
    // Check tag matches
    for (const tag of ticket.tags) {
      if (agent.skills.includes(tag)) score += 1;
    }
    
    return score;
  }

  async updateTicket(ticketId: string, updates: {
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedTo?: string;
    tags?: string[];
    metadata?: Record<string, any>;
  }): Promise<void> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) throw new Error(`Ticket ${ticketId} not found`);

    const oldStatus = ticket.status;
    const oldAssignee = ticket.assignedTo;

    // Apply updates
    if (updates.status) ticket.status = updates.status;
    if (updates.priority) ticket.priority = updates.priority;
    if (updates.assignedTo !== undefined) ticket.assignedTo = updates.assignedTo;
    if (updates.tags) ticket.tags = updates.tags;
    if (updates.metadata) ticket.metadata = { ...ticket.metadata, ...updates.metadata };

    ticket.updatedAt = new Date();

    // Handle status changes
    if (updates.status) {
      if (updates.status === 'resolved') {
        ticket.resolvedAt = new Date();
      } else if (updates.status === 'closed') {
        ticket.closedAt = new Date();
      }

      await this.addTicketUpdate(ticketId, {
        type: 'status_change',
        content: `Status changed from ${oldStatus} to ${updates.status}`,
        author: 'system',
        authorType: 'system',
        isPublic: true
      });
    }

    // Handle assignment changes
    if (updates.assignedTo !== oldAssignee) {
      const newAgent = updates.assignedTo ? this.agents.get(updates.assignedTo) : null;
      const content = updates.assignedTo 
        ? `Assigned to ${newAgent?.name || updates.assignedTo}`
        : 'Unassigned';

      await this.addTicketUpdate(ticketId, {
        type: 'assignment',
        content,
        author: 'system',
        authorType: 'system',
        isPublic: false
      });

      // Update agent workloads
      if (oldAssignee) {
        const oldAgent = this.agents.get(oldAssignee);
        if (oldAgent) oldAgent.currentWorkload--;
      }
      if (updates.assignedTo) {
        const newAgent = this.agents.get(updates.assignedTo);
        if (newAgent) newAgent.currentWorkload++;
      }
    }

    // Send notifications
    await this.sendTicketNotifications(ticket, 'updated');

    analytics.track('support_ticket_updated', {
      ticket_id: ticketId,
      status_changed: !!updates.status,
      assignment_changed: updates.assignedTo !== oldAssignee,
      priority_changed: !!updates.priority
    });
  }

  async addTicketUpdate(ticketId: string, updateData: {
    type: 'comment' | 'status_change' | 'assignment' | 'escalation' | 'attachment';
    content: string;
    author: string;
    authorType: 'agent' | 'customer' | 'system';
    isPublic: boolean;
    metadata?: Record<string, any>;
  }): Promise<string> {
    const updateId = `UPD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    const update: TicketUpdate = {
      id: updateId,
      ticketId,
      type: updateData.type,
      content: updateData.content,
      author: updateData.author,
      authorType: updateData.authorType,
      isPublic: updateData.isPublic,
      createdAt: new Date(),
      metadata: updateData.metadata
    };

    const updates = this.ticketUpdates.get(ticketId) || [];
    updates.push(update);
    this.ticketUpdates.set(ticketId, updates);

    // Update ticket timestamp
    const ticket = this.tickets.get(ticketId);
    if (ticket) {
      ticket.updatedAt = new Date();

      // Track first response time for agents
      if (updateData.authorType === 'agent' && updateData.type === 'comment') {
        const firstAgentResponse = updates.find(u => 
          u.authorType === 'agent' && u.type === 'comment'
        );
        
        if (update.id === firstAgentResponse?.id) {
          const responseTime = update.createdAt.getTime() - ticket.createdAt.getTime();
          analytics.track('first_response_time', {
            ticket_id: ticketId,
            response_time_minutes: responseTime / (1000 * 60),
            agent_id: updateData.author,
            priority: ticket.priority
          });
        }
      }
    }

    analytics.track('ticket_update_added', {
      ticket_id: ticketId,
      update_type: updateData.type,
      author_type: updateData.authorType,
      is_public: updateData.isPublic
    });

    return updateId;
  }

  async escalateTicket(ticketId: string, escalationData: {
    reason: string;
    escalatedBy: string;
    escalatedTo: string;
  }): Promise<void> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) throw new Error(`Ticket ${ticketId} not found`);

    const escalationId = `ESC-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    const escalation: TicketEscalation = {
      id: escalationId,
      reason: escalationData.reason,
      escalatedBy: escalationData.escalatedBy,
      escalatedTo: escalationData.escalatedTo,
      escalatedAt: new Date(),
      resolved: false
    };

    ticket.escalations.push(escalation);
    ticket.assignedTo = escalationData.escalatedTo;
    ticket.updatedAt = new Date();

    await this.addTicketUpdate(ticketId, {
      type: 'escalation',
      content: `Escalated to ${escalationData.escalatedTo}: ${escalationData.reason}`,
      author: escalationData.escalatedBy,
      authorType: 'agent',
      isPublic: false,
      metadata: { escalation_id: escalationId }
    });

    // Send escalation notifications
    await this.sendEscalationNotifications(ticket, escalation);

    analytics.track('ticket_escalated', {
      ticket_id: ticketId,
      escalation_id: escalationId,
      reason: escalationData.reason,
      escalated_by: escalationData.escalatedBy,
      escalated_to: escalationData.escalatedTo
    });

    alertingService.recordEvent('ticket_escalation', {
      ticket_id: ticketId,
      priority: ticket.priority,
      reason: escalationData.reason
    });
  }

  async submitSatisfactionRating(ticketId: string, satisfaction: {
    rating: number;
    feedback?: string;
  }): Promise<void> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) throw new Error(`Ticket ${ticketId} not found`);

    ticket.satisfaction = {
      rating: satisfaction.rating,
      feedback: satisfaction.feedback,
      submittedAt: new Date()
    };

    ticket.updatedAt = new Date();

    // Update agent performance metrics
    if (ticket.assignedTo) {
      const agent = this.agents.get(ticket.assignedTo);
      if (agent) {
        // Update running average
        const currentSat = agent.performance.customerSatisfaction;
        const totalTickets = agent.performance.ticketsResolved;
        agent.performance.customerSatisfaction = 
          (currentSat * totalTickets + satisfaction.rating) / (totalTickets + 1);
      }
    }

    analytics.track('customer_satisfaction_submitted', {
      ticket_id: ticketId,
      rating: satisfaction.rating,
      has_feedback: !!satisfaction.feedback,
      agent_id: ticket.assignedTo
    });

    // Trigger escalation for poor ratings
    if (satisfaction.rating <= 2) {
      await this.handlePoorSatisfaction(ticket);
    }
  }

  private async handlePoorSatisfaction(ticket: Ticket): Promise<void> {
    if (!ticket.assignedTo) return;

    const agent = this.agents.get(ticket.assignedTo);
    if (!agent) return;

    // Find team lead to escalate to
    const team = Array.from(this.teams.values()).find(t => 
      t.members.includes(agent.id)
    );

    if (team) {
      await this.escalateTicket(ticket.id, {
        reason: 'Poor customer satisfaction rating',
        escalatedBy: 'system',
        escalatedTo: team.leaderId
      });
    }
  }

  private async sendTicketNotifications(ticket: Ticket, event: 'created' | 'updated'): Promise<void> {
    // In production, send actual notifications (email, Slack, etc.)
    analytics.track('ticket_notification_sent', {
      ticket_id: ticket.id,
      event,
      assigned_to: ticket.assignedTo,
      customer_id: ticket.customerId
    });
  }

  private async sendEscalationNotifications(ticket: Ticket, escalation: TicketEscalation): Promise<void> {
    // Send notifications to escalated agent and manager
    analytics.track('escalation_notification_sent', {
      ticket_id: ticket.id,
      escalation_id: escalation.id,
      escalated_to: escalation.escalatedTo
    });
  }

  private checkSLABreaches(): void {
    const now = new Date();
    
    for (const [ticketId, ticket] of this.tickets.entries()) {
      if (ticket.status === 'closed' || ticket.status === 'resolved') continue;

      const team = this.teams.get(ticket.assignedTeam || 'success');
      if (!team) continue;

      const ageInMinutes = (now.getTime() - ticket.createdAt.getTime()) / (1000 * 60);
      
      // Check first response SLA
      const hasAgentResponse = this.ticketUpdates.get(ticketId)?.some(
        update => update.authorType === 'agent' && update.type === 'comment'
      );

      if (!hasAgentResponse && ageInMinutes > team.slaTargets.firstResponseTime) {
        alertingService.recordEvent('sla_breach_first_response', {
          ticket_id: ticketId,
          minutes_overdue: ageInMinutes - team.slaTargets.firstResponseTime,
          priority: ticket.priority
        });
      }

      // Check resolution SLA
      const ageInHours = ageInMinutes / 60;
      if (ageInHours > team.slaTargets.resolutionTime) {
        alertingService.recordEvent('sla_breach_resolution', {
          ticket_id: ticketId,
          hours_overdue: ageInHours - team.slaTargets.resolutionTime,
          priority: ticket.priority
        });
      }
    }
  }

  private processEscalations(): void {
    // Process automatic escalations based on rules
    for (const rule of this.escalationRules) {
      this.processEscalationRule(rule);
    }
  }

  private processEscalationRule(rule: EscalationRule): void {
    const now = new Date();
    
    for (const [ticketId, ticket] of this.tickets.entries()) {
      if (ticket.status === 'closed' || ticket.status === 'resolved') continue;

      const ageInMinutes = (now.getTime() - ticket.createdAt.getTime()) / (1000 * 60);
      
      if (ageInMinutes < rule.triggerAfter) continue;

      let shouldEscalate = false;
      let escalationTarget = '';

      switch (rule.condition) {
        case 'priority_urgent_no_response':
          if (ticket.priority === 'urgent') {
            const hasResponse = this.ticketUpdates.get(ticketId)?.some(
              update => update.authorType === 'agent'
            );
            if (!hasResponse) {
              shouldEscalate = true;
              escalationTarget = this.findManager(ticket.assignedTo);
            }
          }
          break;

        case 'high_priority_breached_sla':
          if (ticket.priority === 'high') {
            const team = this.teams.get(ticket.assignedTeam || 'success');
            if (team && ageInMinutes > team.slaTargets.escalationThreshold * 60) {
              shouldEscalate = true;
              escalationTarget = this.findSeniorAgent(ticket.assignedTo);
            }
          }
          break;

        case 'customer_dissatisfaction':
          if (ticket.satisfaction && ticket.satisfaction.rating <= 2) {
            shouldEscalate = true;
            escalationTarget = this.findTeamLead(ticket.assignedTo);
          }
          break;
      }

      if (shouldEscalate && escalationTarget && !this.hasRecentEscalation(ticket)) {
        this.escalateTicket(ticketId, {
          reason: rule.description,
          escalatedBy: 'system',
          escalatedTo: escalationTarget
        });
      }
    }
  }

  private findManager(agentId?: string): string {
    // Find manager for escalation
    return 'manager-1'; // Simplified
  }

  private findSeniorAgent(agentId?: string): string {
    // Find senior agent for escalation
    return 'senior-agent-1'; // Simplified
  }

  private findTeamLead(agentId?: string): string {
    // Find team lead for escalation
    if (!agentId) return 'team-lead-1';
    
    const agent = this.agents.get(agentId);
    if (!agent) return 'team-lead-1';

    const team = Array.from(this.teams.values()).find(t => 
      t.members.includes(agentId)
    );
    
    return team?.leaderId || 'team-lead-1';
  }

  private hasRecentEscalation(ticket: Ticket): boolean {
    const recentEscalation = ticket.escalations.find(esc => 
      Date.now() - esc.escalatedAt.getTime() < 60 * 60 * 1000 // 1 hour
    );
    return !!recentEscalation;
  }

  private updateAgentAvailability(): void {
    // Update agent availability based on working hours
    for (const agent of this.agents.values()) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentDay = now.getDay();

      const workingHours = agent.availability.workingHours;
      const startHour = parseInt(workingHours.start.split(':')[0]);
      const endHour = parseInt(workingHours.end.split(':')[0]);

      const isWorkingDay = workingHours.days.includes(currentDay);
      const isWorkingHour = currentHour >= startHour && currentHour < endHour;

      if (isWorkingDay && isWorkingHour) {
        if (agent.availability.status === 'offline') {
          agent.availability.status = 'available';
        }
      } else {
        agent.availability.status = 'offline';
      }
    }
  }

  private generateDailyMetrics(): void {
    const metrics = this.getSupportMetrics();
    
    analytics.track('daily_support_metrics', {
      total_tickets: metrics.totalTickets,
      open_tickets: metrics.openTickets,
      avg_first_response: metrics.avgFirstResponseTime,
      avg_resolution: metrics.avgResolutionTime,
      customer_satisfaction: metrics.customerSatisfaction,
      sla_compliance: metrics.slaCompliance
    });
  }

  // Public methods for ticket management
  getTicket(ticketId: string): Ticket | null {
    return this.tickets.get(ticketId) || null;
  }

  getTicketUpdates(ticketId: string): TicketUpdate[] {
    return this.ticketUpdates.get(ticketId) || [];
  }

  getTickets(filters?: {
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedTo?: string;
    customerId?: string;
    organizationId?: string;
    category?: TicketCategory;
    tags?: string[];
    dateRange?: { start: Date; end: Date };
  }): Ticket[] {
    let tickets = Array.from(this.tickets.values());

    if (filters) {
      if (filters.status) {
        tickets = tickets.filter(t => t.status === filters.status);
      }
      if (filters.priority) {
        tickets = tickets.filter(t => t.priority === filters.priority);
      }
      if (filters.assignedTo) {
        tickets = tickets.filter(t => t.assignedTo === filters.assignedTo);
      }
      if (filters.customerId) {
        tickets = tickets.filter(t => t.customerId === filters.customerId);
      }
      if (filters.organizationId) {
        tickets = tickets.filter(t => t.organizationId === filters.organizationId);
      }
      if (filters.category) {
        tickets = tickets.filter(t => t.category === filters.category);
      }
      if (filters.tags && filters.tags.length > 0) {
        tickets = tickets.filter(t => 
          filters.tags!.some(tag => t.tags.includes(tag))
        );
      }
      if (filters.dateRange) {
        tickets = tickets.filter(t => 
          t.createdAt >= filters.dateRange!.start && 
          t.createdAt <= filters.dateRange!.end
        );
      }
    }

    return tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getSupportMetrics(): SupportMetrics {
    const tickets = Array.from(this.tickets.values());
    const openTickets = tickets.filter(t => ['open', 'in_progress', 'waiting_for_customer'].includes(t.status));
    
    // Calculate response times
    let totalFirstResponseTime = 0;
    let firstResponseCount = 0;
    let totalResolutionTime = 0;
    let resolutionCount = 0;
    let totalSatisfaction = 0;
    let satisfactionCount = 0;

    for (const ticket of tickets) {
      const updates = this.ticketUpdates.get(ticket.id) || [];
      
      // First response time
      const firstResponse = updates.find(u => u.authorType === 'agent' && u.type === 'comment');
      if (firstResponse) {
        totalFirstResponseTime += firstResponse.createdAt.getTime() - ticket.createdAt.getTime();
        firstResponseCount++;
      }

      // Resolution time
      if (ticket.resolvedAt) {
        totalResolutionTime += ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
        resolutionCount++;
      }

      // Customer satisfaction
      if (ticket.satisfaction) {
        totalSatisfaction += ticket.satisfaction.rating;
        satisfactionCount++;
      }
    }

    const avgFirstResponseTime = firstResponseCount > 0 
      ? totalFirstResponseTime / firstResponseCount / (1000 * 60) // Convert to minutes
      : 0;

    const avgResolutionTime = resolutionCount > 0 
      ? totalResolutionTime / resolutionCount / (1000 * 60 * 60) // Convert to hours
      : 0;

    const customerSatisfaction = satisfactionCount > 0 
      ? totalSatisfaction / satisfactionCount 
      : 0;

    // Calculate SLA compliance
    const slaCompliantTickets = tickets.filter(ticket => {
      const team = this.teams.get(ticket.assignedTeam || 'success');
      if (!team) return false;

      const updates = this.ticketUpdates.get(ticket.id) || [];
      const firstResponse = updates.find(u => u.authorType === 'agent' && u.type === 'comment');
      
      if (firstResponse) {
        const responseTime = (firstResponse.createdAt.getTime() - ticket.createdAt.getTime()) / (1000 * 60);
        return responseTime <= team.slaTargets.firstResponseTime;
      }
      
      return false;
    });

    const slaCompliance = tickets.length > 0 ? (slaCompliantTickets.length / tickets.length) * 100 : 100;

    // Count tickets by status, priority, category
    const ticketsByStatus: Record<TicketStatus, number> = {
      open: 0,
      in_progress: 0,
      waiting_for_customer: 0,
      resolved: 0,
      closed: 0
    };

    const ticketsByPriority: Record<TicketPriority, number> = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0
    };

    const ticketsByCategory: Record<TicketCategory, number> = {
      technical: 0,
      billing: 0,
      feature_request: 0,
      bug_report: 0,
      general: 0
    };

    tickets.forEach(ticket => {
      ticketsByStatus[ticket.status]++;
      ticketsByPriority[ticket.priority]++;
      ticketsByCategory[ticket.category]++;
    });

    const escalatedTickets = tickets.filter(t => t.escalations.length > 0);
    const escalationRate = tickets.length > 0 ? (escalatedTickets.length / tickets.length) * 100 : 0;

    const totalAgentCapacity = Array.from(this.agents.values()).reduce((sum, agent) => sum + agent.maxWorkload, 0);
    const totalAgentWorkload = Array.from(this.agents.values()).reduce((sum, agent) => sum + agent.currentWorkload, 0);
    const agentUtilization = totalAgentCapacity > 0 ? (totalAgentWorkload / totalAgentCapacity) * 100 : 0;

    return {
      totalTickets: tickets.length,
      openTickets: openTickets.length,
      avgFirstResponseTime,
      avgResolutionTime,
      customerSatisfaction,
      slaCompliance,
      escalationRate,
      agentUtilization,
      ticketsByPriority,
      ticketsByCategory,
      ticketsByStatus
    };
  }

  getAgents(): SupportAgent[] {
    return Array.from(this.agents.values());
  }

  getTeams(): SupportTeam[] {
    return Array.from(this.teams.values());
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  }> {
    const metrics = this.getSupportMetrics();
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (metrics.slaCompliance < 70 || 
        metrics.escalationRate > 30 || 
        metrics.customerSatisfaction < 3) {
      status = 'unhealthy';
    } else if (metrics.slaCompliance < 85 || 
               metrics.escalationRate > 15 || 
               metrics.customerSatisfaction < 4 ||
               metrics.agentUtilization > 90) {
      status = 'degraded';
    }

    return {
      status,
      details: {
        total_tickets: metrics.totalTickets,
        open_tickets: metrics.openTickets,
        sla_compliance: metrics.slaCompliance,
        escalation_rate: metrics.escalationRate,
        customer_satisfaction: metrics.customerSatisfaction,
        agent_utilization: metrics.agentUtilization,
        avg_first_response_minutes: metrics.avgFirstResponseTime,
        avg_resolution_hours: metrics.avgResolutionTime
      }
    };
  }
}

interface EscalationRule {
  condition: string;
  triggerAfter: number;
  action: string;
  description: string;
}

// Create singleton instance
export const ticketingSystem = new TicketingSystem();

export default ticketingSystem;