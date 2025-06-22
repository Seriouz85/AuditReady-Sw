/**
 * Scheduled Report Service
 * Handles automated report generation and delivery via email
 */

import { supabase } from '@/lib/supabase';
import ExportService, { ExportOptions, ReportData } from './ExportService';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import cron from 'node-cron';

export interface ScheduledReport {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  report_type: 'compliance_summary' | 'assessment_report' | 'gap_analysis' | 'custom';
  schedule_expression: string; // Cron expression
  parameters: Record<string, any>;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  is_active: boolean;
  last_run_at?: Date;
  next_run_at?: Date;
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

export interface EmailTemplate {
  subject: string;
  body: string;
  attachmentName?: string;
}

export interface ReportScheduleOptions {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  dayOfWeek?: number; // 0-6 for weekly reports
  dayOfMonth?: number; // 1-31 for monthly reports
  time?: string; // HH:mm format
  timezone?: string;
}

export class ScheduledReportService {
  private static instance: ScheduledReportService;
  private exportService: ExportService;
  private scheduledJobs: Map<string, any> = new Map();

  private constructor() {
    this.exportService = ExportService.getInstance();
  }

  static getInstance(): ScheduledReportService {
    if (!ScheduledReportService.instance) {
      ScheduledReportService.instance = new ScheduledReportService();
    }
    return ScheduledReportService.instance;
  }

  /**
   * Create a new scheduled report
   */
  async createScheduledReport(
    organizationId: string,
    reportConfig: Partial<ScheduledReport>,
    scheduleOptions: ReportScheduleOptions
  ): Promise<ScheduledReport> {
    const cronExpression = this.generateCronExpression(scheduleOptions);
    const nextRunAt = this.calculateNextRun(cronExpression);

    const reportData = {
      organization_id: organizationId,
      schedule_expression: cronExpression,
      next_run_at: nextRunAt.toISOString(),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...reportConfig
    };

    const { data, error } = await supabase
      .from('scheduled_reports')
      .insert(reportData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create scheduled report: ${error.message}`);
    }

    // Schedule the job
    if (data.is_active) {
      this.scheduleReport(data);
    }

    return data;
  }

  /**
   * Update an existing scheduled report
   */
  async updateScheduledReport(
    reportId: string,
    updates: Partial<ScheduledReport>,
    scheduleOptions?: ReportScheduleOptions
  ): Promise<ScheduledReport> {
    let updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (scheduleOptions) {
      const cronExpression = this.generateCronExpression(scheduleOptions);
      const nextRunAt = this.calculateNextRun(cronExpression);
      updateData.schedule_expression = cronExpression;
      updateData.next_run_at = nextRunAt.toISOString();
    }

    const { data, error } = await supabase
      .from('scheduled_reports')
      .update(updateData)
      .eq('id', reportId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update scheduled report: ${error.message}`);
    }

    // Reschedule the job
    this.unscheduleReport(reportId);
    if (data.is_active) {
      this.scheduleReport(data);
    }

    return data;
  }

  /**
   * Delete a scheduled report
   */
  async deleteScheduledReport(reportId: string): Promise<void> {
    this.unscheduleReport(reportId);

    const { error } = await supabase
      .from('scheduled_reports')
      .delete()
      .eq('id', reportId);

    if (error) {
      throw new Error(`Failed to delete scheduled report: ${error.message}`);
    }
  }

  /**
   * Get all scheduled reports for an organization
   */
  async getScheduledReports(organizationId: string): Promise<ScheduledReport[]> {
    const { data, error } = await supabase
      .from('scheduled_reports')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch scheduled reports: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Initialize scheduled reports on service startup
   */
  async initializeScheduledReports(): Promise<void> {
    const { data: reports, error } = await supabase
      .from('scheduled_reports')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Failed to fetch scheduled reports:', error);
      return;
    }

    reports?.forEach(report => {
      this.scheduleReport(report);
    });

    console.log(`Initialized ${reports?.length || 0} scheduled reports`);
  }

  /**
   * Execute a scheduled report immediately
   */
  async executeReportNow(reportId: string): Promise<void> {
    const { data: report, error } = await supabase
      .from('scheduled_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error || !report) {
      throw new Error('Scheduled report not found');
    }

    await this.executeReport(report);
  }

  /**
   * Schedule a report using cron
   */
  private scheduleReport(report: ScheduledReport): void {
    if (this.scheduledJobs.has(report.id)) {
      this.unscheduleReport(report.id);
    }

    try {
      const task = cron.schedule(
        report.schedule_expression,
        () => this.executeReport(report),
        {
          scheduled: true,
          timezone: 'UTC' // Always use UTC for consistency
        }
      );

      this.scheduledJobs.set(report.id, task);
      console.log(`Scheduled report ${report.name} with expression: ${report.schedule_expression}`);
    } catch (error) {
      console.error(`Failed to schedule report ${report.id}:`, error);
    }
  }

  /**
   * Unschedule a report
   */
  private unscheduleReport(reportId: string): void {
    const task = this.scheduledJobs.get(reportId);
    if (task) {
      task.stop();
      this.scheduledJobs.delete(reportId);
      console.log(`Unscheduled report ${reportId}`);
    }
  }

  /**
   * Execute a report and send via email
   */
  private async executeReport(report: ScheduledReport): Promise<void> {
    try {
      console.log(`Executing scheduled report: ${report.name}`);

      // Update last run time
      await supabase
        .from('scheduled_reports')
        .update({
          last_run_at: new Date().toISOString(),
          next_run_at: this.calculateNextRun(report.schedule_expression).toISOString()
        })
        .eq('id', report.id);

      // Generate the report
      let reportUrl: string;
      const exportOptions: ExportOptions = {
        format: report.format as any,
        includeSummary: true,
        includeDetails: true,
        ...report.parameters
      };

      switch (report.report_type) {
        case 'compliance_summary':
          reportUrl = await this.exportService.exportComplianceSummary(
            report.organization_id,
            exportOptions
          );
          break;
        case 'assessment_report':
          if (!report.parameters.assessmentId) {
            throw new Error('Assessment ID required for assessment reports');
          }
          reportUrl = await this.exportService.exportAssessmentReport(
            report.parameters.assessmentId,
            exportOptions
          );
          break;
        case 'gap_analysis':
          if (!report.parameters.gapAnalysisId) {
            throw new Error('Gap Analysis ID required for gap analysis reports');
          }
          reportUrl = await this.exportService.exportGapAnalysisReport(
            report.parameters.gapAnalysisId,
            exportOptions
          );
          break;
        default:
          throw new Error(`Unsupported report type: ${report.report_type}`);
      }

      // Send email to recipients
      await this.sendReportEmail(report, reportUrl);

      console.log(`Successfully executed scheduled report: ${report.name}`);
    } catch (error) {
      console.error(`Failed to execute scheduled report ${report.id}:`, error);
      
      // Log the error to the database
      await supabase
        .from('export_jobs')
        .insert({
          organization_id: report.organization_id,
          name: `Scheduled: ${report.name}`,
          export_type: 'scheduled_report',
          format: report.format,
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          created_by: report.created_by
        });
    }
  }

  /**
   * Send report via email
   */
  private async sendReportEmail(report: ScheduledReport, reportUrl: string): Promise<void> {
    const emailTemplate = this.generateEmailTemplate(report);

    // Get organization details
    const { data: organization } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', report.organization_id)
      .single();

    const emailData = {
      to: report.recipients,
      subject: emailTemplate.subject,
      html: emailTemplate.body,
      attachments: [{
        filename: emailTemplate.attachmentName || `report.${report.format}`,
        path: reportUrl
      }]
    };

    // TODO: Implement email sending (integrate with email service)
    // This would typically integrate with services like SendGrid, SES, etc.
    console.log('Email would be sent with data:', emailData);

    // Store notification delivery record
    for (const recipient of report.recipients) {
      await supabase
        .from('notification_deliveries')
        .insert({
          organization_id: report.organization_id,
          delivery_method: 'email',
          recipient,
          status: 'sent', // Would be 'pending' in real implementation
          delivery_details: {
            report_name: report.name,
            report_type: report.report_type,
            format: report.format
          }
        });
    }
  }

  /**
   * Generate email template for report
   */
  private generateEmailTemplate(report: ScheduledReport): EmailTemplate {
    const reportTypeName = report.report_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return {
      subject: `${reportTypeName} - ${report.name}`,
      body: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb;">AuditReady - Scheduled Report</h2>
              
              <p>Hello,</p>
              
              <p>Your scheduled report "<strong>${report.name}</strong>" has been generated and is attached to this email.</p>
              
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1e40af;">Report Details:</h3>
                <ul style="margin: 0;">
                  <li><strong>Report Type:</strong> ${reportTypeName}</li>
                  <li><strong>Format:</strong> ${report.format.toUpperCase()}</li>
                  <li><strong>Generated:</strong> ${format(new Date(), 'PPpp')}</li>
                  ${report.description ? `<li><strong>Description:</strong> ${report.description}</li>` : ''}
                </ul>
              </div>
              
              <p>If you have any questions about this report or need assistance, please don't hesitate to contact our support team.</p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #6b7280;">
                This is an automated email from AuditReady. To manage your scheduled reports, 
                please log in to your dashboard.
              </p>
            </div>
          </body>
        </html>
      `,
      attachmentName: `${report.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.${report.format}`
    };
  }

  /**
   * Generate cron expression from schedule options
   */
  private generateCronExpression(options: ReportScheduleOptions): string {
    const [hour, minute] = (options.time || '09:00').split(':').map(Number);

    switch (options.frequency) {
      case 'daily':
        return `${minute} ${hour} * * *`;
      
      case 'weekly':
        const dayOfWeek = options.dayOfWeek || 1; // Default to Monday
        return `${minute} ${hour} * * ${dayOfWeek}`;
      
      case 'monthly':
        const dayOfMonth = options.dayOfMonth || 1; // Default to 1st
        return `${minute} ${hour} ${dayOfMonth} * *`;
      
      case 'quarterly':
        return `${minute} ${hour} 1 */3 *`; // 1st day of every 3rd month
      
      case 'yearly':
        return `${minute} ${hour} 1 1 *`; // January 1st
      
      default:
        throw new Error(`Unsupported frequency: ${options.frequency}`);
    }
  }

  /**
   * Calculate next run time for a cron expression
   */
  private calculateNextRun(cronExpression: string): Date {
    // This is a simplified implementation
    // In production, you'd use a proper cron parser library
    const now = new Date();
    
    // For demo purposes, just add 1 day
    // Real implementation would parse the cron expression
    return addDays(now, 1);
  }

  /**
   * Get report execution history
   */
  async getReportHistory(
    organizationId: string,
    reportId?: string,
    limit: number = 50
  ): Promise<any[]> {
    let query = supabase
      .from('export_jobs')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('export_type', 'scheduled_report')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (reportId) {
      query = query.contains('result_summary', { report_id: reportId });
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch report history: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Preview report schedule
   */
  previewSchedule(options: ReportScheduleOptions, count: number = 5): Date[] {
    const cronExpression = this.generateCronExpression(options);
    const dates: Date[] = [];
    let currentDate = new Date();

    // Simple preview - in production use proper cron library
    for (let i = 0; i < count; i++) {
      switch (options.frequency) {
        case 'daily':
          currentDate = addDays(currentDate, 1);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, 1);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, 1);
          break;
        case 'quarterly':
          currentDate = addMonths(currentDate, 3);
          break;
        case 'yearly':
          currentDate = addYears(currentDate, 1);
          break;
      }
      dates.push(new Date(currentDate));
    }

    return dates;
  }

  /**
   * Validate cron expression
   */
  validateCronExpression(expression: string): boolean {
    try {
      cron.validate(expression);
      return true;
    } catch {
      return false;
    }
  }
}

export default ScheduledReportService;