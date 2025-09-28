#!/usr/bin/env node

/**
 * Test Coverage Validator
 * Validates test coverage meets quality standards and generates reports
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const COVERAGE_THRESHOLDS = {
  global: {
    branches: 75,
    functions: 80,
    lines: 80,
    statements: 80
  },
  critical: {
    branches: 85,
    functions: 90,
    lines: 90,
    statements: 90
  }
};

const CRITICAL_FILES = [
  'src/services/compliance/',
  'src/services/auth/',
  'src/services/billing/',
  'src/components/error/',
  'src/lib/security/'
];

class TestCoverageValidator {
  constructor() {
    this.reportPath = './coverage/coverage-summary.json';
    this.htmlReportPath = './coverage/lcov-report/index.html';
    this.results = {
      passed: true,
      global: {},
      critical: {},
      violations: [],
      summary: {}
    };
  }

  async run() {
    console.log('🧪 Running Test Coverage Validation...\n');

    try {
      // Run tests with coverage
      await this.runTestsWithCoverage();
      
      // Analyze coverage data
      await this.analyzeCoverage();
      
      // Generate reports
      await this.generateReports();
      
      // Validate thresholds
      await this.validateThresholds();
      
      // Print results
      this.printResults();
      
      // Exit with appropriate code
      process.exit(this.results.passed ? 0 : 1);
      
    } catch (error) {
      console.error('❌ Coverage validation failed:', error.message);
      process.exit(1);
    }
  }

  async runTestsWithCoverage() {
    console.log('📊 Running tests with coverage collection...');
    
    try {
      execSync('npm run test:coverage', { 
        stdio: 'inherit',
        env: { ...process.env, CI: 'true' }
      });
      console.log('✅ Tests completed successfully\n');
    } catch (error) {
      throw new Error('Tests failed - cannot proceed with coverage validation');
    }
  }

  async analyzeCoverage() {
    console.log('📈 Analyzing coverage data...');
    
    if (!fs.existsSync(this.reportPath)) {
      throw new Error('Coverage report not found. Make sure tests ran successfully.');
    }

    const coverageData = JSON.parse(fs.readFileSync(this.reportPath, 'utf8'));
    
    // Analyze global coverage
    this.results.global = this.extractCoverageMetrics(coverageData.total);
    
    // Analyze critical file coverage
    this.results.critical = this.analyzeCriticalFiles(coverageData);
    
    // Generate summary
    this.results.summary = {
      totalFiles: Object.keys(coverageData).length - 1, // Exclude 'total'
      coveredFiles: Object.values(coverageData)
        .filter(file => file !== coverageData.total && file.lines.pct > 0).length,
      uncoveredFiles: Object.values(coverageData)
        .filter(file => file !== coverageData.total && file.lines.pct === 0).length
    };
    
    console.log('✅ Coverage data analyzed\n');
  }

  extractCoverageMetrics(coverageData) {
    return {
      branches: coverageData.branches.pct,
      functions: coverageData.functions.pct,
      lines: coverageData.lines.pct,
      statements: coverageData.statements.pct
    };
  }

  analyzeCriticalFiles(coverageData) {
    const criticalMetrics = {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
      fileCount: 0
    };

    let criticalFiles = 0;

    for (const [filePath, fileData] of Object.entries(coverageData)) {
      if (filePath === 'total') continue;

      const isCritical = CRITICAL_FILES.some(criticalPath => 
        filePath.includes(criticalPath)
      );

      if (isCritical) {
        criticalFiles++;
        criticalMetrics.branches += fileData.branches.pct || 0;
        criticalMetrics.functions += fileData.functions.pct || 0;
        criticalMetrics.lines += fileData.lines.pct || 0;
        criticalMetrics.statements += fileData.statements.pct || 0;
      }
    }

    if (criticalFiles > 0) {
      criticalMetrics.branches /= criticalFiles;
      criticalMetrics.functions /= criticalFiles;
      criticalMetrics.lines /= criticalFiles;
      criticalMetrics.statements /= criticalFiles;
    }

    criticalMetrics.fileCount = criticalFiles;
    return criticalMetrics;
  }

  async validateThresholds() {
    console.log('🎯 Validating coverage thresholds...');

    // Validate global thresholds
    this.validateMetrics('Global', this.results.global, COVERAGE_THRESHOLDS.global);
    
    // Validate critical file thresholds
    if (this.results.critical.fileCount > 0) {
      this.validateMetrics('Critical Files', this.results.critical, COVERAGE_THRESHOLDS.critical);
    }

    console.log('✅ Threshold validation completed\n');
  }

  validateMetrics(category, actual, thresholds) {
    for (const [metric, threshold] of Object.entries(thresholds)) {
      const actualValue = actual[metric];
      
      if (actualValue < threshold) {
        this.results.passed = false;
        this.results.violations.push({
          category,
          metric,
          actual: actualValue,
          threshold,
          difference: threshold - actualValue
        });
      }
    }
  }

  async generateReports() {
    console.log('📋 Generating coverage reports...');

    // Generate JSON report for CI/CD
    const reportData = {
      timestamp: new Date().toISOString(),
      passed: this.results.passed,
      global: this.results.global,
      critical: this.results.critical,
      violations: this.results.violations,
      summary: this.results.summary,
      thresholds: COVERAGE_THRESHOLDS
    };

    fs.writeFileSync('./coverage/coverage-validation.json', JSON.stringify(reportData, null, 2));

    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(reportData);
    fs.writeFileSync('./coverage/coverage-report.md', markdownReport);

    console.log('✅ Reports generated:\n');
    console.log('  📄 JSON: ./coverage/coverage-validation.json');
    console.log('  📝 Markdown: ./coverage/coverage-report.md');
    if (fs.existsSync(this.htmlReportPath)) {
      console.log('  🌐 HTML: ./coverage/lcov-report/index.html');
    }
    console.log();
  }

  generateMarkdownReport(data) {
    const { global, critical, violations, summary, thresholds } = data;
    
    let report = `# Test Coverage Report\n\n`;
    report += `Generated: ${new Date(data.timestamp).toLocaleString()}\n\n`;
    
    // Overall status
    report += `## Overall Status: ${data.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    
    // Summary
    report += `## Summary\n\n`;
    report += `- **Total Files**: ${summary.totalFiles}\n`;
    report += `- **Covered Files**: ${summary.coveredFiles}\n`;
    report += `- **Uncovered Files**: ${summary.uncoveredFiles}\n`;
    report += `- **Coverage Percentage**: ${((summary.coveredFiles / summary.totalFiles) * 100).toFixed(1)}%\n\n`;
    
    // Global coverage
    report += `## Global Coverage\n\n`;
    report += `| Metric | Actual | Threshold | Status |\n`;
    report += `|--------|--------|-----------|--------|\n`;
    
    for (const [metric, threshold] of Object.entries(thresholds.global)) {
      const actual = global[metric];
      const status = actual >= threshold ? '✅' : '❌';
      report += `| ${metric} | ${actual.toFixed(1)}% | ${threshold}% | ${status} |\n`;
    }
    report += `\n`;
    
    // Critical files coverage
    if (critical.fileCount > 0) {
      report += `## Critical Files Coverage\n\n`;
      report += `Analyzed ${critical.fileCount} critical files.\n\n`;
      report += `| Metric | Actual | Threshold | Status |\n`;
      report += `|--------|--------|-----------|--------|\n`;
      
      for (const [metric, threshold] of Object.entries(thresholds.critical)) {
        if (metric === 'fileCount') continue;
        const actual = critical[metric];
        const status = actual >= threshold ? '✅' : '❌';
        report += `| ${metric} | ${actual.toFixed(1)}% | ${threshold}% | ${status} |\n`;
      }
      report += `\n`;
    }
    
    // Violations
    if (violations.length > 0) {
      report += `## ⚠️ Coverage Violations\n\n`;
      
      for (const violation of violations) {
        report += `- **${violation.category}** - ${violation.metric}: `;
        report += `${violation.actual.toFixed(1)}% (threshold: ${violation.threshold}%, `;
        report += `deficit: ${violation.difference.toFixed(1)}%)\n`;
      }
      report += `\n`;
    }
    
    // Recommendations
    report += `## 📋 Recommendations\n\n`;
    
    if (violations.length > 0) {
      report += `### Immediate Actions Required\n\n`;
      
      violations.forEach((violation, index) => {
        report += `${index + 1}. **Improve ${violation.metric} coverage for ${violation.category}**\n`;
        report += `   - Current: ${violation.actual.toFixed(1)}%\n`;
        report += `   - Target: ${violation.threshold}%\n`;
        report += `   - Gap: ${violation.difference.toFixed(1)}%\n\n`;
      });
    } else {
      report += `✅ All coverage thresholds are currently met!\n\n`;
    }
    
    report += `### General Recommendations\n\n`;
    report += `- Add tests for uncovered files (${summary.uncoveredFiles} files)\n`;
    report += `- Focus on critical path testing\n`;
    report += `- Implement integration tests for complex workflows\n`;
    report += `- Add edge case and error handling tests\n`;
    report += `- Consider property-based testing for complex algorithms\n\n`;
    
    // Test types breakdown
    report += `## 🧪 Recommended Test Types\n\n`;
    report += `### Unit Tests (70%)\n`;
    report += `- Service layer functions\n`;
    report += `- Utility functions\n`;
    report += `- Component logic\n`;
    report += `- Error handling\n\n`;
    
    report += `### Integration Tests (20%)\n`;
    report += `- API interactions\n`;
    report += `- Database operations\n`;
    report += `- Component integration\n`;
    report += `- Workflow testing\n\n`;
    
    report += `### End-to-End Tests (10%)\n`;
    report += `- Critical user journeys\n`;
    report += `- Cross-browser compatibility\n`;
    report += `- Performance validation\n`;
    report += `- Accessibility compliance\n\n`;
    
    return report;
  }

  printResults() {
    console.log('📊 COVERAGE VALIDATION RESULTS\n');
    console.log('='.repeat(50));
    
    // Overall status
    const statusIcon = this.results.passed ? '✅' : '❌';
    const statusText = this.results.passed ? 'PASSED' : 'FAILED';
    console.log(`\n${statusIcon} Overall Status: ${statusText}\n`);
    
    // Global metrics
    console.log('🌍 Global Coverage:');
    const { global } = this.results;
    console.log(`  Branches:   ${global.branches.toFixed(1)}% (threshold: ${COVERAGE_THRESHOLDS.global.branches}%)`);
    console.log(`  Functions:  ${global.functions.toFixed(1)}% (threshold: ${COVERAGE_THRESHOLDS.global.functions}%)`);
    console.log(`  Lines:      ${global.lines.toFixed(1)}% (threshold: ${COVERAGE_THRESHOLDS.global.lines}%)`);
    console.log(`  Statements: ${global.statements.toFixed(1)}% (threshold: ${COVERAGE_THRESHOLDS.global.statements}%)\n`);
    
    // Critical files metrics
    if (this.results.critical.fileCount > 0) {
      console.log('🔥 Critical Files Coverage:');
      const { critical } = this.results;
      console.log(`  Files:      ${critical.fileCount}`);
      console.log(`  Branches:   ${critical.branches.toFixed(1)}% (threshold: ${COVERAGE_THRESHOLDS.critical.branches}%)`);
      console.log(`  Functions:  ${critical.functions.toFixed(1)}% (threshold: ${COVERAGE_THRESHOLDS.critical.functions}%)`);
      console.log(`  Lines:      ${critical.lines.toFixed(1)}% (threshold: ${COVERAGE_THRESHOLDS.critical.lines}%)`);
      console.log(`  Statements: ${critical.statements.toFixed(1)}% (threshold: ${COVERAGE_THRESHOLDS.critical.statements}%)\n`);
    }
    
    // Summary
    console.log('📈 Summary:');
    const { summary } = this.results;
    console.log(`  Total Files:    ${summary.totalFiles}`);
    console.log(`  Covered Files:  ${summary.coveredFiles}`);
    console.log(`  Uncovered Files: ${summary.uncoveredFiles}`);
    console.log(`  Coverage Rate:  ${((summary.coveredFiles / summary.totalFiles) * 100).toFixed(1)}%\n`);
    
    // Violations
    if (this.results.violations.length > 0) {
      console.log('⚠️  Coverage Violations:');
      this.results.violations.forEach(violation => {
        console.log(`  ${violation.category} - ${violation.metric}: ${violation.actual.toFixed(1)}% (need ${violation.threshold}%)`);
      });
      console.log();
    }
    
    // Next steps
    if (!this.results.passed) {
      console.log('🔧 Next Steps:');
      console.log('  1. Review coverage report: ./coverage/lcov-report/index.html');
      console.log('  2. Add tests for uncovered code');
      console.log('  3. Focus on critical files first');
      console.log('  4. Run tests again to validate improvements\n');
    } else {
      console.log('🎉 Excellent! All coverage thresholds are met.\n');
      console.log('💡 Consider:');
      console.log('  - Adding more edge case tests');
      console.log('  - Improving test quality and assertions');
      console.log('  - Adding performance and accessibility tests\n');
    }
    
    console.log('='.repeat(50));
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new TestCoverageValidator();
  validator.run().catch(console.error);
}

export { TestCoverageValidator, COVERAGE_THRESHOLDS };