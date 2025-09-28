#!/bin/bash

# =============================================================================
# COMPREHENSIVE SECURITY AUDIT EXECUTION SCRIPT
# =============================================================================
# This script runs all security audits and generates reports
# 
# Usage: ./run-security-audit.sh [--full|--quick|--report-only]
#
# Options:
#   --full        Run complete security audit with all tests
#   --quick       Run quick security assessment only
#   --report-only Generate reports from existing data
#
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is required but not installed"
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is required but not installed"
        exit 1
    fi
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Run this script from the project root."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to run dependency audit
run_dependency_audit() {
    print_status "Running dependency vulnerability audit..."
    
    # Run npm audit and capture results
    if npm audit --audit-level=moderate > npm-audit-results.txt 2>&1; then
        print_success "No moderate or higher vulnerabilities found in runtime dependencies"
    else
        print_warning "Vulnerabilities found in dependencies (see npm-audit-results.txt)"
        echo "Vulnerability details:"
        cat npm-audit-results.txt | grep -E "(found|vulnerabilities)" || true
    fi
}

# Function to run OWASP security assessment
run_owasp_assessment() {
    print_status "Running OWASP Top 10 security assessment..."
    
    if [ -f "security-audit-runner.cjs" ]; then
        node security-audit-runner.cjs
        print_success "OWASP assessment completed"
    else
        print_error "security-audit-runner.cjs not found"
        return 1
    fi
}

# Function to run security implementation tests
run_implementation_tests() {
    print_status "Running security implementation verification..."
    
    if [ -f "security-implementation-test.cjs" ]; then
        node security-implementation-test.cjs
        print_success "Security implementation tests completed"
    else
        print_error "security-implementation-test.cjs not found"
        return 1
    fi
}

# Function to run quick security check
run_quick_check() {
    print_status "Running quick security check..."
    
    echo "=== Quick Security Status ==="
    
    # Check critical security files
    local critical_files=(
        "src/lib/security/index.ts"
        "src/lib/security/csp.ts"
        "src/lib/security/SecurityService.ts"
        "src/contexts/AuthContext.tsx"
        ".gitignore"
        ".env.example"
    )
    
    for file in "${critical_files[@]}"; do
        if [ -f "$file" ]; then
            echo "✅ $file - Present"
        else
            echo "❌ $file - Missing"
        fi
    done
    
    # Check npm audit quickly
    print_status "Quick dependency check..."
    npm audit --audit-level=high --parseable | wc -l | {
        read count
        if [ "$count" -eq 0 ]; then
            print_success "No high-severity vulnerabilities in dependencies"
        else
            print_warning "$count high-severity vulnerabilities found"
        fi
    }
    
    print_success "Quick security check completed"
}

# Function to generate security reports
generate_reports() {
    print_status "Generating comprehensive security reports..."
    
    # Create reports directory if it doesn't exist
    mkdir -p security-reports
    
    # Move generated reports to reports directory
    if [ -f "SECURITY_AUDIT_REPORT.md" ]; then
        cp SECURITY_AUDIT_REPORT.md security-reports/
        print_success "OWASP audit report generated"
    fi
    
    if [ -f "COMPREHENSIVE_SECURITY_AUDIT_REPORT.md" ]; then
        cp COMPREHENSIVE_SECURITY_AUDIT_REPORT.md security-reports/
        print_success "Comprehensive audit report generated"
    fi
    
    if [ -f "OWASP_COMPLIANCE_MATRIX.json" ]; then
        cp OWASP_COMPLIANCE_MATRIX.json security-reports/
        print_success "OWASP compliance matrix generated"
    fi
    
    if [ -f "security-audit-report.json" ]; then
        cp security-audit-report.json security-reports/
        print_success "Security audit data exported"
    fi
    
    if [ -f "security-implementation-test-results.json" ]; then
        cp security-implementation-test-results.json security-reports/
        print_success "Implementation test results exported"
    fi
    
    if [ -f "npm-audit-results.txt" ]; then
        cp npm-audit-results.txt security-reports/
        print_success "Dependency audit results exported"
    fi
    
    # Generate summary report
    cat > security-reports/SECURITY_AUDIT_SUMMARY.md << EOF
# Security Audit Summary

**Generated:** $(date)
**Project:** Audit Readiness Hub
**Version:** $(grep '"version"' package.json | cut -d'"' -f4)

## Quick Status

$(if [ -f "security-audit-report.json" ]; then
    echo "- **Overall OWASP Score:** $(grep '"overallScore"' security-audit-report.json | cut -d':' -f2 | tr -d ' ,')"
fi)

$(if [ -f "security-implementation-test-results.json" ]; then
    echo "- **Implementation Score:** $(grep '"overallScore"' security-implementation-test-results.json | cut -d':' -f2 | tr -d ' ,')"
fi)

- **Dependency Audit:** $(if npm audit --audit-level=high --dry-run >/dev/null 2>&1; then echo "✅ No high-risk vulnerabilities"; else echo "⚠️ Vulnerabilities detected"; fi)

## Report Files

- \`COMPREHENSIVE_SECURITY_AUDIT_REPORT.md\` - Complete security assessment
- \`OWASP_COMPLIANCE_MATRIX.json\` - Machine-readable compliance data
- \`security-audit-report.json\` - OWASP audit results
- \`security-implementation-test-results.json\` - Implementation test results
- \`npm-audit-results.txt\` - Dependency vulnerability details

## Next Steps

1. Review comprehensive security audit report
2. Address any identified security issues
3. Schedule regular security audits (monthly recommended)
4. Monitor security metrics continuously

---
*Generated by Audit Readiness Hub Security Scanner*
EOF

    print_success "Security reports generated in ./security-reports/"
}

# Function to display results summary
display_summary() {
    print_status "Security Audit Results Summary"
    echo "======================================"
    
    if [ -f "security-audit-report.json" ]; then
        local owasp_score=$(grep '"overallScore"' security-audit-report.json | cut -d':' -f2 | tr -d ' ,')
        local owasp_status=$(grep '"status"' security-audit-report.json | cut -d'"' -f4)
        echo "OWASP Compliance: $owasp_score% ($owasp_status)"
    fi
    
    if [ -f "security-implementation-test-results.json" ]; then
        local impl_score=$(grep '"overallScore"' security-implementation-test-results.json | cut -d':' -f2 | tr -d ' ,')
        local critical_failures=$(grep '"criticalFailures"' security-implementation-test-results.json | cut -d':' -f2 | tr -d ' ,')
        echo "Implementation Score: $impl_score%"
        echo "Critical Failures: $critical_failures"
    fi
    
    # Check if production ready
    if [ -f "security-audit-report.json" ] && [ -f "security-implementation-test-results.json" ]; then
        local owasp_score=$(grep '"overallScore"' security-audit-report.json | cut -d':' -f2 | tr -d ' ,')
        local critical_failures=$(grep '"criticalFailures"' security-implementation-test-results.json | cut -d':' -f2 | tr -d ' ,')
        
        if [ "$owasp_score" -ge 85 ] && [ "$critical_failures" -eq 0 ]; then
            print_success "🚀 APPLICATION IS PRODUCTION READY"
        else
            print_warning "⚠️ Address security issues before production deployment"
        fi
    fi
    
    echo "======================================"
    echo "Reports available in: ./security-reports/"
}

# Main execution function
main() {
    local mode="${1:-full}"
    
    echo "🔒 AUDIT READINESS HUB - SECURITY AUDIT"
    echo "========================================"
    echo
    
    check_prerequisites
    
    case "$mode" in
        "--quick")
            print_status "Running quick security assessment..."
            run_quick_check
            ;;
        "--report-only")
            print_status "Generating reports only..."
            generate_reports
            ;;
        "--full"|*)
            print_status "Running comprehensive security audit..."
            
            # Run all security audits
            run_dependency_audit
            run_owasp_assessment
            run_implementation_tests
            
            # Generate reports
            generate_reports
            
            # Display summary
            display_summary
            ;;
    esac
    
    print_success "Security audit completed successfully!"
    echo
    echo "📋 To view results:"
    echo "   • Complete report: ./security-reports/COMPREHENSIVE_SECURITY_AUDIT_REPORT.md"
    echo "   • Quick summary: ./security-reports/SECURITY_AUDIT_SUMMARY.md"
    echo "   • All reports: ./security-reports/"
    echo
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi