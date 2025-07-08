import { analytics } from '@/lib/monitoring/analytics';
import { reportError, reportMessage } from '@/lib/monitoring/sentry';
import { alertingService } from '@/lib/monitoring/alerting';

export type BackupType = 'full' | 'incremental' | 'differential';
export type BackupStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type RestoreStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

interface BackupConfig {
  id: string;
  name: string;
  type: BackupType;
  schedule: string; // Cron expression
  retention: number; // Days
  encryption: boolean;
  compression: boolean;
  enabled: boolean;
  targets: BackupTarget[];
  metadata?: Record<string, any>;
}

interface BackupTarget {
  type: 'database' | 'files' | 'config';
  source: string;
  destination: string;
  filters?: string[];
  options?: Record<string, any>;
}

interface BackupJob {
  id: string;
  configId: string;
  type: BackupType;
  status: BackupStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  size?: number;
  filesCount?: number;
  location: string;
  checksum?: string;
  error?: string;
  metadata: Record<string, any>;
}

interface RestoreJob {
  id: string;
  backupId: string;
  status: RestoreStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  targetLocation: string;
  options: RestoreOptions;
  error?: string;
  metadata: Record<string, any>;
}

interface RestoreOptions {
  overwrite: boolean;
  selective: boolean;
  items?: string[];
  targetEnvironment?: string;
  verification: boolean;
}

interface BackupMetrics {
  totalBackups: number;
  successfulBackups: number;
  failedBackups: number;
  totalSize: number;
  averageSize: number;
  averageDuration: number;
  lastBackupTime?: Date;
  nextScheduledBackup?: Date;
  retentionCompliance: number;
}

interface DisasterRecoveryPlan {
  id: string;
  name: string;
  description: string;
  rto: number; // Recovery Time Objective in minutes
  rpo: number; // Recovery Point Objective in minutes
  priority: 'critical' | 'high' | 'medium' | 'low';
  procedures: RecoveryProcedure[];
  dependencies: string[];
  contacts: EmergencyContact[];
  enabled: boolean;
}

interface RecoveryProcedure {
  id: string;
  name: string;
  description: string;
  order: number;
  automated: boolean;
  script?: string;
  manualSteps?: string[];
  estimatedTime: number;
  dependencies: string[];
}

interface EmergencyContact {
  name: string;
  role: string;
  email: string;
  phone: string;
  priority: number;
}

class BackupService {
  private backupConfigs: Map<string, BackupConfig> = new Map();
  private backupJobs: Map<string, BackupJob> = new Map();
  private restoreJobs: Map<string, RestoreJob> = new Map();
  private drPlans: Map<string, DisasterRecoveryPlan> = new Map();
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map();
  private runningJobs: Set<string> = new Set();
  private maxJobHistory = 1000;

  constructor() {
    this.initializeDefaultConfigs();
    this.startScheduler();
    this.startMonitoring();
  }

  private initializeDefaultConfigs(): void {
    // Database backup configuration
    this.addBackupConfig({
      id: 'database-daily',
      name: 'Daily Database Backup',
      type: 'full',
      schedule: '0 2 * * *', // Daily at 2 AM
      retention: 30, // 30 days
      encryption: true,
      compression: true,
      enabled: true,
      targets: [
        {
          type: 'database',
          source: 'postgresql://localhost:5432/auditready',
          destination: 's3://auditready-backups/database/',
          options: {
            format: 'custom',
            exclude_tables: ['temp_*', 'cache_*']
          }
        }
      ]
    });

    // Application files backup
    this.addBackupConfig({
      id: 'files-weekly',
      name: 'Weekly Files Backup',
      type: 'incremental',
      schedule: '0 3 * * 0', // Weekly on Sunday at 3 AM
      retention: 90, // 90 days
      encryption: true,
      compression: true,
      enabled: true,
      targets: [
        {
          type: 'files',
          source: '/app/uploads',
          destination: 's3://auditready-backups/files/',
          filters: ['*.pdf', '*.docx', '*.xlsx', '*.png', '*.jpg'],
          options: {
            follow_symlinks: false,
            preserve_permissions: true
          }
        }
      ]
    });

    // Configuration backup
    this.addBackupConfig({
      id: 'config-daily',
      name: 'Daily Configuration Backup',
      type: 'full',
      schedule: '0 1 * * *', // Daily at 1 AM
      retention: 60, // 60 days
      encryption: true,
      compression: true,
      enabled: true,
      targets: [
        {
          type: 'config',
          source: '/app/config',
          destination: 's3://auditready-backups/config/',
          filters: ['*.json', '*.yml', '*.env'],
          options: {
            include_hidden: false
          }
        }
      ]
    });

    // Initialize disaster recovery plans
    this.initializeDisasterRecoveryPlans();
  }

  private initializeDisasterRecoveryPlans(): void {
    this.addDisasterRecoveryPlan({
      id: 'database-failure',
      name: 'Database System Failure',
      description: 'Recovery procedures for complete database system failure',
      rto: 60, // 1 hour
      rpo: 15, // 15 minutes
      priority: 'critical',
      procedures: [
        {
          id: 'assess-damage',
          name: 'Assess Database Damage',
          description: 'Determine the extent of database corruption or failure',
          order: 1,
          automated: true,
          script: 'scripts/assess-database.sh',
          estimatedTime: 5,
          dependencies: []
        },
        {
          id: 'prepare-environment',
          name: 'Prepare Recovery Environment',
          description: 'Set up clean database environment for restoration',
          order: 2,
          automated: true,
          script: 'scripts/prepare-db-environment.sh',
          estimatedTime: 10,
          dependencies: ['assess-damage']
        },
        {
          id: 'restore-database',
          name: 'Restore Database from Backup',
          description: 'Restore database from latest verified backup',
          order: 3,
          automated: true,
          script: 'scripts/restore-database.sh',
          estimatedTime: 30,
          dependencies: ['prepare-environment']
        },
        {
          id: 'verify-integrity',
          name: 'Verify Data Integrity',
          description: 'Run integrity checks on restored database',
          order: 4,
          automated: true,
          script: 'scripts/verify-database.sh',
          estimatedTime: 10,
          dependencies: ['restore-database']
        },
        {
          id: 'resume-operations',
          name: 'Resume Normal Operations',
          description: 'Bring application back online and notify stakeholders',
          order: 5,
          automated: false,
          manualSteps: [
            'Update DNS if necessary',
            'Restart application services',
            'Notify all stakeholders',
            'Monitor system closely for 24 hours'
          ],
          estimatedTime: 15,
          dependencies: ['verify-integrity']
        }
      ],
      dependencies: ['network-connectivity', 'storage-access'],
      contacts: [
        {
          name: 'DevOps Team Lead',
          role: 'Primary Contact',
          email: 'devops-lead@auditready.com',
          phone: '+1-555-0101',
          priority: 1
        },
        {
          name: 'Database Administrator',
          role: 'Technical Expert',
          email: 'dba@auditready.com',
          phone: '+1-555-0102',
          priority: 2
        }
      ],
      enabled: true
    });

    this.addDisasterRecoveryPlan({
      id: 'application-failure',
      name: 'Application Server Failure',
      description: 'Recovery procedures for application server failure',
      rto: 30, // 30 minutes
      rpo: 5, // 5 minutes
      priority: 'high',
      procedures: [
        {
          id: 'failover-traffic',
          name: 'Failover Traffic',
          description: 'Redirect traffic to backup servers',
          order: 1,
          automated: true,
          script: 'scripts/failover-traffic.sh',
          estimatedTime: 2,
          dependencies: []
        },
        {
          id: 'diagnose-issue',
          name: 'Diagnose Application Issue',
          description: 'Identify root cause of application failure',
          order: 2,
          automated: false,
          manualSteps: [
            'Check application logs',
            'Verify system resources',
            'Test database connectivity',
            'Check external dependencies'
          ],
          estimatedTime: 10,
          dependencies: ['failover-traffic']
        },
        {
          id: 'restore-service',
          name: 'Restore Application Service',
          description: 'Fix and restart application services',
          order: 3,
          automated: false,
          manualSteps: [
            'Apply necessary fixes',
            'Restart application services',
            'Verify functionality',
            'Run health checks'
          ],
          estimatedTime: 15,
          dependencies: ['diagnose-issue']
        }
      ],
      dependencies: ['load-balancer', 'backup-servers'],
      contacts: [
        {
          name: 'Application Team Lead',
          role: 'Primary Contact',
          email: 'app-team@auditready.com',
          phone: '+1-555-0103',
          priority: 1
        }
      ],
      enabled: true
    });
  }

  private startScheduler(): void {
    // Check for scheduled backups every minute
    setInterval(() => {
      this.checkScheduledBackups();
    }, 60000);

    // Clean up old jobs every hour
    setInterval(() => {
      this.cleanupOldJobs();
    }, 3600000);
  }

  private startMonitoring(): void {
    // Monitor backup health every 15 minutes
    setInterval(() => {
      this.monitorBackupHealth();
    }, 900000);
  }

  addBackupConfig(config: BackupConfig): void {
    this.backupConfigs.set(config.id, config);
    
    if (config.enabled) {
      this.scheduleBackup(config);
    }

    analytics.track('backup_config_added', {
      config_id: config.id,
      type: config.type,
      retention: config.retention,
      targets: config.targets.length
    });
  }

  updateBackupConfig(configId: string, updates: Partial<BackupConfig>): void {
    const existing = this.backupConfigs.get(configId);
    if (existing) {
      const updated = { ...existing, ...updates };
      this.backupConfigs.set(configId, updated);
      
      // Reschedule if schedule changed
      if (updates.schedule || updates.enabled !== undefined) {
        this.unscheduleBackup(configId);
        if (updated.enabled) {
          this.scheduleBackup(updated);
        }
      }
    }
  }

  removeBackupConfig(configId: string): void {
    this.backupConfigs.delete(configId);
    this.unscheduleBackup(configId);
  }

  private scheduleBackup(config: BackupConfig): void {
    // Parse cron schedule and calculate next run time
    const nextRun = this.parseNextRun(config.schedule);
    const delay = nextRun.getTime() - Date.now();
    
    const timeout = setTimeout(() => {
      this.executeBackup(config.id);
      // Reschedule for next run
      this.scheduleBackup(config);
    }, delay);
    
    this.scheduledJobs.set(config.id, timeout);
  }

  private unscheduleBackup(configId: string): void {
    const timeout = this.scheduledJobs.get(configId);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledJobs.delete(configId);
    }
  }

  private parseNextRun(cronExpression: string): Date {
    // Simplified cron parser - in production, use a proper cron library
    const parts = cronExpression.split(' ');
    const [minute, hour, day, month, dayOfWeek] = parts;
    
    const now = new Date();
    const next = new Date(now);
    
    // Simple daily backup at specified hour
    if (hour !== '*') {
      next.setHours(parseInt(hour), parseInt(minute || '0'), 0, 0);
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
    }
    
    return next;
  }

  async executeBackup(configId: string): Promise<string> {
    const config = this.backupConfigs.get(configId);
    if (!config || !config.enabled) {
      throw new Error(`Backup config ${configId} not found or disabled`);
    }

    if (this.runningJobs.has(configId)) {
      throw new Error(`Backup ${configId} is already running`);
    }

    const jobId = `backup_${configId}_${Date.now()}`;
    const job: BackupJob = {
      id: jobId,
      configId,
      type: config.type,
      status: 'pending',
      startTime: new Date(),
      location: '',
      metadata: {
        config_name: config.name,
        targets: config.targets.length
      }
    };

    this.backupJobs.set(jobId, job);
    this.runningJobs.add(configId);

    try {
      job.status = 'running';
      
      analytics.track('backup_started', {
        job_id: jobId,
        config_id: configId,
        type: config.type
      });

      // Execute backup for each target
      const results = await Promise.all(
        config.targets.map(target => this.executeTargetBackup(target, config, jobId))
      );

      // Calculate job statistics
      job.size = results.reduce((sum, r) => sum + (r.size || 0), 0);
      job.filesCount = results.reduce((sum, r) => sum + (r.files || 0), 0);
      job.location = results[0]?.location || '';
      job.checksum = this.calculateChecksum(results);

      job.status = 'completed';
      job.endTime = new Date();
      job.duration = job.endTime.getTime() - job.startTime.getTime();

      // Clean up old backups based on retention policy
      await this.cleanupOldBackups(config);

      analytics.track('backup_completed', {
        job_id: jobId,
        config_id: configId,
        duration: job.duration,
        size: job.size,
        files_count: job.filesCount
      });

      reportMessage(`Backup completed successfully: ${config.name}`, 'info', {
        job_id: jobId,
        duration: job.duration,
        size: job.size
      });

    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.endTime = new Date();
      job.duration = job.endTime.getTime() - job.startTime.getTime();

      analytics.track('backup_failed', {
        job_id: jobId,
        config_id: configId,
        error: job.error,
        duration: job.duration
      });

      reportError(error instanceof Error ? error : new Error('Backup failed'), {
        job_id: jobId,
        config_id: configId
      });

      // Trigger alert for failed backup
      alertingService.recordEvent('backup_failure', {
        job_id: jobId,
        config_id: configId,
        config_name: config.name
      });

      throw error;
    } finally {
      this.runningJobs.delete(configId);
    }

    return jobId;
  }

  private async executeTargetBackup(
    target: BackupTarget, 
    config: BackupConfig, 
    jobId: string
  ): Promise<{ size: number; files: number; location: string }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${target.destination}${jobId}/${timestamp}`;

    switch (target.type) {
      case 'database':
        return this.backupDatabase(target, backupPath, config);
      case 'files':
        return this.backupFiles(target, backupPath, config);
      case 'config':
        return this.backupConfig(target, backupPath, config);
      default:
        throw new Error(`Unknown backup target type: ${target.type}`);
    }
  }

  private async backupDatabase(
    target: BackupTarget, 
    backupPath: string, 
    config: BackupConfig
  ): Promise<{ size: number; files: number; location: string }> {
    // Simulate database backup
    // In production, this would use pg_dump, mysqldump, etc.
    
    const startTime = Date.now();
    
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const size = Math.floor(Math.random() * 1000000000); // Random size
    const location = `${backupPath}/database.backup`;
    
    analytics.track('database_backup_completed', {
      location,
      size,
      duration: Date.now() - startTime,
      compression: config.compression,
      encryption: config.encryption
    });

    return { size, files: 1, location };
  }

  private async backupFiles(
    target: BackupTarget, 
    backupPath: string, 
    config: BackupConfig
  ): Promise<{ size: number; files: number; location: string }> {
    // Simulate file backup
    const startTime = Date.now();
    
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const size = Math.floor(Math.random() * 500000000);
    const files = Math.floor(Math.random() * 10000);
    const location = `${backupPath}/files.tar.gz`;
    
    analytics.track('files_backup_completed', {
      location,
      size,
      files,
      duration: Date.now() - startTime,
      filters: target.filters?.length || 0
    });

    return { size, files, location };
  }

  private async backupConfig(
    target: BackupTarget, 
    backupPath: string, 
    config: BackupConfig
  ): Promise<{ size: number; files: number; location: string }> {
    // Simulate configuration backup
    const startTime = Date.now();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const size = Math.floor(Math.random() * 10000000);
    const files = Math.floor(Math.random() * 100);
    const location = `${backupPath}/config.tar.gz`;
    
    analytics.track('config_backup_completed', {
      location,
      size,
      files,
      duration: Date.now() - startTime
    });

    return { size, files, location };
  }

  private calculateChecksum(results: any[]): string {
    // Simple checksum calculation
    const data = JSON.stringify(results);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private async cleanupOldBackups(config: BackupConfig): Promise<void> {
    // Simulate cleanup of old backups based on retention policy
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - config.retention);
    
    const oldBackups = Array.from(this.backupJobs.values()).filter(
      job => job.configId === config.id && 
             job.startTime < cutoffDate && 
             job.status === 'completed'
    );

    for (const backup of oldBackups) {
      // In production, delete actual backup files
      this.backupJobs.delete(backup.id);
    }

    if (oldBackups.length > 0) {
      analytics.track('backup_cleanup', {
        config_id: config.id,
        cleaned_count: oldBackups.length
      });
    }
  }

  async restoreBackup(
    backupId: string, 
    options: RestoreOptions
  ): Promise<string> {
    const backup = this.backupJobs.get(backupId);
    if (!backup || backup.status !== 'completed') {
      throw new Error(`Backup ${backupId} not found or not completed`);
    }

    const restoreId = `restore_${backupId}_${Date.now()}`;
    const restoreJob: RestoreJob = {
      id: restoreId,
      backupId,
      status: 'pending',
      startTime: new Date(),
      targetLocation: options.targetEnvironment || 'current',
      options,
      metadata: {
        backup_config_id: backup.configId,
        backup_size: backup.size
      }
    };

    this.restoreJobs.set(restoreId, restoreJob);

    try {
      restoreJob.status = 'running';

      analytics.track('restore_started', {
        restore_id: restoreId,
        backup_id: backupId,
        selective: options.selective,
        verification: options.verification
      });

      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 10000));

      if (options.verification) {
        // Simulate verification
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      restoreJob.status = 'completed';
      restoreJob.endTime = new Date();
      restoreJob.duration = restoreJob.endTime.getTime() - restoreJob.startTime.getTime();

      analytics.track('restore_completed', {
        restore_id: restoreId,
        backup_id: backupId,
        duration: restoreJob.duration
      });

      reportMessage(`Restore completed successfully: ${restoreId}`, 'info', {
        restore_id: restoreId,
        backup_id: backupId,
        duration: restoreJob.duration
      });

    } catch (error) {
      restoreJob.status = 'failed';
      restoreJob.error = error instanceof Error ? error.message : 'Unknown error';
      restoreJob.endTime = new Date();
      restoreJob.duration = restoreJob.endTime.getTime() - restoreJob.startTime.getTime();

      analytics.track('restore_failed', {
        restore_id: restoreId,
        backup_id: backupId,
        error: restoreJob.error,
        duration: restoreJob.duration
      });

      reportError(error instanceof Error ? error : new Error('Restore failed'), {
        restore_id: restoreId,
        backup_id: backupId
      });

      throw error;
    }

    return restoreId;
  }

  addDisasterRecoveryPlan(plan: DisasterRecoveryPlan): void {
    this.drPlans.set(plan.id, plan);
    
    analytics.track('dr_plan_added', {
      plan_id: plan.id,
      priority: plan.priority,
      rto: plan.rto,
      rpo: plan.rpo,
      procedures: plan.procedures.length
    });
  }

  async executeDRPlan(planId: string): Promise<void> {
    const plan = this.drPlans.get(planId);
    if (!plan || !plan.enabled) {
      throw new Error(`DR plan ${planId} not found or disabled`);
    }

    analytics.track('dr_plan_execution_started', {
      plan_id: planId,
      priority: plan.priority
    });

    reportMessage(`Disaster recovery plan execution started: ${plan.name}`, 'warning', {
      plan_id: planId,
      rto: plan.rto,
      rpo: plan.rpo
    });

    // Notify emergency contacts
    this.notifyEmergencyContacts(plan);

    // Execute procedures in order
    for (const procedure of plan.procedures.sort((a, b) => a.order - b.order)) {
      try {
        if (procedure.automated && procedure.script) {
          // Execute automated procedure
          await this.executeAutomatedProcedure(procedure);
        } else {
          // Log manual procedure for human execution
          reportMessage(`Manual procedure required: ${procedure.name}`, 'info', {
            procedure_id: procedure.id,
            estimated_time: procedure.estimatedTime,
            manual_steps: procedure.manualSteps
          });
        }
      } catch (error) {
        reportError(error instanceof Error ? error : new Error('DR procedure failed'), {
          plan_id: planId,
          procedure_id: procedure.id
        });
        
        // Continue with other procedures
      }
    }

    analytics.track('dr_plan_execution_completed', {
      plan_id: planId
    });
  }

  private async executeAutomatedProcedure(procedure: RecoveryProcedure): Promise<void> {
    // Simulate automated procedure execution
    await new Promise(resolve => setTimeout(resolve, procedure.estimatedTime * 1000));
    
    analytics.track('dr_procedure_executed', {
      procedure_id: procedure.id,
      automated: procedure.automated,
      duration: procedure.estimatedTime
    });
  }

  private notifyEmergencyContacts(plan: DisasterRecoveryPlan): void {
    const sortedContacts = plan.contacts.sort((a, b) => a.priority - b.priority);
    
    for (const contact of sortedContacts) {
      // In production, send actual notifications (email, SMS, etc.)
      analytics.track('emergency_contact_notified', {
        plan_id: plan.id,
        contact_role: contact.role,
        priority: contact.priority
      });
    }
  }

  private checkScheduledBackups(): void {
    // This method is called by the scheduler
    // Actual scheduling is handled by individual timeout functions
  }

  private cleanupOldJobs(): void {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days

    // Clean up backup jobs
    for (const [id, job] of this.backupJobs.entries()) {
      if (job.startTime.getTime() < cutoff) {
        this.backupJobs.delete(id);
      }
    }

    // Clean up restore jobs
    for (const [id, job] of this.restoreJobs.entries()) {
      if (job.startTime.getTime() < cutoff) {
        this.restoreJobs.delete(id);
      }
    }

    // Limit total jobs
    if (this.backupJobs.size > this.maxJobHistory) {
      const jobs = Array.from(this.backupJobs.entries())
        .sort((a, b) => b[1].startTime.getTime() - a[1].startTime.getTime())
        .slice(this.maxJobHistory);
      
      this.backupJobs.clear();
      jobs.forEach(([id, job]) => this.backupJobs.set(id, job));
    }
  }

  private monitorBackupHealth(): void {
    const metrics = this.getBackupMetrics();
    
    // Check for backup failures
    const recentFailures = Array.from(this.backupJobs.values()).filter(
      job => job.status === 'failed' && 
             Date.now() - job.startTime.getTime() < 24 * 60 * 60 * 1000
    );

    if (recentFailures.length > 0) {
      alertingService.recordEvent('backup_health_degraded', {
        failed_backups: recentFailures.length,
        success_rate: metrics.successfulBackups / metrics.totalBackups
      });
    }

    // Check for missed backups
    const now = new Date();
    for (const config of this.backupConfigs.values()) {
      if (!config.enabled) continue;
      
      const lastBackup = Array.from(this.backupJobs.values())
        .filter(job => job.configId === config.id && job.status === 'completed')
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];
      
      if (lastBackup) {
        const hoursSinceLastBackup = (now.getTime() - lastBackup.startTime.getTime()) / (1000 * 60 * 60);
        const expectedInterval = this.getBackupInterval(config.schedule);
        
        if (hoursSinceLastBackup > expectedInterval * 1.5) {
          alertingService.recordEvent('backup_overdue', {
            config_id: config.id,
            config_name: config.name,
            hours_overdue: hoursSinceLastBackup - expectedInterval
          });
        }
      }
    }
  }

  private getBackupInterval(schedule: string): number {
    // Parse cron to determine expected interval in hours
    if (schedule.includes('* * *')) return 24; // Daily
    if (schedule.includes('* * 0')) return 168; // Weekly
    return 24; // Default to daily
  }

  // Public methods for backup management
  getBackupJobs(filters?: {
    configId?: string;
    status?: BackupStatus;
    startDate?: Date;
    endDate?: Date;
  }): BackupJob[] {
    let jobs = Array.from(this.backupJobs.values());

    if (filters) {
      if (filters.configId) {
        jobs = jobs.filter(j => j.configId === filters.configId);
      }
      if (filters.status) {
        jobs = jobs.filter(j => j.status === filters.status);
      }
      if (filters.startDate) {
        jobs = jobs.filter(j => j.startTime >= filters.startDate!);
      }
      if (filters.endDate) {
        jobs = jobs.filter(j => j.startTime <= filters.endDate!);
      }
    }

    return jobs.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  getRestoreJobs(): RestoreJob[] {
    return Array.from(this.restoreJobs.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  getBackupConfigs(): BackupConfig[] {
    return Array.from(this.backupConfigs.values());
  }

  getDRPlans(): DisasterRecoveryPlan[] {
    return Array.from(this.drPlans.values());
  }

  getBackupMetrics(): BackupMetrics {
    const jobs = Array.from(this.backupJobs.values());
    const completedJobs = jobs.filter(j => j.status === 'completed');
    const failedJobs = jobs.filter(j => j.status === 'failed');
    
    const totalSize = completedJobs.reduce((sum, j) => sum + (j.size || 0), 0);
    const totalDuration = completedJobs.reduce((sum, j) => sum + (j.duration || 0), 0);
    
    const lastBackup = completedJobs
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];
    
    // Calculate next scheduled backup
    const nextScheduled = this.getNextScheduledBackup();

    return {
      totalBackups: jobs.length,
      successfulBackups: completedJobs.length,
      failedBackups: failedJobs.length,
      totalSize,
      averageSize: completedJobs.length > 0 ? totalSize / completedJobs.length : 0,
      averageDuration: completedJobs.length > 0 ? totalDuration / completedJobs.length : 0,
      lastBackupTime: lastBackup?.startTime,
      nextScheduledBackup: nextScheduled,
      retentionCompliance: this.calculateRetentionCompliance()
    };
  }

  private getNextScheduledBackup(): Date | undefined {
    let nextBackup: Date | undefined;
    
    for (const config of this.backupConfigs.values()) {
      if (!config.enabled) continue;
      
      const nextRun = this.parseNextRun(config.schedule);
      if (!nextBackup || nextRun < nextBackup) {
        nextBackup = nextRun;
      }
    }
    
    return nextBackup;
  }

  private calculateRetentionCompliance(): number {
    let compliantConfigs = 0;
    
    for (const config of this.backupConfigs.values()) {
      const configJobs = Array.from(this.backupJobs.values())
        .filter(j => j.configId === config.id && j.status === 'completed');
      
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() - config.retention);
      
      const validBackups = configJobs.filter(j => j.startTime >= retentionDate);
      
      if (validBackups.length > 0) {
        compliantConfigs++;
      }
    }
    
    return this.backupConfigs.size > 0 ? 
      (compliantConfigs / this.backupConfigs.size) * 100 : 100;
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  }> {
    const metrics = this.getBackupMetrics();
    const runningBackups = this.runningJobs.size;
    const failureRate = metrics.totalBackups > 0 ? 
      (metrics.failedBackups / metrics.totalBackups) * 100 : 0;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (failureRate > 20 || metrics.retentionCompliance < 50) {
      status = 'unhealthy';
    } else if (failureRate > 10 || metrics.retentionCompliance < 80 || runningBackups > 3) {
      status = 'degraded';
    }

    return {
      status,
      details: {
        total_backups: metrics.totalBackups,
        successful_backups: metrics.successfulBackups,
        failed_backups: metrics.failedBackups,
        failure_rate: failureRate,
        retention_compliance: metrics.retentionCompliance,
        running_backups: runningBackups,
        last_backup: metrics.lastBackupTime,
        next_scheduled: metrics.nextScheduledBackup
      }
    };
  }
}

// Create singleton instance
export const backupService = new BackupService();

export default backupService;