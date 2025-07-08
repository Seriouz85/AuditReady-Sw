# Input variables for AuditReady infrastructure

variable "environment" {
  description = "Environment name (production, staging, development)"
  type        = string
  default     = "production"
  
  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment must be one of: production, staging, development."
  }
}

variable "region" {
  description = "Primary AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "supabase_url" {
  description = "Supabase project URL"
  type        = string
  sensitive   = true
}

variable "supabase_anon_key" {
  description = "Supabase anonymous key"
  type        = string
  sensitive   = true
}

variable "supabase_service_key" {
  description = "Supabase service role key"
  type        = string
  sensitive   = true
}

variable "stripe_publishable_key" {
  description = "Stripe publishable key"
  type        = string
  sensitive   = true
}

variable "stripe_secret_key" {
  description = "Stripe secret key"
  type        = string
  sensitive   = true
}

variable "stripe_webhook_secret" {
  description = "Stripe webhook endpoint secret"
  type        = string
  sensitive   = true
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token with zone edit permissions"
  type        = string
  sensitive   = true
}

variable "vercel_api_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "sentry_auth_token" {
  description = "Sentry authentication token"
  type        = string
  sensitive   = true
}

variable "sentry_org" {
  description = "Sentry organization slug"
  type        = string
  default     = "auditready"
}

variable "api_gateway_ip" {
  description = "IP address for API Gateway (future use)"
  type        = string
  default     = "192.0.2.1"
}

variable "cdn_endpoint" {
  description = "CDN endpoint for static assets"
  type        = string
  default     = "cdn.auditready.com"
}

variable "redis_url" {
  description = "Redis connection URL for caching"
  type        = string
  sensitive   = true
  default     = ""
}

variable "monitoring_enabled" {
  description = "Enable monitoring and alerting features"
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "Number of days to retain database backups"
  type        = number
  default     = 30
  
  validation {
    condition     = var.backup_retention_days >= 1 && var.backup_retention_days <= 365
    error_message = "Backup retention must be between 1 and 365 days."
  }
}

variable "security_scanning_enabled" {
  description = "Enable security vulnerability scanning"
  type        = bool
  default     = true
}

variable "rate_limiting_enabled" {
  description = "Enable rate limiting on API endpoints"
  type        = bool
  default     = true
}

variable "ssl_certificate_type" {
  description = "Type of SSL certificate (free, advanced)"
  type        = string
  default     = "advanced"
  
  validation {
    condition     = contains(["free", "advanced"], var.ssl_certificate_type)
    error_message = "SSL certificate type must be either 'free' or 'advanced'."
  }
}

variable "waf_rules_enabled" {
  description = "Enable Web Application Firewall rules"
  type        = bool
  default     = true
}

variable "geo_blocking_enabled" {
  description = "Enable geographic blocking for admin endpoints"
  type        = bool
  default     = false
}

variable "allowed_countries" {
  description = "List of country codes allowed for admin access (when geo blocking is enabled)"
  type        = list(string)
  default     = ["US", "CA", "GB", "DE", "FR"]
}

variable "health_check_enabled" {
  description = "Enable health check monitoring"
  type        = bool
  default     = true
}

variable "health_check_path" {
  description = "Path for health check endpoint"
  type        = string
  default     = "/health"
}

variable "load_balancer_enabled" {
  description = "Enable load balancer for high availability"
  type        = bool
  default     = false
}

variable "auto_scaling_enabled" {
  description = "Enable auto-scaling for compute resources"
  type        = bool
  default     = false
}

variable "cache_ttl_default" {
  description = "Default cache TTL in seconds"
  type        = number
  default     = 3600
}

variable "cache_ttl_static_assets" {
  description = "Cache TTL for static assets in seconds"
  type        = number
  default     = 86400
}

variable "notification_email" {
  description = "Email address for infrastructure notifications"
  type        = string
  default     = "devops@auditready.com"
}

variable "slack_webhook_url" {
  description = "Slack webhook URL for notifications"
  type        = string
  sensitive   = true
  default     = ""
}

variable "database_backup_enabled" {
  description = "Enable automated database backups"
  type        = bool
  default     = true
}

variable "database_backup_schedule" {
  description = "Cron schedule for database backups"
  type        = string
  default     = "0 2 * * *"  # Daily at 2 AM
}

variable "log_retention_days" {
  description = "Number of days to retain application logs"
  type        = number
  default     = 90
}

variable "metrics_retention_days" {
  description = "Number of days to retain metrics data"
  type        = number
  default     = 30
}

variable "disaster_recovery_enabled" {
  description = "Enable disaster recovery procedures"
  type        = bool
  default     = true
}

variable "compliance_mode" {
  description = "Enable compliance-specific configurations (SOC2, GDPR, etc.)"
  type        = bool
  default     = true
}

variable "data_encryption_enabled" {
  description = "Enable data encryption at rest and in transit"
  type        = bool
  default     = true
}

variable "audit_logging_enabled" {
  description = "Enable comprehensive audit logging"
  type        = bool
  default     = true
}

variable "vulnerability_scanning_schedule" {
  description = "Schedule for vulnerability scanning"
  type        = string
  default     = "0 3 * * 1"  # Weekly on Monday at 3 AM
}

variable "cost_monitoring_enabled" {
  description = "Enable cost monitoring and alerts"
  type        = bool
  default     = true
}

variable "cost_alert_threshold" {
  description = "Monthly cost threshold for alerts (USD)"
  type        = number
  default     = 1000
}

variable "performance_monitoring_enabled" {
  description = "Enable performance monitoring and APM"
  type        = bool
  default     = true
}

variable "uptime_monitoring_enabled" {
  description = "Enable uptime monitoring from multiple regions"
  type        = bool
  default     = true
}

variable "api_rate_limit_per_minute" {
  description = "API rate limit per minute per IP"
  type        = number
  default     = 100
}

variable "api_burst_limit" {
  description = "API burst limit for short spikes"
  type        = number
  default     = 200
}

variable "cdn_cache_purge_enabled" {
  description = "Enable automatic CDN cache purging on deployments"
  type        = bool
  default     = true
}

variable "feature_flags_enabled" {
  description = "Enable feature flag management"
  type        = bool
  default     = true
}

variable "a_b_testing_enabled" {
  description = "Enable A/B testing infrastructure"
  type        = bool
  default     = false
}

variable "analytics_data_retention" {
  description = "Analytics data retention period in days"
  type        = number
  default     = 365
}

variable "gdpr_compliance_enabled" {
  description = "Enable GDPR compliance features"
  type        = bool
  default     = true
}

variable "data_residency_region" {
  description = "Data residency region for compliance"
  type        = string
  default     = "eu-west-1"
}

variable "backup_encryption_enabled" {
  description = "Enable encryption for backups"
  type        = bool
  default     = true
}

variable "network_security_enabled" {
  description = "Enable advanced network security features"
  type        = bool
  default     = true
}

variable "ddos_protection_enabled" {
  description = "Enable DDoS protection"
  type        = bool
  default     = true
}

variable "bot_protection_enabled" {
  description = "Enable bot protection and CAPTCHA"
  type        = bool
  default     = true
}

variable "content_filtering_enabled" {
  description = "Enable content filtering and malware scanning"
  type        = bool
  default     = true
}

# Local variables for computed values
locals {
  # Environment-specific configurations
  env_config = {
    production = {
      instance_type = "large"
      min_instances = 2
      max_instances = 10
      cache_size    = "large"
      monitoring_level = "detailed"
    }
    staging = {
      instance_type = "medium"
      min_instances = 1
      max_instances = 3
      cache_size    = "medium"
      monitoring_level = "basic"
    }
    development = {
      instance_type = "small"
      min_instances = 1
      max_instances = 2
      cache_size    = "small"
      monitoring_level = "basic"
    }
  }
  
  # Security configurations
  security_config = {
    production = {
      waf_mode = "on"
      ssl_mode = "strict"
      hsts_enabled = true
      security_headers = true
    }
    staging = {
      waf_mode = "simulate"
      ssl_mode = "flexible"
      hsts_enabled = false
      security_headers = true
    }
    development = {
      waf_mode = "off"
      ssl_mode = "flexible"
      hsts_enabled = false
      security_headers = false
    }
  }
  
  # Resource naming conventions
  resource_prefix = "${var.environment}-auditready"
  
  # Tags applied to all resources
  common_tags = {
    Environment = var.environment
    Project     = "auditready"
    ManagedBy   = "terraform"
    Owner       = "platform-team"
    CostCenter  = "engineering"
    Compliance  = var.compliance_mode ? "enabled" : "disabled"
  }
}