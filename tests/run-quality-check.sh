#!/bin/bash

# Audit Readiness Hub - Comprehensive Quality Checker
# This script runs the complete quality analysis suite

set -e

echo "🎯 Audit Readiness Hub - Quality Analysis Suite"
echo "=============================================="
echo

# Check if application is running
echo "📡 Checking if application is running on http://localhost:3000..."
if ! curl -s -f http://localhost:3000 > /dev/null; then
    echo "❌ Application is not running on http://localhost:3000"
    echo "   Please start the application with: npm run dev"
    exit 1
fi
echo "✅ Application is running"
echo

# Create necessary directories
echo "📁 Preparing test directories..."
mkdir -p tests/reports
mkdir -p tests/screenshots
echo "✅ Directories created"
echo

# Run quality tests
echo "🧪 Running Comprehensive Quality Analysis..."
echo

echo "1️⃣ Console Error Monitoring..."
npx playwright test console-monitor.spec.ts --project=chromium-quality

echo
echo "2️⃣ Platform Admin Flow Testing..."
npx playwright test admin-flows.spec.ts --project=chromium-quality

echo
echo "3️⃣ Full Quality Checker Suite..."
npx playwright test quality-checker.spec.ts --project=chromium-quality

echo
echo "4️⃣ Cross-Browser Compatibility Testing..."
npx playwright test quality-checker.spec.ts --project=firefox
npx playwright test quality-checker.spec.ts --project=webkit

echo
echo "5️⃣ Mobile Quality Testing..."
npx playwright test quality-checker.spec.ts --project="Mobile Chrome"

echo
echo "✅ Quality Analysis Complete!"
echo
echo "📊 Reports and Screenshots:"
echo "   📈 Test Reports: tests/reports/"
echo "   📸 Screenshots: tests/screenshots/"
echo "   🌐 HTML Report: tests/reports/playwright-report/"
echo
echo "🔍 Next Steps:"
echo "   1. Review error reports in tests/reports/"
echo "   2. Check screenshots for visual issues"
echo "   3. Address critical and high-priority errors"
echo "   4. Re-run tests after fixes"
echo
echo "📋 Known Issues to Address:"
echo "   - handleInviteUser function missing in OrganizationDetail"
echo "   - send-email Edge Function missing in Supabase"
echo "   - Audit logger table_name parameter issues"
echo

# Generate summary report
REPORT_DATE=$(date +%Y-%m-%d)
echo "📝 Quality analysis completed on $REPORT_DATE" > tests/reports/quality-summary.txt
echo "   Check tests/reports/quality-report-$REPORT_DATE.json for detailed findings" >> tests/reports/quality-summary.txt

echo "🎉 Quality analysis suite completed successfully!"