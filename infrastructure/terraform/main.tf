# AuditReady Infrastructure as Code
# This Terraform configuration sets up the production infrastructure

terraform {
  required_version = ">= 1.5"
  
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.15"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    sentry = {
      source  = "jianyuan/sentry"
      version = "~> 0.12"
    }
  }

  # Configure remote state backend
  backend "s3" {
    bucket = "auditready-terraform-state"
    key    = "production/terraform.tfstate"
    region = "us-east-1"
    
    # Enable state locking
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}

# Local variables
locals {
  project_name = "auditready"
  environment  = var.environment
  
  common_tags = {
    Project     = local.project_name
    Environment = local.environment
    ManagedBy   = "terraform"
    Owner       = "auditready-team"
  }
  
  # Domain configuration
  root_domain    = var.environment == "production" ? "auditready.com" : "${var.environment}.auditready.com"
  api_domain     = "api.${local.root_domain}"
  cdn_domain     = "cdn.${local.root_domain}"
  status_domain  = "status.${local.root_domain}"
}

# Data sources
data "vercel_project_directory" "auditready" {
  path = "../.."
}

# Vercel deployment configuration
resource "vercel_project" "auditready" {
  name             = "${local.project_name}-${local.environment}"
  framework        = "vite"
  build_command    = "npm run build"
  output_directory = "dist"
  install_command  = "npm ci"
  
  root_directory = "."
  
  environment = [
    {
      key    = "VITE_ENVIRONMENT"
      value  = local.environment
      target = ["production", "preview"]
    },
    {
      key    = "VITE_SUPABASE_URL"
      value  = var.supabase_url
      target = ["production", "preview"]
    },
    {
      key    = "VITE_SUPABASE_ANON_KEY"
      value  = var.supabase_anon_key
      target = ["production", "preview"]
    },
    {
      key    = "VITE_STRIPE_PUBLISHABLE_KEY"
      value  = var.stripe_publishable_key
      target = ["production", "preview"]
    },
    {
      key    = "VITE_SENTRY_DSN"
      value  = sentry_project.auditready.dsn_public
      target = ["production", "preview"]
    },
    {
      key    = "VITE_ANALYTICS_ENABLED"
      value  = "true"
      target = ["production"]
    },
    {
      key    = "VITE_CACHE_PREFIX"
      value  = "${local.project_name}:${local.environment}:"
      target = ["production", "preview"]
    }
  ]
  
  tags = local.common_tags
}

# Custom domain configuration
resource "vercel_domain" "main" {
  domain = local.root_domain
  
  depends_on = [vercel_project.auditready]
}

resource "vercel_project_domain" "main" {
  project_id = vercel_project.auditready.id
  domain     = vercel_domain.main.domain
}

# Cloudflare DNS and CDN configuration
resource "cloudflare_zone" "main" {
  count = var.environment == "production" ? 1 : 0
  zone  = "auditready.com"
  plan  = "pro"
  
  lifecycle {
    prevent_destroy = true
  }
}

# DNS Records
resource "cloudflare_record" "main" {
  count   = var.environment == "production" ? 1 : 0
  zone_id = cloudflare_zone.main[0].id
  name    = "@"
  value   = "cname.vercel-dns.com"
  type    = "CNAME"
  proxied = true
  
  comment = "Main website - Vercel deployment"
}

resource "cloudflare_record" "www" {
  count   = var.environment == "production" ? 1 : 0
  zone_id = cloudflare_zone.main[0].id
  name    = "www"
  value   = "cname.vercel-dns.com"
  type    = "CNAME"
  proxied = true
  
  comment = "WWW redirect to main site"
}

# API subdomain (for future API Gateway)
resource "cloudflare_record" "api" {
  count   = var.environment == "production" ? 1 : 0
  zone_id = cloudflare_zone.main[0].id
  name    = "api"
  value   = var.api_gateway_ip
  type    = "A"
  proxied = true
  
  comment = "API Gateway endpoint"
}

# CDN subdomain for static assets
resource "cloudflare_record" "cdn" {
  count   = var.environment == "production" ? 1 : 0
  zone_id = cloudflare_zone.main[0].id
  name    = "cdn"
  value   = var.cdn_endpoint
  type    = "CNAME"
  proxied = true
  
  comment = "CDN for static assets"
}

# Security and performance settings
resource "cloudflare_zone_settings_override" "main" {
  count   = var.environment == "production" ? 1 : 0
  zone_id = cloudflare_zone.main[0].id

  settings {
    # Security settings
    security_level         = "medium"
    challenge_ttl         = 1800
    browser_check         = "on"
    hotlink_protection    = "on"
    email_obfuscation     = "on"
    server_side_exclude   = "on"
    
    # Performance settings
    minify {
      css  = "on"
      js   = "on"
      html = "on"
    }
    
    brotli               = "on"
    early_hints         = "on"
    http3               = "on"
    zero_rtt            = "on"
    
    # Caching
    browser_cache_ttl   = 14400  # 4 hours
    cache_level         = "aggressive"
    
    # SSL/TLS
    ssl                 = "strict"
    tls_1_3            = "on"
    automatic_https_rewrites = "on"
    always_use_https   = "on"
    
    # Development mode (disable for production)
    development_mode   = "off"
  }
}

# WAF rules for security
resource "cloudflare_ruleset" "waf" {
  count   = var.environment == "production" ? 1 : 0
  zone_id = cloudflare_zone.main[0].id
  name    = "AuditReady WAF Rules"
  kind    = "zone"
  phase   = "http_request_firewall_custom"

  rules {
    action = "challenge"
    expression = "(http.request.uri.path contains \"/admin\" and ip.geoip.country ne \"US\")"
    description = "Challenge admin access from outside US"
    enabled = true
  }

  rules {
    action = "block"
    expression = "(http.request.method eq \"POST\" and http.request.uri.path contains \"/api/\" and rate(1m) > 100)"
    description = "Rate limit API POST requests"
    enabled = true
  }

  rules {
    action = "challenge"
    expression = "(cf.threat_score gt 20)"
    description = "Challenge high threat score requests"
    enabled = true
  }
}

# Page rules for caching and redirects
resource "cloudflare_page_rule" "cache_static_assets" {
  count    = var.environment == "production" ? 1 : 0
  zone_id  = cloudflare_zone.main[0].id
  target   = "auditready.com/assets/*"
  priority = 1

  actions {
    cache_level = "cache_everything"
    edge_cache_ttl = 86400  # 24 hours
    browser_cache_ttl = 86400
  }
}

resource "cloudflare_page_rule" "www_redirect" {
  count    = var.environment == "production" ? 1 : 0
  zone_id  = cloudflare_zone.main[0].id
  target   = "www.auditready.com/*"
  priority = 2

  actions {
    forwarding_url {
      url         = "https://auditready.com/$1"
      status_code = 301
    }
  }
}

# Sentry configuration for error monitoring
resource "sentry_organization" "main" {
  name = "auditready"
  slug = "auditready"
}

resource "sentry_team" "frontend" {
  organization = sentry_organization.main.slug
  name         = "Frontend Team"
  slug         = "frontend"
}

resource "sentry_project" "auditready" {
  organization = sentry_organization.main.slug
  team         = sentry_team.frontend.slug
  name         = "auditready-${local.environment}"
  slug         = "auditready-${local.environment}"
  platform     = "javascript-react"

  resolve_age    = 168  # 7 days
  default_rules  = true
  default_key    = true
  
  tags = local.common_tags
}

# Sentry release tracking
resource "sentry_project_symbol_source" "auditready" {
  organization = sentry_organization.main.slug
  project      = sentry_project.auditready.slug
  name         = "Source Maps"
  type         = "http"
  url          = "https://${local.root_domain}/assets/"
}

# Monitoring and alerting rules
resource "sentry_issue_alert" "high_error_rate" {
  organization = sentry_organization.main.slug
  project      = sentry_project.auditready.slug
  name         = "High Error Rate"

  conditions = [
    {
      id   = "sentry.rules.conditions.event_frequency.EventFrequencyCondition"
      name = "The issue is seen more than 100 times in 1 hour"
      value = 100
      interval = "1h"
    }
  ]

  actions = [
    {
      id   = "sentry.rules.actions.notify_event.NotifyEventAction"
      name = "Send a notification to all services"
    }
  ]

  action_match = "any"
  filter_match = "any"
  frequency    = 30
}

# SSL certificate for custom domains
resource "cloudflare_certificate_pack" "main" {
  count    = var.environment == "production" ? 1 : 0
  zone_id  = cloudflare_zone.main[0].id
  type     = "advanced"
  hosts    = [
    "auditready.com",
    "*.auditready.com"
  ]
  
  validation_method = "txt"
  validity_days     = 90
  certificate_authority = "digicert"
}

# Health check configuration
resource "cloudflare_healthcheck" "main" {
  count   = var.environment == "production" ? 1 : 0
  zone_id = cloudflare_zone.main[0].id
  name    = "AuditReady Main Site"
  address = "https://${local.root_domain}/health"
  
  check_regions = [
    "EEU",  # Eastern Europe
    "WEU",  # Western Europe
    "NAM",  # North America
    "SAS"   # South Asia
  ]
  
  consecutive_fails = 3
  consecutive_successes = 2
  timeout = 10
  interval = 60
  
  retries = 2
  suspended = false
  
  description = "Health check for main application"
}

# Load balancer for high availability (future use)
resource "cloudflare_load_balancer_pool" "main" {
  count   = var.environment == "production" ? 1 : 0
  name    = "auditready-main"
  
  origins {
    name    = "vercel-primary"
    address = "cname.vercel-dns.com"
    enabled = true
  }
  
  description = "Primary pool for AuditReady"
  enabled = true
  
  load_shedding {
    default_percent = 0
    default_policy  = "random"
    session_percent = 0
    session_policy  = "hash"
  }
}

# Output values for other systems
output "deployment_url" {
  description = "The deployment URL"
  value       = vercel_project.auditready.id
}

output "custom_domain" {
  description = "The custom domain"
  value       = local.root_domain
}

output "sentry_dsn" {
  description = "Sentry DSN for error reporting"
  value       = sentry_project.auditready.dsn_public
  sensitive   = true
}

output "cloudflare_zone_id" {
  description = "Cloudflare zone ID"
  value       = var.environment == "production" ? cloudflare_zone.main[0].id : null
}

output "infrastructure_endpoints" {
  description = "Infrastructure endpoints"
  value = {
    app_url     = "https://${local.root_domain}"
    api_url     = "https://${local.api_domain}"
    cdn_url     = "https://${local.cdn_domain}"
    status_url  = "https://${local.status_domain}"
  }
}