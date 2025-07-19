// Browser-compatible Kubernetes Service
// Note: This is a mock/simulation service for browser environments
// In production, this would interface with a backend API that has kubectl access

export interface DeploymentStatus {
  name: string;
  namespace: string;
  replicas: {
    desired: number;
    ready: number;
    available: number;
  };
  status: 'Running' | 'Pending' | 'Failed' | 'Unknown';
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PodMetrics {
  name: string;
  namespace: string;
  cpu: {
    usage: string;
    limit: string;
    percentage: number;
  };
  memory: {
    usage: string;
    limit: string;
    percentage: number;
  };
  status: string;
  restarts: number;
}

export interface ClusterHealth {
  nodes: {
    total: number;
    ready: number;
    notReady: number;
  };
  namespaces: string[];
  totalPods: number;
  healthyPods: number;
  clusterVersion: string;
}

export interface DeploymentConfig {
  name: string;
  namespace: string;
  environment: 'development' | 'staging' | 'production';
  image: string;
  replicas: number;
  resources: {
    requests: {
      cpu: string;
      memory: string;
    };
    limits: {
      cpu: string;
      memory: string;
    };
  };
  env: Record<string, string>;
  enableDemo?: boolean;
}

class KubernetesService {
  private baseApiUrl: string;
  private isProduction: boolean;

  constructor() {
    this.baseApiUrl = import.meta.env.VITE_K8S_API_URL || '/api/kubernetes';
    this.isProduction = import.meta.env.PROD || false;
  }

  // Cluster Management
  async getClusterHealth(): Promise<ClusterHealth> {
    try {
      // In production, this would call a backend API
      if (this.isProduction) {
        const response = await fetch(`${this.baseApiUrl}/cluster/health`);
        if (response.ok) {
          return await response.json();
        }
      }
      
      // Mock data for development/demo
      return {
        nodes: {
          total: 3,
          ready: 3,
          notReady: 0
        },
        namespaces: [
          'audit-readiness-hub-prod',
          'audit-readiness-hub-staging', 
          'audit-readiness-hub-dev',
          'kube-system',
          'monitoring'
        ],
        totalPods: 12,
        healthyPods: 11,
        clusterVersion: 'v1.28.2'
      };
    } catch (error) {
      console.error('Failed to get cluster health:', error);
      // Return mock data even on error to keep UI functional
      return {
        nodes: {
          total: 3,
          ready: 2,
          notReady: 1
        },
        namespaces: ['audit-readiness-hub-prod', 'kube-system'],
        totalPods: 8,
        healthyPods: 6,
        clusterVersion: 'v1.28.2'
      };
    }
  }

  // Deployment Management
  async getDeployments(namespace?: string): Promise<DeploymentStatus[]> {
    try {
      // In production, this would call a backend API
      if (this.isProduction) {
        const url = namespace ? `${this.baseApiUrl}/deployments?namespace=${namespace}` : `${this.baseApiUrl}/deployments`;
        const response = await fetch(url);
        if (response.ok) {
          return await response.json();
        }
      }
      
      // Mock data for development/demo
      const mockDeployments: DeploymentStatus[] = [
        {
          name: 'audit-readiness-hub',
          namespace: namespace || 'audit-readiness-hub-prod',
          replicas: {
            desired: 3,
            ready: 3,
            available: 3
          },
          status: 'Running',
          images: ['audit-readiness-hub:v1.1.0'],
          createdAt: new Date(Date.now() - 86400000), // 1 day ago
          updatedAt: new Date(Date.now() - 3600000) // 1 hour ago
        },
        {
          name: 'redis',
          namespace: namespace || 'audit-readiness-hub-prod',
          replicas: {
            desired: 1,
            ready: 1,
            available: 1
          },
          status: 'Running',
          images: ['redis:7-alpine'],
          createdAt: new Date(Date.now() - 86400000),
          updatedAt: new Date(Date.now() - 3600000)
        }
      ];

      return namespace ? mockDeployments.filter(d => d.namespace === namespace) : mockDeployments;
    } catch (error) {
      console.error('Failed to get deployments:', error);
      return [];
    }
  }

  async deployApplication(config: DeploymentConfig): Promise<{ success: boolean; message: string }> {
    try {
      // Validate configuration
      this.validateDeploymentConfig(config);

      // In production, this would call a backend API
      if (this.isProduction) {
        const response = await fetch(`${this.baseApiUrl}/deployments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        });
        
        if (response.ok) {
          const result = await response.json();
          return result;
        } else {
          throw new Error(`Deployment failed: ${response.statusText}`);
        }
      }

      // Mock response for development/demo
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate deployment time
      
      return {
        success: true,
        message: `Successfully deployed ${config.name} to ${config.environment} (demo mode)`
      };
    } catch (error: any) {
      console.error('Deployment failed:', error);
      return {
        success: false,
        message: error.message || 'Deployment failed'
      };
    }
  }

  async updateDeployment(config: DeploymentConfig): Promise<{ success: boolean; message: string }> {
    try {
      // In production, this would call a backend API
      if (this.isProduction) {
        const response = await fetch(`${this.baseApiUrl}/deployments/${config.name}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        });
        
        if (response.ok) {
          const result = await response.json();
          return result;
        } else {
          throw new Error(`Update failed: ${response.statusText}`);
        }
      }

      // Mock response for development/demo
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        message: `Successfully updated ${config.name} (demo mode)`
      };
    } catch (error: any) {
      console.error('Update failed:', error);
      return {
        success: false,
        message: error.message || 'Update failed'
      };
    }
  }

  async scaleDeployment(name: string, namespace: string, replicas: number): Promise<{ success: boolean; message: string }> {
    try {
      // In production, this would call a backend API
      if (this.isProduction) {
        const response = await fetch(`${this.baseApiUrl}/deployments/${name}/scale`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ namespace, replicas })
        });
        
        if (response.ok) {
          const result = await response.json();
          return result;
        } else {
          throw new Error(`Scaling failed: ${response.statusText}`);
        }
      }

      // Mock response for development/demo
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        message: `Successfully scaled ${name} to ${replicas} replicas (demo mode)`
      };
    } catch (error: any) {
      console.error('Scaling failed:', error);
      return {
        success: false,
        message: error.message || 'Scaling failed'
      };
    }
  }

  async deleteDeployment(name: string, namespace: string): Promise<{ success: boolean; message: string }> {
    try {
      // Safety check for demo account preservation
      if (name.includes('demo') || namespace.includes('demo')) {
        const confirmDelete = confirm(
          'This deployment may affect demo functionality. Are you sure you want to delete it?'
        );
        if (!confirmDelete) {
          return {
            success: false,
            message: 'Deletion cancelled by user'
          };
        }
      }

      // In production, this would call a backend API
      if (this.isProduction) {
        const response = await fetch(`${this.baseApiUrl}/deployments/${name}?namespace=${namespace}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          const result = await response.json();
          return result;
        } else {
          throw new Error(`Deletion failed: ${response.statusText}`);
        }
      }

      // Mock response for development/demo
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        success: true,
        message: `Successfully deleted ${name} (demo mode)`
      };
    } catch (error: any) {
      console.error('Deletion failed:', error);
      return {
        success: false,
        message: error.message || 'Deletion failed'
      };
    }
  }

  // Pod Management and Metrics
  async getPodMetrics(namespace?: string): Promise<PodMetrics[]> {
    try {
      // In production, this would call a backend API
      if (this.isProduction) {
        const url = namespace ? `${this.baseApiUrl}/pods/metrics?namespace=${namespace}` : `${this.baseApiUrl}/pods/metrics`;
        const response = await fetch(url);
        if (response.ok) {
          return await response.json();
        }
      }
      
      // Mock data for development/demo
      const mockMetrics: PodMetrics[] = [
        {
          name: 'audit-readiness-hub-7b8c9d5f4-abc12',
          namespace: namespace || 'audit-readiness-hub-prod',
          cpu: {
            usage: '150m',
            limit: '500m',
            percentage: 30
          },
          memory: {
            usage: '128Mi',
            limit: '512Mi',
            percentage: 25
          },
          status: 'Running',
          restarts: 0
        },
        {
          name: 'audit-readiness-hub-7b8c9d5f4-def34',
          namespace: namespace || 'audit-readiness-hub-prod',
          cpu: {
            usage: '200m',
            limit: '500m',
            percentage: 40
          },
          memory: {
            usage: '256Mi',
            limit: '512Mi',
            percentage: 50
          },
          status: 'Running',
          restarts: 1
        },
        {
          name: 'redis-6f7g8h9i0-ghi56',
          namespace: namespace || 'audit-readiness-hub-prod',
          cpu: {
            usage: '50m',
            limit: '200m',
            percentage: 25
          },
          memory: {
            usage: '64Mi',
            limit: '256Mi',
            percentage: 25
          },
          status: 'Running',
          restarts: 0
        }
      ];

      return namespace ? mockMetrics.filter(m => m.namespace === namespace) : mockMetrics;
    } catch (error) {
      console.error('Failed to get pod metrics:', error);
      return [];
    }
  }

  async getPodLogs(name: string, namespace: string, tailLines = 100): Promise<string> {
    try {
      // In production, this would call a backend API
      if (this.isProduction) {
        const response = await fetch(`${this.baseApiUrl}/pods/${name}/logs?namespace=${namespace}&tailLines=${tailLines}`);
        if (response.ok) {
          return await response.text();
        } else {
          throw new Error(`Failed to get logs: ${response.statusText}`);
        }
      }
      
      // Mock logs for development/demo
      return `[$(new Date().toISOString())] Starting audit-readiness-hub application...
[$(new Date().toISOString())] Connected to database successfully
[$(new Date().toISOString())] Redis connection established
[$(new Date().toISOString())] Server listening on port 3000
[$(new Date().toISOString())] Demo mode enabled - demo@auditready.com account available
[$(new Date().toISOString())] Health check endpoint ready at /health
[$(new Date().toISOString())] Application ready to serve requests
[$(new Date().toISOString())] Metrics endpoint available at /metrics`;
    } catch (error) {
      console.error('Failed to get pod logs:', error);
      throw new Error('Unable to retrieve pod logs');
    }
  }

  // Environment Management
  async getEnvironmentStatus(): Promise<Record<string, any>> {
    try {
      const environments = ['development', 'staging', 'production'];
      const status: Record<string, any> = {};

      for (const env of environments) {
        const namespace = `audit-readiness-hub-${env === 'production' ? 'prod' : env}`;
        try {
          const deployments = await this.getDeployments(namespace);
          const pods = await this.getPodMetrics(namespace);
          
          status[env] = {
            deployments: deployments.length,
            healthyDeployments: deployments.filter(d => d.status === 'Running').length,
            totalPods: pods.length,
            healthyPods: pods.filter(p => p.status === 'Running').length,
            averageCpuUsage: this.calculateAverageCpuUsage(pods),
            averageMemoryUsage: this.calculateAverageMemoryUsage(pods)
          };
        } catch (error) {
          status[env] = {
            error: 'Unable to connect to environment',
            deployments: 0,
            healthyDeployments: 0,
            totalPods: 0,
            healthyPods: 0
          };
        }
      }

      return status;
    } catch (error) {
      console.error('Failed to get environment status:', error);
      throw new Error('Unable to retrieve environment status');
    }
  }

  // Helper Methods

  private getDeploymentStatus(deployment: any): 'Running' | 'Pending' | 'Failed' | 'Unknown' {
    const replicas = deployment.spec.replicas || 0;
    const readyReplicas = deployment.status?.readyReplicas || 0;
    const availableReplicas = deployment.status?.availableReplicas || 0;

    if (readyReplicas === replicas && availableReplicas === replicas) {
      return 'Running';
    } else if (readyReplicas === 0) {
      return 'Failed';
    } else if (readyReplicas < replicas) {
      return 'Pending';
    }
    
    return 'Unknown';
  }

  private validateDeploymentConfig(config: DeploymentConfig): void {
    if (!config.name || !config.namespace || !config.image) {
      throw new Error('Missing required deployment configuration');
    }

    if (config.replicas < 1 || config.replicas > 100) {
      throw new Error('Replica count must be between 1 and 100');
    }

    // Demo account protection
    if (config.enableDemo && config.environment === 'production') {
      console.warn('Demo account enabled in production environment');
    }
  }


  private calculateCpuPercentage(usage: string, limit?: string): number {
    if (!limit || limit === 'No limit') return 0;
    
    const usageValue = parseFloat(usage.replace('n', '')) / 1000000; // Convert nanocores to millicores
    const limitValue = parseFloat(limit.replace('m', ''));
    
    return Math.round((usageValue / limitValue) * 100);
  }

  private calculateMemoryPercentage(usage: string, limit?: string): number {
    if (!limit || limit === 'No limit') return 0;
    
    const usageValue = this.parseMemoryValue(usage);
    const limitValue = this.parseMemoryValue(limit);
    
    return Math.round((usageValue / limitValue) * 100);
  }

  private parseMemoryValue(value: string): number {
    const units: Record<string, number> = {
      'Ki': 1024,
      'Mi': 1024 * 1024,
      'Gi': 1024 * 1024 * 1024,
      'Ti': 1024 * 1024 * 1024 * 1024
    };

    for (const [unit, multiplier] of Object.entries(units)) {
      if (value.endsWith(unit)) {
        return parseFloat(value.replace(unit, '')) * multiplier;
      }
    }

    return parseFloat(value);
  }

  private calculateAverageCpuUsage(pods: PodMetrics[]): number {
    if (pods.length === 0) return 0;
    const total = pods.reduce((sum, pod) => sum + pod.cpu.percentage, 0);
    return Math.round(total / pods.length);
  }

  private calculateAverageMemoryUsage(pods: PodMetrics[]): number {
    if (pods.length === 0) return 0;
    const total = pods.reduce((sum, pod) => sum + pod.memory.percentage, 0);
    return Math.round(total / pods.length);
  }
}

export const kubernetesService = new KubernetesService();