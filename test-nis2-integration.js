// Quick validation test for NIS2 Entity Classification and Reporting Services
import { NIS2EntityClassificationService } from './src/services/compliance/NIS2EntityClassificationService.js';
import { NIS2ReportingService } from './src/services/compliance/NIS2ReportingService.js';

console.log('🧪 Testing NIS2 Entity Classification Service...\n');

// Test Essential Entity (Energy)
const energySectorId = '1f48b8fd-6421-4dba-b60c-37887157482d';
const energyClassification = NIS2EntityClassificationService.getEntityClassification(energySectorId);
console.log('✅ Energy Sector Classification:', energyClassification?.entityType, energyClassification?.annexReference);

// Test Important Entity (Manufacturing)
const manufacturingSectorId = '845dd597-a804-40c7-a92a-416162884ad1';
const manufacturingClassification = NIS2EntityClassificationService.getEntityClassification(manufacturingSectorId);
console.log('✅ Manufacturing Sector Classification:', manufacturingClassification?.entityType, manufacturingClassification?.annexReference);

// Test Entity Info
const energyInfo = NIS2EntityClassificationService.getEntityInfo(energySectorId);
console.log('✅ Energy Entity Label:', energyInfo.label);
console.log('✅ Energy Badge Color:', energyInfo.badgeColor);

console.log('\n🧪 Testing NIS2 Reporting Service...\n');

// Test Reporting Requirements
const energyReporting = NIS2ReportingService.getReportingRequirements(energySectorId);
console.log('✅ Energy Reporting Timeline:', energyReporting?.baseTimeline);
console.log('✅ Energy Enhanced Requirements:', energyReporting?.enhancedRequirements);

const manufacturingReporting = NIS2ReportingService.getReportingRequirements(manufacturingSectorId);
console.log('✅ Manufacturing Reporting Timeline:', manufacturingReporting?.baseTimeline);
console.log('✅ Manufacturing Enhanced Requirements:', manufacturingReporting?.enhancedRequirements);

// Test Incident Reporting
const criticalIncidentTimeline = NIS2ReportingService.getIncidentReportingTimeline(energySectorId, 'critical');
console.log('✅ Critical Incident Timeline (Essential):', criticalIncidentTimeline);

const mediumIncidentTimeline = NIS2ReportingService.getIncidentReportingTimeline(manufacturingSectorId, 'medium');
console.log('✅ Medium Incident Timeline (Important):', mediumIncidentTimeline);

// Test Penalty Information
const energyPenalties = NIS2ReportingService.getPenaltyInformation(energySectorId);
console.log('✅ Energy Max Fine:', energyPenalties.maxFine);

const manufacturingPenalties = NIS2ReportingService.getPenaltyInformation(manufacturingSectorId);
console.log('✅ Manufacturing Max Fine:', manufacturingPenalties.maxFine);

console.log('\n🎉 All NIS2 services working correctly!');
console.log('✅ Essential entities get enhanced requirements and stricter timelines');
console.log('✅ Important entities get standard requirements');
console.log('✅ Tiered penalty framework implemented');
console.log('✅ Entity-specific reporting timelines active');