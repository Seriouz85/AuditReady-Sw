import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { UnifiedAssessmentData } from './UnifiedAssessmentTemplate';

// Use built-in fonts instead of registering custom fonts to avoid format errors
// @react-pdf/renderer supports: Helvetica, Times-Roman, Courier
// We'll use Helvetica for a clean, professional look

// Professional color scheme
const colors = {
  primary: '#1e293b',
  secondary: '#475569',
  accent: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  muted: '#6b7280',
  light: '#f8fafc',
  white: '#ffffff',
  border: '#e2e8f0'
};

// Professional styles for consistent layout
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: colors.white,
    padding: 25,
    paddingBottom: 60, // Reduced bottom padding
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.4,
    color: colors.primary
  },
  
  // Header styles
  header: {
    backgroundColor: colors.primary,
    padding: 15,
    marginBottom: 15,
    borderRadius: 6
  },
  headerTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5
  },
  headerSubtitle: {
    color: colors.light,
    fontSize: 12
  },
  confidential: {
    position: 'absolute',
    top: 15,
    right: 15,
    color: colors.white,
    fontSize: 8,
    fontWeight: 'bold'
  },
  
  // Metadata grid - More compact
  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    gap: 8
  },
  metadataCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.light,
    padding: 8,
    borderRadius: 4,
    border: `1pt solid ${colors.border}`,
    marginBottom: 4
  },
  metadataLabel: {
    fontSize: 8,
    color: colors.muted,
    fontWeight: 'bold',
    marginBottom: 2
  },
  metadataValue: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: 'bold'
  },
  
  // Summary section
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: `2pt solid ${colors.accent}`
  },
  
  summaryContainer: {
    backgroundColor: colors.light,
    padding: 15,
    borderRadius: 6,
    marginBottom: 15,
    border: `1pt solid ${colors.border}`
  },
  
  // Metrics cards - More compact
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12
  },
  metricCard: {
    flex: 1,
    minWidth: '22%',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center'
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: 'bold'
  },
  
  // Status specific colors
  fulfilledCard: {
    backgroundColor: '#dcfce7',
    border: `1pt solid #bbf7d0`
  },
  fulfilledText: {
    color: colors.success
  },
  partialCard: {
    backgroundColor: '#fef3c7',
    border: `1pt solid #fed7aa`
  },
  partialText: {
    color: colors.warning
  },
  notFulfilledCard: {
    backgroundColor: '#fee2e2',
    border: `1pt solid #fecaca`
  },
  notFulfilledText: {
    color: colors.danger
  },
  notApplicableCard: {
    backgroundColor: '#f3f4f6',
    border: `1pt solid #d1d5db`
  },
  notApplicableText: {
    color: colors.muted
  },
  
  // Content sections - More compact
  contentSection: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: colors.light,
    borderRadius: 4,
    border: `1pt solid ${colors.border}`
  },
  contentHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: 8
  },
  contentText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: colors.secondary
  },
  
  // Standards section - Improved spacing
  standardHeader: {
    backgroundColor: colors.primary,
    color: colors.white,
    padding: 15,
    marginTop: 25,
    marginBottom: 20,
    borderRadius: 6,
    breakInside: 'avoid'
  },
  standardTitle: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  standardCount: {
    fontSize: 10,
    marginTop: 2,
    color: colors.light
  },
  
  // Requirement cards
  requirementCard: {
    backgroundColor: colors.white,
    border: `1pt solid ${colors.border}`,
    borderRadius: 6,
    padding: 15,
    marginBottom: 12,
    breakInside: 'avoid'
  },
  requirementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  requirementCode: {
    backgroundColor: colors.light,
    padding: 6,
    borderRadius: 4,
    border: `1pt solid ${colors.border}`,
    minWidth: 30,
    textAlign: 'center'
  },
  requirementCodeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.secondary
  },
  requirementTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
    lineHeight: 1.4
  },
  statusBadge: {
    padding: '4 8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusText: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  requirementDescription: {
    fontSize: 9,
    color: colors.secondary,
    marginBottom: 10,
    lineHeight: 1.5
  },
  notesSection: {
    backgroundColor: '#eff6ff',
    borderLeft: `3pt solid ${colors.accent}`,
    padding: 12,
    marginTop: 10,
    borderRadius: 4,
    breakInside: 'avoid',
    minHeight: 30
  },
  notesHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: 4
  },
  notesText: {
    fontSize: 8,
    color: colors.secondary,
    lineHeight: 1.4,
    wordWrap: 'break-word',
    flexWrap: 'wrap'
  },
  
  // Footer - Fixed positioning
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTop: `1pt solid ${colors.border}`,
    fontSize: 8,
    color: colors.muted,
    backgroundColor: colors.white
  }
});

interface ProfessionalAssessmentDocumentProps {
  data: UnifiedAssessmentData;
}

export const ProfessionalAssessmentDocument: React.FC<ProfessionalAssessmentDocumentProps> = ({ data }) => {
  const { assessment, metrics, requirementsBySection, attachments, standards } = data;

  // Clean text function to remove encoding issues
  const cleanText = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/[<>âåÂ]/g, '') // Remove encoding characters
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/^\*|\*$/g, '') // Remove leading/trailing asterisks
      .replace(/^=+|=+$/g, '') // Remove equal signs
      .trim();
  };

  // Get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'fulfilled':
        return [styles.statusBadge, { backgroundColor: colors.success }];
      case 'partially-fulfilled':
        return [styles.statusBadge, { backgroundColor: colors.warning }];
      case 'not-fulfilled':
        return [styles.statusBadge, { backgroundColor: colors.danger }];
      case 'not-applicable':
        return [styles.statusBadge, { backgroundColor: colors.muted }];
      default:
        return [styles.statusBadge, { backgroundColor: colors.secondary }];
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Document title={assessment.name} author="AuditReady Security Platform">
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.confidential}>CONFIDENTIAL - ASSESSMENT REPORT</Text>
          <Text style={styles.headerTitle}>{assessment.name}</Text>
          <Text style={styles.headerSubtitle}>
            {standards.map(s => `${s.name} ${s.version}`).join(' | ')}
          </Text>
        </View>

        {/* Metadata Grid */}
        <View style={styles.metadataContainer}>
          <View style={styles.metadataCard}>
            <Text style={styles.metadataLabel}>Assessor</Text>
            <Text style={styles.metadataValue}>
              {assessment.assessorNames?.join(', ') || assessment.assessorName || 'Not Assigned'}
            </Text>
          </View>
          <View style={styles.metadataCard}>
            <Text style={styles.metadataLabel}>Status</Text>
            <Text style={styles.metadataValue}>
              {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
            </Text>
          </View>
          <View style={styles.metadataCard}>
            <Text style={styles.metadataLabel}>Compliance Score</Text>
            <Text style={styles.metadataValue}>{metrics.complianceScore}%</Text>
          </View>
          <View style={styles.metadataCard}>
            <Text style={styles.metadataLabel}>Last Updated</Text>
            <Text style={styles.metadataValue}>{formatDate(assessment.updatedAt)}</Text>
          </View>
        </View>

        {/* Assessment Summary */}
        <Text style={styles.sectionHeader}>Assessment Summary</Text>
        <View style={styles.summaryContainer}>
          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, styles.fulfilledCard]}>
              <Text style={[styles.metricValue, styles.fulfilledText]}>{metrics.fulfilled}</Text>
              <Text style={[styles.metricLabel, styles.fulfilledText]}>Fulfilled</Text>
            </View>
            <View style={[styles.metricCard, styles.partialCard]}>
              <Text style={[styles.metricValue, styles.partialText]}>{metrics.partiallyFulfilled}</Text>
              <Text style={[styles.metricLabel, styles.partialText]}>Partially Fulfilled</Text>
            </View>
            <View style={[styles.metricCard, styles.notFulfilledCard]}>
              <Text style={[styles.metricValue, styles.notFulfilledText]}>{metrics.notFulfilled}</Text>
              <Text style={[styles.metricLabel, styles.notFulfilledText]}>Not Fulfilled</Text>
            </View>
            <View style={[styles.metricCard, styles.notApplicableCard]}>
              <Text style={[styles.metricValue, styles.notApplicableText]}>{metrics.notApplicable}</Text>
              <Text style={[styles.metricLabel, styles.notApplicableText]}>Not Applicable</Text>
            </View>
          </View>

          {/* Assessment Notes */}
          {assessment.notes && (
            <View style={styles.contentSection}>
              <Text style={styles.contentHeader}>1. Assessment Notes</Text>
              <Text style={styles.contentText}>{cleanText(assessment.notes)}</Text>
            </View>
          )}

          {/* Assessment Methods */}
          {assessment.methods && assessment.methods.length > 0 && (
            <View style={styles.contentSection}>
              <Text style={styles.contentHeader}>2. Assessment Methods</Text>
              <Text style={styles.contentText}>
                {assessment.methods.map((method, index) => 
                  `${index + 1}. ${method}`
                ).join('\n')}
              </Text>
            </View>
          )}

          {/* Evidence */}
          {assessment.evidence && (
            <View style={styles.contentSection}>
              <Text style={styles.contentHeader}>3. Evidence Collection</Text>
              <Text style={styles.contentText}>{cleanText(assessment.evidence)}</Text>
            </View>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <View style={styles.contentSection}>
              <Text style={styles.contentHeader}>4. Attached Evidence Documents</Text>
              {attachments.map((attachment, index) => (
                <View key={index} style={{ marginBottom: 5 }}>
                  <Text style={[styles.contentText, { fontWeight: 'bold' }]}>
                    {attachment.filename}
                  </Text>
                  <Text style={styles.contentText}>
                    {attachment.description} • {attachment.size || 'N/A'} • {attachment.type || 'Document'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Requirements by Standard - Professional Organization */}
        <Text style={styles.sectionHeader}>Detailed Requirements Analysis</Text>
        
        {Object.entries(requirementsBySection).map(([section, requirements]) => (
          <View key={section} break>
            <View style={styles.standardHeader}>
              <Text style={styles.standardTitle}>{cleanText(section)}</Text>
              <Text style={styles.standardCount}>
                {requirements.length} requirement{requirements.length !== 1 ? 's' : ''}
              </Text>
            </View>

            {requirements.map((requirement, index) => (
              <View key={requirement.id} style={styles.requirementCard} wrap={false} minPresenceAhead={50}>
                <View style={styles.requirementHeader}>
                  <View style={styles.requirementCode}>
                    <Text style={styles.requirementCodeText}>{requirement.code}</Text>
                  </View>
                  <View style={{ flex: 1, marginHorizontal: 10 }}>
                    <Text style={styles.requirementTitle}>{cleanText(requirement.name)}</Text>
                  </View>
                  <View style={getStatusBadgeStyle(requirement.status)}>
                    <Text style={[styles.statusText, { color: colors.white }]}>
                      {requirement.status.replace('-', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.requirementDescription}>
                  {cleanText(requirement.description)}
                </Text>

                {requirement.notes && (
                  <View style={styles.notesSection}>
                    <Text style={styles.notesHeader}>Assessor Notes</Text>
                    <Text style={styles.notesText}>{cleanText(requirement.notes)}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}

        {/* Footer */}
        <Text style={styles.footer} fixed>
          <Text>Generated by AuditReady Security Platform • {formatDate(new Date())}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </Text>
      </Page>
    </Document>
  );
};

export default ProfessionalAssessmentDocument;