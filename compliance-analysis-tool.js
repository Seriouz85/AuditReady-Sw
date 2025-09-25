/**
 * ComplianceSimplification Analysis Tool
 * 
 * This script analyzes the compliance simplification page and tests all functionality
 * to identify issues with unified requirements generation.
 */

const ANALYSIS_STEPS = {
  STEP_1: 'Navigate to compliance page',
  STEP_2: 'Test framework selection',
  STEP_3: 'Test unified requirements tab',
  STEP_4: 'Analyze content generation',
  STEP_5: 'Check console errors',
  STEP_6: 'Test guidance modal',
  STEP_7: 'Generate comprehensive report'
};

class ComplianceAnalyzer {
  constructor() {
    this.results = {};
    this.errors = [];
    this.warnings = [];
    this.debug = [];
  }

  async runFullAnalysis() {
    console.log('🔍 Starting Compliance Simplification Analysis...');
    
    try {
      await this.step1_NavigateToPage();
      await this.step2_TestFrameworkSelection();
      await this.step3_TestUnifiedRequirementsTab();
      await this.step4_AnalyzeContentGeneration();
      await this.step5_CheckConsoleErrors();
      await this.step6_TestGuidanceModal();
      await this.step7_GenerateReport();
    } catch (error) {
      this.errors.push(`Analysis failed: ${error.message}`);
    }
    
    return this.generateFinalReport();
  }

  async step1_NavigateToPage() {
    console.log('📍 Step 1: Navigating to compliance page...');
    
    // Check if we're on the right page
    const isCompliancePage = window.location.pathname.includes('compliance-simplification');
    
    if (!isCompliancePage) {
      this.warnings.push('Not on compliance simplification page');
      this.results.navigation = {
        status: 'WARNING',
        currentPath: window.location.pathname,
        expectedPath: '/compliance-simplification'
      };
    } else {
      this.results.navigation = {
        status: 'SUCCESS',
        currentPath: window.location.pathname
      };
    }
  }

  async step2_TestFrameworkSelection() {
    console.log('🎯 Step 2: Testing framework selection...');
    
    const frameworks = {
      'ISO 27001': null,
      'ISO 27002': null,
      'CIS Controls': null,
      'GDPR': null,
      'NIS2': null,
      'DORA': null
    };

    // Look for framework selection elements
    const frameworkElements = document.querySelectorAll('[data-framework]');
    const selectionButtons = document.querySelectorAll('button[role="switch"], input[type="checkbox"]');
    
    this.results.frameworkSelection = {
      status: frameworkElements.length > 0 ? 'SUCCESS' : 'FAILED',
      elementsFound: frameworkElements.length,
      selectionButtons: selectionButtons.length,
      availableFrameworks: Array.from(frameworkElements).map(el => el.dataset.framework || el.textContent.trim())
    };
    
    if (frameworkElements.length === 0) {
      this.errors.push('No framework selection elements found');
    }
  }

  async step3_TestUnifiedRequirementsTab() {
    console.log('⚡ Step 3: Testing Unified Requirements tab...');
    
    // Find and click unified requirements tab
    const unifiedTab = document.querySelector('[value="unified"], [data-value="unified"]');
    if (unifiedTab) {
      unifiedTab.click();
      
      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Analyze content
      const categories = this.analyzeUnifiedCategories();
      
      this.results.unifiedRequirements = {
        status: categories.length > 0 ? 'SUCCESS' : 'FAILED',
        tabFound: true,
        categoriesFound: categories.length,
        categories: categories
      };
    } else {
      this.errors.push('Unified Requirements tab not found');
      this.results.unifiedRequirements = {
        status: 'FAILED',
        tabFound: false,
        categoriesFound: 0,
        categories: []
      };
    }
  }

  analyzeUnifiedCategories() {
    const categories = [];
    
    // Look for category cards or sections
    const categoryElements = document.querySelectorAll('[id^="unified-"], .category-card, .unified-category');
    
    categoryElements.forEach((element, index) => {
      const categoryName = this.extractCategoryName(element);
      const content = this.analyzeContentInElement(element);
      
      categories.push({
        index: index + 1,
        name: categoryName,
        element: element.tagName,
        hasContent: content.hasContent,
        contentLength: content.contentLength,
        contentType: content.contentType,
        issues: content.issues,
        hasGuidanceButton: element.querySelector('button[data-guidance]') !== null,
        visible: element.offsetHeight > 0
      });
    });
    
    return categories;
  }

  extractCategoryName(element) {
    // Try multiple selectors to find category name
    const nameSelectors = ['h3', 'h4', '.category-title', '[data-category]'];
    
    for (const selector of nameSelectors) {
      const nameElement = element.querySelector(selector);
      if (nameElement) {
        return nameElement.textContent.trim();
      }
    }
    
    return element.id || 'Unknown Category';
  }

  analyzeContentInElement(element) {
    const content = {
      hasContent: false,
      contentLength: 0,
      contentType: 'NONE',
      issues: []
    };
    
    // Check for different types of content
    const textContent = element.textContent.trim();
    const requirements = element.querySelectorAll('ul li, ol li, .requirement-item');
    const errorMessages = element.querySelectorAll('.error, .warning, [class*="error"]');
    const loadingElements = element.querySelectorAll('.loading, .spinner, [class*="loading"]');
    
    content.contentLength = textContent.length;
    content.hasContent = textContent.length > 50; // Minimum meaningful content
    
    // Analyze content type
    if (errorMessages.length > 0) {
      content.contentType = 'ERROR';
      content.issues.push('Contains error messages');
    } else if (loadingElements.length > 0) {
      content.contentType = 'LOADING';
      content.issues.push('Still loading');
    } else if (requirements.length > 0) {
      content.contentType = 'REQUIREMENTS';
    } else if (textContent.includes('No unified requirements') || textContent.includes('No content')) {
      content.contentType = 'EMPTY';
      content.issues.push('Empty content message');
    } else if (textContent.length < 100) {
      content.contentType = 'MINIMAL';
      content.issues.push('Very short content (possibly fallback)');
    } else {
      content.contentType = 'CONTENT';
    }
    
    // Check for specific issue patterns
    if (textContent.includes('Error generating')) {
      content.issues.push('Generation error');
    }
    if (textContent.includes('Loading guidance')) {
      content.issues.push('Loading guidance');
    }
    if (textContent.length > 0 && textContent.length < 50) {
      content.issues.push('Very minimal content');
    }
    
    return content;
  }

  async step4_AnalyzeContentGeneration() {
    console.log('🔄 Step 4: Analyzing content generation...');
    
    // Look for generation buttons
    const generateButton = document.querySelector('button[data-generate], button:contains("Generate")');
    
    if (generateButton) {
      // Monitor console before clicking
      const consoleLogs = [];
      const originalLog = console.log;
      console.log = (...args) => {
        consoleLogs.push(args.join(' '));
        originalLog.apply(console, args);
      };
      
      try {
        generateButton.click();
        
        // Wait and monitor
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Restore console
        console.log = originalLog;
        
        this.results.contentGeneration = {
          status: 'TESTED',
          buttonFound: true,
          consoleLogs: consoleLogs.filter(log => 
            log.includes('GENERATE') || 
            log.includes('BRIDGE') || 
            log.includes('CONTENT') ||
            log.includes('ERROR')
          )
        };
      } catch (error) {
        console.log = originalLog;
        this.errors.push(`Generation test failed: ${error.message}`);
      }
    } else {
      this.results.contentGeneration = {
        status: 'NOT_FOUND',
        buttonFound: false
      };
    }
  }

  async step5_CheckConsoleErrors() {
    console.log('🔍 Step 5: Checking console errors...');
    
    // Capture current console state
    const consoleErrors = [];
    const consoleWarnings = [];
    
    // Override console temporarily to capture new errors
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      consoleErrors.push(args.join(' '));
      originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      consoleWarnings.push(args.join(' '));
      originalWarn.apply(console, args);
    };
    
    // Wait for any async operations
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Restore console
    console.error = originalError;
    console.warn = originalWarn;
    
    this.results.consoleErrors = {
      errors: consoleErrors,
      warnings: consoleWarnings,
      errorCount: consoleErrors.length,
      warningCount: consoleWarnings.length
    };
  }

  async step6_TestGuidanceModal() {
    console.log('💡 Step 6: Testing guidance modal...');
    
    const guidanceButtons = document.querySelectorAll('button[data-guidance], button:contains("Guidance")');
    
    if (guidanceButtons.length > 0) {
      try {
        guidanceButtons[0].click();
        
        // Wait for modal
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const modal = document.querySelector('[role="dialog"], .modal, [data-modal]');
        
        this.results.guidanceModal = {
          status: modal ? 'SUCCESS' : 'FAILED',
          buttonsFound: guidanceButtons.length,
          modalAppeared: !!modal,
          modalContent: modal ? modal.textContent.length : 0
        };
        
        // Close modal if it appeared
        if (modal) {
          const closeButton = modal.querySelector('button[data-close], .close, [aria-label="Close"]');
          if (closeButton) closeButton.click();
        }
      } catch (error) {
        this.errors.push(`Guidance modal test failed: ${error.message}`);
      }
    } else {
      this.results.guidanceModal = {
        status: 'NOT_FOUND',
        buttonsFound: 0
      };
    }
  }

  async step7_GenerateReport() {
    console.log('📊 Step 7: Generating comprehensive report...');
    
    // Analyze overall health
    const overallStatus = this.calculateOverallStatus();
    
    this.results.overall = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      totalErrors: this.errors.length,
      totalWarnings: this.warnings.length,
      recommendations: this.generateRecommendations()
    };
  }

  calculateOverallStatus() {
    const criticalIssues = this.errors.length;
    const warnings = this.warnings.length;
    
    if (criticalIssues > 3) return 'CRITICAL';
    if (criticalIssues > 1) return 'MAJOR_ISSUES';
    if (warnings > 3) return 'MINOR_ISSUES';
    return 'HEALTHY';
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Navigation issues
    if (this.results.navigation?.status !== 'SUCCESS') {
      recommendations.push('Navigate to the compliance simplification page first');
    }
    
    // Framework selection issues
    if (this.results.frameworkSelection?.status === 'FAILED') {
      recommendations.push('Framework selection interface is not working - check component rendering');
    }
    
    // Unified requirements issues
    if (this.results.unifiedRequirements?.categoriesFound === 0) {
      recommendations.push('No unified categories found - check data loading and template system');
    }
    
    const problematicCategories = this.results.unifiedRequirements?.categories?.filter(cat => 
      cat.contentType === 'ERROR' || cat.contentType === 'EMPTY' || cat.contentType === 'MINIMAL'
    ) || [];
    
    if (problematicCategories.length > 0) {
      recommendations.push(`${problematicCategories.length} categories have content issues - check UnifiedRequirementsBridge`);
    }
    
    // Console errors
    if (this.results.consoleErrors?.errorCount > 0) {
      recommendations.push('Console errors detected - check browser developer tools for details');
    }
    
    return recommendations;
  }

  generateFinalReport() {
    const report = {
      summary: {
        status: this.results.overall?.status || 'UNKNOWN',
        timestamp: this.results.overall?.timestamp || new Date().toISOString(),
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length
      },
      navigation: this.results.navigation,
      frameworkSelection: this.results.frameworkSelection,
      unifiedRequirements: this.results.unifiedRequirements,
      contentGeneration: this.results.contentGeneration,
      consoleErrors: this.results.consoleErrors,
      guidanceModal: this.results.guidanceModal,
      recommendations: this.results.overall?.recommendations || [],
      errors: this.errors,
      warnings: this.warnings
    };
    
    // Display formatted report
    this.displayReport(report);
    
    return report;
  }

  displayReport(report) {
    console.log('\n🎯 === COMPLIANCE SIMPLIFICATION ANALYSIS REPORT ===\n');
    
    console.log(`📊 Overall Status: ${report.summary.status}`);
    console.log(`❌ Errors: ${report.summary.totalErrors}`);
    console.log(`⚠️  Warnings: ${report.summary.totalWarnings}`);
    console.log(`🕐 Timestamp: ${report.summary.timestamp}\n`);
    
    // Navigation
    console.log('🧭 Navigation:');
    console.log(`   Status: ${report.navigation?.status || 'UNKNOWN'}`);
    console.log(`   Current Path: ${report.navigation?.currentPath || 'UNKNOWN'}\n`);
    
    // Framework Selection
    console.log('🎯 Framework Selection:');
    console.log(`   Status: ${report.frameworkSelection?.status || 'UNKNOWN'}`);
    console.log(`   Elements Found: ${report.frameworkSelection?.elementsFound || 0}`);
    console.log(`   Available Frameworks: ${report.frameworkSelection?.availableFrameworks?.join(', ') || 'None'}\n`);
    
    // Unified Requirements
    console.log('⚡ Unified Requirements:');
    console.log(`   Status: ${report.unifiedRequirements?.status || 'UNKNOWN'}`);
    console.log(`   Categories Found: ${report.unifiedRequirements?.categoriesFound || 0}`);
    
    if (report.unifiedRequirements?.categories?.length > 0) {
      console.log('   Category Details:');
      report.unifiedRequirements.categories.forEach((cat, i) => {
        console.log(`     ${i + 1}. ${cat.name}`);
        console.log(`        Content Type: ${cat.contentType}`);
        console.log(`        Content Length: ${cat.contentLength} chars`);
        console.log(`        Issues: ${cat.issues.join(', ') || 'None'}`);
        console.log(`        Has Guidance: ${cat.hasGuidanceButton ? 'Yes' : 'No'}`);
      });
    }
    console.log('');
    
    // Content Generation
    console.log('🔄 Content Generation:');
    console.log(`   Status: ${report.contentGeneration?.status || 'UNKNOWN'}`);
    console.log(`   Generate Button Found: ${report.contentGeneration?.buttonFound ? 'Yes' : 'No'}\n`);
    
    // Console Errors
    console.log('🔍 Console Errors:');
    console.log(`   Errors: ${report.consoleErrors?.errorCount || 0}`);
    console.log(`   Warnings: ${report.consoleErrors?.warningCount || 0}\n`);
    
    // Guidance Modal
    console.log('💡 Guidance Modal:');
    console.log(`   Status: ${report.guidanceModal?.status || 'UNKNOWN'}`);
    console.log(`   Buttons Found: ${report.guidanceModal?.buttonsFound || 0}\n`);
    
    // Recommendations
    if (report.recommendations.length > 0) {
      console.log('📋 Recommendations:');
      report.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
      console.log('');
    }
    
    // Errors and Warnings
    if (report.errors.length > 0) {
      console.log('❌ Errors:');
      report.errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
      console.log('');
    }
    
    if (report.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      report.warnings.forEach((warning, i) => {
        console.log(`   ${i + 1}. ${warning}`);
      });
      console.log('');
    }
    
    console.log('='.repeat(60));
    console.log('📖 To run this analysis, paste the following in browser console:');
    console.log('   window.complianceAnalyzer.runFullAnalysis()');
    console.log('='.repeat(60));
  }
}

// Make available globally
window.complianceAnalyzer = new ComplianceAnalyzer();

// Auto-run if we're on the compliance page
if (typeof window !== 'undefined' && window.location.pathname.includes('compliance-simplification')) {
  console.log('🚀 Auto-running Compliance Analysis...');
  setTimeout(() => {
    window.complianceAnalyzer.runFullAnalysis();
  }, 2000);
}

export default ComplianceAnalyzer;