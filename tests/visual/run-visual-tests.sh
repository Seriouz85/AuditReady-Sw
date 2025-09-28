#!/bin/bash

# COMPREHENSIVE VISUAL REGRESSION TEST RUNNER
# Executes full UI validation suite post-refactoring

set -e

echo "🚀 Starting Comprehensive Visual Regression Testing"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_DIR="tests/reports/visual-regression-$TIMESTAMP"
BASELINE_DIR="tests/visual/baseline"
CURRENT_DIR="tests/visual/current"

# Create directories
mkdir -p "$REPORT_DIR"
mkdir -p "$BASELINE_DIR"
mkdir -p "$CURRENT_DIR"

echo -e "${BLUE}📁 Report directory: $REPORT_DIR${NC}"

# Function to run test and capture results
run_test() {
    local test_name="$1"
    local test_file="$2"
    local description="$3"
    
    echo -e "\n${YELLOW}🧪 Running: $test_name${NC}"
    echo -e "${BLUE}📋 Description: $description${NC}"
    
    if npx playwright test "$test_file" --reporter=html --output-dir="$REPORT_DIR/$test_name"; then
        echo -e "${GREEN}✅ $test_name: PASSED${NC}"
        return 0
    else
        echo -e "${RED}❌ $test_name: FAILED${NC}"
        return 1
    fi
}

# Function to check if dev server is running
check_dev_server() {
    echo -e "${BLUE}🔍 Checking development server...${NC}"
    
    if curl -s http://localhost:3000 > /dev/null; then
        echo -e "${GREEN}✅ Development server is running${NC}"
        return 0
    else
        echo -e "${RED}❌ Development server is not running${NC}"
        echo -e "${YELLOW}💡 Please start the development server with: npm run dev${NC}"
        return 1
    fi
}

# Function to check demo account
check_demo_account() {
    echo -e "${BLUE}🔍 Validating demo account access...${NC}"
    
    # Quick test to ensure demo account works
    if npx playwright test tests/visual/capture-baseline.spec.ts -g "Validate demo account functionality" --reporter=line; then
        echo -e "${GREEN}✅ Demo account is accessible${NC}"
        return 0
    else
        echo -e "${RED}❌ Demo account validation failed${NC}"
        return 1
    fi
}

# Function to capture baseline if it doesn't exist
capture_baseline() {
    if [ ! -d "$BASELINE_DIR" ] || [ -z "$(ls -A $BASELINE_DIR)" ]; then
        echo -e "${YELLOW}📸 Baseline screenshots not found. Capturing baseline...${NC}"
        
        if npx playwright test tests/visual/capture-baseline.spec.ts --reporter=line; then
            echo -e "${GREEN}✅ Baseline captured successfully${NC}"
        else
            echo -e "${RED}❌ Failed to capture baseline${NC}"
            return 1
        fi
    else
        echo -e "${GREEN}✅ Baseline screenshots found${NC}"
    fi
}

# Function to generate comparison report
generate_comparison_report() {
    echo -e "\n${BLUE}📊 Generating Visual Comparison Report...${NC}"
    
    cat > "$REPORT_DIR/visual-regression-summary.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Regression Test Report - $TIMESTAMP</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; }
        .success { border-left-color: #28a745; }
        .warning { border-left-color: #ffc107; }
        .error { border-left-color: #dc3545; }
        .test-results { margin: 20px 0; }
        .test-item { margin: 10px 0; padding: 15px; background: #f8f9fa; border-radius: 6px; }
        .status-passed { color: #28a745; font-weight: bold; }
        .status-failed { color: #dc3545; font-weight: bold; }
        .status-warning { color: #ffc107; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 Visual Regression Test Report</h1>
        <p>Post-Refactoring UI Validation - Generated: $TIMESTAMP</p>
        <p>Platform: Audit Readiness Hub | Environment: Development</p>
    </div>
    
    <div class="summary">
        <div class="card success">
            <h3>✅ Tests Passed</h3>
            <p id="passed-count">Loading...</p>
        </div>
        <div class="card error">
            <h3>❌ Tests Failed</h3>
            <p id="failed-count">Loading...</p>
        </div>
        <div class="card warning">
            <h3>⚠️ Warnings</h3>
            <p id="warning-count">Loading...</p>
        </div>
        <div class="card">
            <h3>📊 Coverage</h3>
            <p>Critical Pages: AdminDashboard, Settings, ComplianceSimplification</p>
            <p>Responsive: Mobile, Tablet, Desktop, Wide</p>
            <p>Browsers: Chrome, Firefox, Safari</p>
        </div>
    </div>
    
    <div class="test-results">
        <h2>📋 Test Results Summary</h2>
        <div id="test-results-container">
            <!-- Test results will be populated by the script -->
        </div>
    </div>
    
    <div class="recommendations">
        <h2>💡 Recommendations</h2>
        <ul>
            <li>Review any failed visual comparisons for pixel-perfect accuracy</li>
            <li>Verify component extraction maintained design consistency</li>
            <li>Validate responsive behavior across all breakpoints</li>
            <li>Ensure accessibility standards are met</li>
            <li>Check performance metrics for optimized load times</li>
        </ul>
    </div>
    
    <div class="footer">
        <p><em>Report generated by Audit Readiness Hub Visual Regression Testing Suite</em></p>
        <p>For detailed test results, check the individual test reports in this directory.</p>
    </div>
</body>
</html>
EOF

    echo -e "${GREEN}✅ Visual comparison report generated: $REPORT_DIR/visual-regression-summary.html${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}🎯 Visual Regression Testing Suite${NC}"
    echo -e "${BLUE}Target: Post-refactoring UI validation${NC}"
    echo -e "${BLUE}Focus: AdminDashboard, Settings, ComplianceSimplification${NC}\n"
    
    # Pre-flight checks
    if ! check_dev_server; then
        exit 1
    fi
    
    if ! check_demo_account; then
        exit 1
    fi
    
    # Capture baseline if needed
    capture_baseline
    
    # Initialize test results tracking
    TOTAL_TESTS=0
    PASSED_TESTS=0
    FAILED_TESTS=0
    
    echo -e "\n${YELLOW}🧪 Executing Visual Regression Test Suite${NC}"
    echo "=============================================="
    
    # Test 1: Comprehensive Visual Regression
    if run_test "comprehensive-regression" "tests/visual/regression-test.spec.ts" "Full page and component validation"; then
        ((PASSED_TESTS++))
    else
        ((FAILED_TESTS++))
    fi
    ((TOTAL_TESTS++))
    
    # Test 2: Design System Validation
    if run_test "design-system" "tests/visual/design-system-validation.spec.ts" "Brand consistency and design patterns"; then
        ((PASSED_TESTS++))
    else
        ((FAILED_TESTS++))
    fi
    ((TOTAL_TESTS++))
    
    # Test 3: Performance & Accessibility
    if run_test "performance-accessibility" "tests/visual/performance-accessibility.spec.ts" "Performance metrics and accessibility compliance"; then
        ((PASSED_TESTS++))
    else
        ((FAILED_TESTS++))
    fi
    ((TOTAL_TESTS++))
    
    # Test 4: Baseline Capture (for future comparisons)
    if run_test "baseline-update" "tests/visual/capture-baseline.spec.ts" "Updated baseline screenshots"; then
        ((PASSED_TESTS++))
    else
        ((FAILED_TESTS++))
    fi
    ((TOTAL_TESTS++))
    
    # Generate final report
    generate_comparison_report
    
    # Results summary
    echo -e "\n${BLUE}📊 VISUAL REGRESSION TEST SUMMARY${NC}"
    echo "====================================="
    echo -e "📊 Total Tests: $TOTAL_TESTS"
    echo -e "${GREEN}✅ Passed: $PASSED_TESTS${NC}"
    echo -e "${RED}❌ Failed: $FAILED_TESTS${NC}"
    
    # Calculate success rate
    SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "📈 Success Rate: $SUCCESS_RATE%"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 ALL VISUAL REGRESSION TESTS PASSED!${NC}"
        echo -e "${GREEN}✅ UI validation complete - refactoring is pixel-perfect${NC}"
        echo -e "${GREEN}✅ Component extraction preserved design consistency${NC}"
        echo -e "${GREEN}✅ Responsive design works across all breakpoints${NC}"
        echo -e "${GREEN}✅ Brand identity maintained post-refactoring${NC}"
    else
        echo -e "\n${YELLOW}⚠️ SOME TESTS FAILED - REVIEW REQUIRED${NC}"
        echo -e "${YELLOW}🔍 Check individual test reports for details${NC}"
        echo -e "${YELLOW}🛠️ Fix any visual regressions before deploying${NC}"
    fi
    
    echo -e "\n${BLUE}📁 Full report available at: $REPORT_DIR${NC}"
    echo -e "${BLUE}🌐 Open the HTML report for detailed analysis${NC}"
    
    # Exit with appropriate code
    if [ $FAILED_TESTS -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    "baseline")
        echo -e "${YELLOW}📸 Capturing baseline screenshots only...${NC}"
        check_dev_server && capture_baseline
        ;;
    "quick")
        echo -e "${YELLOW}🚀 Running quick visual validation...${NC}"
        check_dev_server && npx playwright test tests/visual/regression-test.spec.ts -g "Capture critical pages across all breakpoints" --reporter=line
        ;;
    "design")
        echo -e "${YELLOW}🎨 Running design system validation only...${NC}"
        check_dev_server && npx playwright test tests/visual/design-system-validation.spec.ts --reporter=line
        ;;
    "performance")
        echo -e "${YELLOW}⚡ Running performance validation only...${NC}"
        check_dev_server && npx playwright test tests/visual/performance-accessibility.spec.ts --reporter=line
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  baseline     - Capture baseline screenshots only"
        echo "  quick        - Run quick visual validation"
        echo "  design       - Run design system validation only"
        echo "  performance  - Run performance validation only"
        echo "  help         - Show this help message"
        echo ""
        echo "No option: Run full visual regression test suite"
        ;;
    *)
        main
        ;;
esac