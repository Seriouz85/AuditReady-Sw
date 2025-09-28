import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { UnifiedAssessmentData } from './UnifiedAssessmentTemplate';
import { formatDate } from '@/services/utils/UnifiedUtilityService';

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
  
  // Header styles - Fixed spacing and positioning
  header: {
    backgroundColor: colors.primary,
    padding: 15,
    marginBottom: 20,
    borderRadius: 6,
    position: 'relative'
  },
  headerTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingRight: 120, // Leave space for confidential text
    lineHeight: 1.2
  },
  headerSubtitle: {
    color: colors.light,
    fontSize: 11,
    paddingRight: 120, // Leave space for confidential text
    lineHeight: 1.3
  },
  confidential: {
    position: 'absolute',
    top: 15,
    right: 15,
    color: colors.white,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'right'
  },
  
  // Metadata grid - Better spacing
  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 10
  },
  metadataCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.light,
    padding: 10,
    borderRadius: 4,
    border: `1pt solid ${colors.border}`,
    marginBottom: 6
  },
  metadataLabel: {
    fontSize: 9,
    color: colors.muted,
    fontWeight: 'bold',
    marginBottom: 3
  },
  metadataValue: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: 'bold',
    lineHeight: 1.3
  },
  
  // Summary section - Improved spacing
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 8,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: `2pt solid ${colors.accent}`,
    lineHeight: 1.2
  },
  
  summaryContainer: {
    backgroundColor: colors.light,
    padding: 15,
    borderRadius: 6,
    marginBottom: 15,
    border: `1pt solid ${colors.border}`
  },
  
  // Metrics cards - Enhanced spacing and visual appeal
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18
  },
  metricCard: {
    flex: 1,
    minWidth: '22%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center'
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 1.2
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 1.3
  },
  
  // Status specific colors - Enhanced visual design
  fulfilledCard: {
    backgroundColor: '#dcfce7',
    border: `2pt solid #10b981`,
    boxShadow: '0 2 4 rgba(16, 185, 129, 0.1)'
  },
  fulfilledText: {
    color: '#065f46'
  },
  partialCard: {
    backgroundColor: '#fef3c7',
    border: `2pt solid #f59e0b`,
    boxShadow: '0 2 4 rgba(245, 158, 11, 0.1)'
  },
  partialText: {
    color: '#92400e'
  },
  notFulfilledCard: {
    backgroundColor: '#fee2e2',
    border: `2pt solid #ef4444`,
    boxShadow: '0 2 4 rgba(239, 68, 68, 0.1)'
  },
  notFulfilledText: {
    color: '#991b1b'
  },
  notApplicableCard: {
    backgroundColor: '#f3f4f6',
    border: `2pt solid #6b7280`,
    boxShadow: '0 2 4 rgba(107, 114, 128, 0.1)'
  },
  notApplicableText: {
    color: '#374151'
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
  const { assessment, metrics, requirementsBySection, requirementNotes, attachments, standards } = data;

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

                {(requirement.notes || requirementNotes[requirement.id]) && (
                  <View style={styles.notesSection}>
                    <Text style={styles.notesHeader}>Assessor Notes</Text>
                    <Text style={styles.notesText}>
                      {cleanText(requirementNotes[requirement.id] || requirement.notes || '')}
                    </Text>
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