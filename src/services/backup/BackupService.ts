import { supabase } from '@/lib/supabase';

interface BackupConfig {
  includeUserData: boolean;
  includeAuditLogs: boolean;
  includeSystemSettings: boolean;
  compression: 'none' | 'gzip';
  encryption: boolean;
}

interface BackupMetadata {
  id: string;
  name: string;
  size: number;
  tables: string[];
  created_at: string;
  created_by: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  file_path?: string;
  error_message?: string;
}

export class BackupService {
  private readonly BACKUP_TABLES = [
    'organizations',
    'organization_users',
    'standards_library',
    'requirements_library',
    'assessments',
    'assessment_requirements',
    'subscriptions',
    'invoices',
    'user_roles',
    'platform_settings',
    'system_settings',
  ];

  private readonly AUDIT_TABLES = [
    'audit_logs',
    'enhanced_audit_logs',
  ];

  private readonly SYSTEM_TABLES = [
    'platform_administrators',
    'system_settings',
    'platform_settings',
  ];

  // Create manual backup
  async createBackup(
    name: string,
    config: BackupConfig = {
      includeUserData: true,
      includeAuditLogs: true,
      includeSystemSettings: false,
      compression: 'gzip',
      encryption: true,
    }
  ): Promise<{ success: boolean; backupId?: string; error?: string }> {
    try {
      // Generate backup metadata
      const backupId = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      
      // Determine which tables to include
      let tablesToBackup = [...this.BACKUP_TABLES];
      
      if (config.includeAuditLogs) {
        tablesToBackup.push(...this.AUDIT_TABLES);
      }
      
      if (config.includeSystemSettings) {
        tablesToBackup.push(...this.SYSTEM_TABLES);
      }

      // Create backup record
      const backupMetadata: Partial<BackupMetadata> = {
        id: backupId,
        name: name || `Manual Backup ${timestamp}`,
        tables: tablesToBackup,
        status: 'pending',
        created_at: timestamp,
      };

      // Insert backup record
      const { error: insertError } = await supabase
        .from('backup_history')
        .insert([backupMetadata]);

      if (insertError) {
        throw new Error(`Failed to create backup record: ${insertError.message}`);
      }

      // Trigger backup via Edge Function
      const { data, error } = await supabase.functions.invoke('create-backup', {
        body: {
          backupId,
          tables: tablesToBackup,
          config,
        },
      });

      if (error) {
        // Update backup status to failed
        await supabase
          .from('backup_history')
          .update({ 
            status: 'failed', 
            error_message: error.message 
          })
          .eq('id', backupId);
        
        throw new Error(error.message);
      }

      // Log backup creation
      await this.logBackupActivity('backup_created', backupId, {
        backup_name: name,
        tables: tablesToBackup,
        config,
      });

      return { success: true, backupId };
    } catch (error) {
      console.error('Backup creation error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create backup' 
      };
    }
  }

  // Get backup history
  async getBackupHistory(limit = 50): Promise<BackupMetadata[]> {
    try {
      const { data, error } = await supabase
        .from('backup_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching backup history:', error);
      return [];
    }
  }

  // Get backup status
  async getBackupStatus(backupId: string): Promise<BackupMetadata | null> {
    try {
      const { data, error } = await supabase
        .from('backup_history')
        .select('*')
        .eq('id', backupId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching backup status:', error);
      return null;
    }
  }

  // Download backup file
  async downloadBackup(backupId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('download-backup', {
        body: { backupId },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Log backup download
      await this.logBackupActivity('backup_downloaded', backupId);

      return { success: true, url: data.downloadUrl };
    } catch (error) {
      console.error('Backup download error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to download backup' 
      };
    }
  }

  // Delete backup
  async deleteBackup(backupId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get backup details first
      const backup = await this.getBackupStatus(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }

      // Delete backup file via Edge Function
      const { error: deleteError } = await supabase.functions.invoke('delete-backup', {
        body: { backupId },
      });

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      // Remove backup record
      const { error: dbError } = await supabase
        .from('backup_history')
        .delete()
        .eq('id', backupId);

      if (dbError) {
        throw new Error(`Failed to remove backup record: ${dbError.message}`);
      }

      // Log backup deletion
      await this.logBackupActivity('backup_deleted', backupId, {
        backup_name: backup.name,
      });

      return { success: true };
    } catch (error) {
      console.error('Backup deletion error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete backup' 
      };
    }
  }

  // Restore from backup
  async restoreFromBackup(
    backupId: string,
    options: {
      confirmDeletion: boolean;
      selectiveTables?: string[];
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!options.confirmDeletion) {
        throw new Error('Restoration requires explicit confirmation');
      }

      // Get backup details
      const backup = await this.getBackupStatus(backupId);
      if (!backup || backup.status !== 'completed') {
        throw new Error('Backup not found or not completed');
      }

      // Trigger restore via Edge Function
      const { data, error } = await supabase.functions.invoke('restore-backup', {
        body: {
          backupId,
          tablesToRestore: options.selectiveTables || backup.tables,
          confirmDeletion: options.confirmDeletion,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Log restore operation
      await this.logBackupActivity('backup_restored', backupId, {
        backup_name: backup.name,
        tables_restored: options.selectiveTables || backup.tables,
      });

      return { success: true };
    } catch (error) {
      console.error('Backup restore error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to restore backup' 
      };
    }
  }

  // Configure automatic backups
  async configureAutomaticBackups(config: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:MM format
    retentionDays: number;
    includedTables: string[];
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Update system settings
      const { error: settingsError } = await supabase
        .from('system_settings')
        .upsert([
          {
            key: 'backup_enabled',
            value: config.enabled,
            category: 'backup',
            description: 'Enable automatic backups',
            data_type: 'boolean',
          },
          {
            key: 'backup_frequency',
            value: `"${config.frequency}"`,
            category: 'backup',
            description: 'Backup frequency',
            data_type: 'string',
          },
          {
            key: 'backup_time',
            value: `"${config.time}"`,
            category: 'backup',
            description: 'Backup time (HH:MM)',
            data_type: 'string',
          },
          {
            key: 'backup_retention_days',
            value: config.retentionDays.toString(),
            category: 'backup',
            description: 'Backup retention period in days',
            data_type: 'number',
          },
          {
            key: 'backup_included_tables',
            value: JSON.stringify(config.includedTables),
            category: 'backup',
            description: 'Tables to include in automatic backups',
            data_type: 'json',
          },
        ], { onConflict: 'key' });

      if (settingsError) {
        throw new Error(`Failed to update backup settings: ${settingsError.message}`);
      }

      // Log configuration change
      await this.logBackupActivity('backup_config_updated', 'system', {
        config,
      });

      return { success: true };
    } catch (error) {
      console.error('Backup configuration error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to configure automatic backups' 
      };
    }
  }

  // Get backup configuration
  async getBackupConfiguration(): Promise<{
    enabled: boolean;
    frequency: string;
    time: string;
    retentionDays: number;
    includedTables: string[];
  }> {
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', [
          'backup_enabled',
          'backup_frequency',
          'backup_time',
          'backup_retention_days',
          'backup_included_tables',
        ]);

      const settings = data?.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>) || {};

      return {
        enabled: settings.backup_enabled || false,
        frequency: settings.backup_frequency ? JSON.parse(settings.backup_frequency) : 'daily',
        time: settings.backup_time ? JSON.parse(settings.backup_time) : '02:00',
        retentionDays: settings.backup_retention_days || 30,
        includedTables: settings.backup_included_tables ? 
          JSON.parse(settings.backup_included_tables) : 
          this.BACKUP_TABLES,
      };
    } catch (error) {
      console.error('Error fetching backup configuration:', error);
      // Return defaults
      return {
        enabled: false,
        frequency: 'daily',
        time: '02:00',
        retentionDays: 30,
        includedTables: this.BACKUP_TABLES,
      };
    }
  }

  // Test backup system
  async testBackupSystem(): Promise<{ success: boolean; results: any; error?: string }> {
    try {
      const results = {
        storageConnection: false,
        databaseAccess: false,
        encryptionCapability: false,
        compressionCapability: false,
      };

      // Test storage connection
      try {
        const { error: storageError } = await supabase.functions.invoke('test-backup-storage');
        results.storageConnection = !storageError;
      } catch (e) {
        console.warn('Storage test failed:', e);
      }

      // Test database access
      try {
        const { data } = await supabase.from('organizations').select('count').limit(1);
        results.databaseAccess = !!data;
      } catch (e) {
        console.warn('Database test failed:', e);
      }

      // Test encryption capability
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode('test');
        const key = await crypto.subtle.generateKey(
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        );
        await crypto.subtle.encrypt({ name: 'AES-GCM', iv: new Uint8Array(12) }, key, data);
        results.encryptionCapability = true;
      } catch (e) {
        console.warn('Encryption test failed:', e);
      }

      // Test compression capability (browser limitation - would work in Edge Function)
      results.compressionCapability = typeof CompressionStream !== 'undefined';

      return { success: true, results };
    } catch (error) {
      console.error('Backup system test error:', error);
      return { 
        success: false, 
        results: {},
        error: error instanceof Error ? error.message : 'Backup system test failed' 
      };
    }
  }

  // Log backup activity
  private async logBackupActivity(action: string, resourceId: string, details?: any) {
    try {
      await supabase.from('enhanced_audit_logs').insert({
        action,
        resource_type: 'backup',
        resource_id: resourceId,
        actor_type: 'platform_admin',
        details: {
          ...details,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to log backup activity:', error);
    }
  }
}

export const backupService = new BackupService();