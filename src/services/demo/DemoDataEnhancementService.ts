import { supabase } from '@/lib/supabase';

/**
 * Service to enhance demo account data with realistic compliance status distribution
 * and specific business rules for showcasing different aspects of the compliance dashboard
 */
export class DemoDataEnhancementService {
  private static readonly DEMO_ORG_ID = '34adc4bb-d1e7-43bd-8249-89c76520533d';
  private static isEnhancing = false; // Global flag to prevent concurrent enhancements

  /**
   * Main method to enhance all demo data according to business requirements
   * Only runs if demo data hasn't been enhanced before (performance optimization)
   */
  static async enhanceDemoData(): Promise<void> {
    try {
      // Prevent concurrent enhancements
      if (this.isEnhancing) {
        console.log('⏳ Demo enhancement already in progress, skipping...');
        return;
      }

      // Check if demo data has already been enhanced
      const isAlreadyEnhanced = await this.isDemoDataAlreadyEnhanced();
      if (isAlreadyEnhanced) {
        console.log('ℹ️ Demo data already enhanced, skipping enhancement');
        return;
      }

      // Set flag to prevent concurrent runs
      this.isEnhancing = true;
      console.log('🎯 Starting demo data enhancement with proper status distribution...');
      
      // Run all enhancements in sequence to avoid conflicts
      await this.setChapter18IG3PenetrationTestsAsNotApplicable(); // First set not-applicable
      await this.setCISControlsIG3AsApplicable(); // Then set IG3 as applicable
      await this.setRealisticComplianceDistribution(); // Finally set realistic fulfillment levels

      // Mark demo data as enhanced
      await this.markDemoDataAsEnhanced();

      console.log('✅ Demo data enhancement completed successfully with proper distribution')
    } catch (error) {
      console.error('❌ Error enhancing demo data:', error);
      throw error;
    } finally {
      // Always reset the flag, even if enhancement fails
      this.isEnhancing = false;
    }
  }

  /**
   * Check if demo data has already been enhanced
   * Use localStorage for demo account to avoid RLS issues
   */
  private static async isDemoDataAlreadyEnhanced(): Promise<boolean> {
    try {
      // Use localStorage for demo enhancement tracking to avoid RLS issues
      const enhancementKey = `demo_data_enhanced_${this.DEMO_ORG_ID}`;
      const enhanced = localStorage.getItem(enhancementKey);
      
      if (enhanced === 'true') {
        // Also check if enhancement was recent (within last 24 hours)
        const enhancementTime = localStorage.getItem(`${enhancementKey}_time`);
        if (enhancementTime) {
          const timeDiff = Date.now() - parseInt(enhancementTime);
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          
          // Re-enhance if more than 24 hours old (in case of data changes)
          return hoursDiff < 24;
        }
      }
      
      return false;
    } catch (error) {
      console.warn('Could not check demo enhancement status:', error);
      return false; // Assume not enhanced if check fails
    }
  }

  /**
   * Mark demo data as enhanced to prevent re-running
   * Use localStorage for demo account to avoid RLS issues
   */
  private static async markDemoDataAsEnhanced(): Promise<void> {
    try {
      // Use localStorage for demo enhancement tracking to avoid RLS issues
      const enhancementKey = `demo_data_enhanced_${this.DEMO_ORG_ID}`;
      localStorage.setItem(enhancementKey, 'true');
      localStorage.setItem(`${enhancementKey}_time`, Date.now().toString());
      console.log('✅ Marked demo data as enhanced in localStorage');
    } catch (error) {
      console.warn('Could not mark demo data as enhanced:', error);
      // Don't throw - this shouldn't block the process
    }
  }

  /**
   * Clear enhancement flag to force re-enhancement (useful for testing/updates)
   */
  static clearEnhancementFlag(): void {
    try {
      const enhancementKey = `demo_data_enhanced_${this.DEMO_ORG_ID}`;
      localStorage.removeItem(enhancementKey);
      localStorage.removeItem(`${enhancementKey}_time`);
      // Also reset the concurrent flag
      this.isEnhancing = false;
      console.log('🧹 Cleared demo enhancement flag - will re-enhance on next login');
    } catch (error) {
      console.warn('Could not clear enhancement flag:', error);
    }
  }

  /**
   * Set realistic compliance distribution for demo account:
   * - 67% fulfilled
   * - Remaining split between partially-fulfilled and not-started 
   * - Chapter 18 IG3 requirements already set as not-applicable
   */
  private static async setRealisticComplianceDistribution(): Promise<void> {
    console.log('📊 Setting realistic compliance distribution (67% fulfilled, rest split)...');

    try {
      // Get all requirements for demo org that are not 'not-applicable'
      const { data: allReqs, error: fetchError } = await supabase
        .from('organization_requirements')
        .select('id, requirement_id, status')
        .eq('organization_id', this.DEMO_ORG_ID)
        .neq('status', 'not-applicable');

      if (fetchError) throw fetchError;
      if (!allReqs || allReqs.length === 0) {
        console.log('ℹ️ No applicable requirements found');
        return;
      }

      console.log(`Found ${allReqs.length} applicable requirements for demo org`);

      // Calculate distribution
      const totalApplicable = allReqs.length;
      const fulfilledCount = Math.floor(totalApplicable * 0.67); // 67% fulfilled
      const remainingCount = totalApplicable - fulfilledCount;
      const partiallyFulfilledCount = Math.floor(remainingCount * 0.5); // Half of remaining
      const notStartedCount = remainingCount - partiallyFulfilledCount; // Rest not-started

      console.log(`Distribution: ${fulfilledCount} fulfilled, ${partiallyFulfilledCount} partially-fulfilled, ${notStartedCount} not-started`);

      // Shuffle requirements randomly
      const shuffled = [...allReqs].sort(() => Math.random() - 0.5);

      // Prepare updates
      const updates = [];

      // Set fulfilled requirements
      for (let i = 0; i < fulfilledCount; i++) {
        updates.push({
          id: shuffled[i].id,
          status: 'fulfilled' as const,
          fulfillment_percentage: 100,
          notes: 'Fully implemented - demo data',
          updated_at: new Date().toISOString()
        });
      }

      // Set partially-fulfilled requirements  
      for (let i = fulfilledCount; i < fulfilledCount + partiallyFulfilledCount; i++) {
        updates.push({
          id: shuffled[i].id,
          status: 'partially-fulfilled' as const,
          fulfillment_percentage: Math.floor(Math.random() * 60) + 20, // 20-80% progress
          notes: 'Implementation in progress - demo data',
          updated_at: new Date().toISOString()
        });
      }

      // Set not-fulfilled requirements (using not-fulfilled instead of not-started for DB constraint)
      for (let i = fulfilledCount + partiallyFulfilledCount; i < totalApplicable; i++) {
        updates.push({
          id: shuffled[i].id,
          status: 'not-fulfilled' as const,
          fulfillment_percentage: 0,
          notes: 'Pending implementation - demo data',
          updated_at: new Date().toISOString()
        });
      }

      // Batch update requirements using individual updates to avoid constraint issues
      if (updates.length > 0) {
        console.log(`Applying ${updates.length} requirement updates...`);
        
        for (const update of updates) {
          const { error: updateError } = await supabase
            .from('organization_requirements')
            .update({
              status: update.status,
              fulfillment_percentage: update.fulfillment_percentage,
              notes: update.notes,
              updated_at: update.updated_at
            })
            .eq('id', update.id);

          if (updateError) {
            console.error(`Failed to update requirement ${update.id}:`, updateError);
            throw updateError;
          }
        }
        
        console.log(`✅ Updated ${updates.length} requirements with realistic compliance distribution`);
      }
    } catch (error) {
      console.error('Error setting realistic compliance distribution:', error);
      throw error;
    }
  }

  /**
   * Set CIS Controls IG3 requirements as applicable
   * This ensures IG3 controls are properly categorized for demo purposes
   */
  private static async setCISControlsIG3AsApplicable(): Promise<void> {
    console.log('🛡️ Setting CIS Controls IG3 requirements as applicable...');

    try {
      // Get CIS Controls standard
      const { data: cisStandard, error: standardError } = await supabase
        .from('standards_library')
        .select('id')
        .ilike('name', '%CIS%')
        .single();

      if (standardError || !cisStandard) {
        console.log('ℹ️ CIS Controls standard not found, skipping IG3 updates');
        return;
      }

      // Get all CIS requirements that contain IG3 in their metadata or description
      const { data: cisRequirements, error: reqError } = await supabase
        .from('requirements_library')
        .select('id, code, name, description')
        .eq('standard_id', cisStandard.id)
        .or('description.ilike.%IG3%,name.ilike.%IG3%,code.ilike.%IG3%');

      if (reqError) throw reqError;
      if (!cisRequirements || cisRequirements.length === 0) {
        console.log('ℹ️ No IG3 requirements found');
        return;
      }

      // Get organization requirements for these CIS requirements
      const requirementIds = cisRequirements.map(req => req.id);
      const { data: orgReqs, error: orgReqError } = await supabase
        .from('organization_requirements')
        .select('id, requirement_id, status')
        .eq('organization_id', this.DEMO_ORG_ID)
        .in('requirement_id', requirementIds);

      if (orgReqError) throw orgReqError;
      if (!orgReqs || orgReqs.length === 0) {
        console.log('ℹ️ No organization requirements found for IG3 controls');
        return;
      }

      // Update all IG3 requirements to be applicable (not not-applicable)
      const updates = orgReqs
        .filter(req => req.status === 'not-applicable')
        .map(req => ({
          id: req.id,
          status: 'not-fulfilled' as const, // Set to not-fulfilled (DB doesn't have not-started in enum)
          notes: 'IG3 control - applicable for demo organization',
          updated_at: new Date().toISOString()
        }));

      if (updates.length > 0) {
        console.log(`Updating ${updates.length} IG3 controls...`);
        
        for (const update of updates) {
          const { error: updateError } = await supabase
            .from('organization_requirements')
            .update({
              status: update.status,
              notes: update.notes,
              updated_at: update.updated_at
            })
            .eq('id', update.id);

          if (updateError) {
            console.error(`Failed to update IG3 requirement ${update.id}:`, updateError);
            throw updateError;
          }
        }
        
        console.log(`✅ Set ${updates.length} IG3 controls as applicable`);
      } else {
        console.log('ℹ️ All IG3 controls already applicable');
      }
    } catch (error) {
      console.error('Error setting IG3 controls as applicable:', error);
      throw error;
    }
  }

  /**
   * Set Chapter 18 IG3 penetration test requirements as not-applicable
   * This reflects that demo organization doesn't require penetration testing
   */
  private static async setChapter18IG3PenetrationTestsAsNotApplicable(): Promise<void> {
    console.log('🔍 Setting Chapter 18 IG3 penetration test requirements as not-applicable...');

    try {
      // Get CIS Controls standard
      const { data: cisStandard, error: standardError } = await supabase
        .from('standards_library')
        .select('id')
        .ilike('name', '%CIS%')
        .single();

      if (standardError || !cisStandard) {
        console.log('ℹ️ CIS Controls standard not found, skipping Chapter 18 updates');
        return;
      }

      // Get Chapter 18 requirements from CIS IG3 (Penetration Testing)
      const { data: chapter18Reqs, error: reqError } = await supabase
        .from('requirements_library')
        .select('id, code, name, description')
        .eq('standard_id', cisStandard.id)
        .and('code.ilike.%18.%,description.ilike.%IG3%');

      if (reqError) throw reqError;
      if (!chapter18Reqs || chapter18Reqs.length === 0) {
        console.log('ℹ️ No Chapter 18 IG3 penetration testing requirements found');
        return;
      }

      // Get organization requirements for Chapter 18 IG3
      const requirementIds = chapter18Reqs.map(req => req.id);
      const { data: orgReqs, error: orgReqError } = await supabase
        .from('organization_requirements')
        .select('id, requirement_id, status')
        .eq('organization_id', this.DEMO_ORG_ID)
        .in('requirement_id', requirementIds);

      if (orgReqError) throw orgReqError;
      if (!orgReqs || orgReqs.length === 0) {
        console.log('ℹ️ No organization requirements found for Chapter 18 IG3');
        return;
      }

      // Update Chapter 18 IG3 requirements to not-applicable
      const updates = orgReqs
        .filter(req => req.status !== 'not-applicable')
        .map(req => ({
          id: req.id,
          status: 'not-applicable' as const,
          notes: 'Chapter 18 penetration testing not applicable for demo organization scope',
          updated_at: new Date().toISOString()
        }));

      if (updates.length > 0) {
        console.log(`Updating ${updates.length} Chapter 18 IG3 requirements...`);
        
        for (const update of updates) {
          const { error: updateError } = await supabase
            .from('organization_requirements')
            .update({
              status: update.status,
              notes: update.notes,
              updated_at: update.updated_at
            })
            .eq('id', update.id);

          if (updateError) {
            console.error(`Failed to update Chapter 18 requirement ${update.id}:`, updateError);
            throw updateError;
          }
        }
        
        console.log(`✅ Set ${updates.length} Chapter 18 IG3 penetration test requirements as not-applicable`);
      } else {
        console.log('ℹ️ All Chapter 18 IG3 penetration test requirements already not-applicable');
      }
    } catch (error) {
      console.error('Error setting Chapter 18 IG3 penetration test requirements:', error);
      throw error;
    }
  }

  /**
   * Set CIS Controls IG3 Chapter 18 requirements as not-applicable  
   * Chapter 18 (Penetration Testing) is not applicable for demo organization
   */
  private static async setCISControlsIG3Chapter18AsNotApplicable(): Promise<void> {
    console.log('🛡️ Setting CIS Controls IG3 Chapter 18 as not-applicable...');

    try {
      // Get CIS Controls standard (IG3)
      const { data: cisStandard, error: standardError } = await supabase
        .from('standards_library')
        .select('id')
        .ilike('name', '%CIS%')
        .single();

      if (standardError || !cisStandard) {
        console.log('ℹ️ CIS Controls standard not found, skipping Chapter 18 updates');
        return;
      }

      // Get Chapter 18 requirements from CIS IG3 (Penetration Testing)
      const { data: chapter18Reqs, error: reqError } = await supabase
        .from('requirements_library')
        .select('id, code, name, description')
        .eq('standard_id', cisStandard.id)
        .or('code.ilike.18.%,name.ilike.%penetration%,description.ilike.%penetration%,name.ilike.%pen test%');

      if (reqError) throw reqError;
      if (!chapter18Reqs || chapter18Reqs.length === 0) {
        console.log('ℹ️ No Chapter 18 penetration testing requirements found');
        return;
      }

      // Get organization requirements for Chapter 18
      const requirementIds = chapter18Reqs.map(req => req.id);
      const { data: orgReqs, error: orgReqError } = await supabase
        .from('organization_requirements')
        .select('id, requirement_id, status')
        .eq('organization_id', this.DEMO_ORG_ID)
        .in('requirement_id', requirementIds);

      if (orgReqError) throw orgReqError;
      if (!orgReqs || orgReqs.length === 0) {
        console.log('ℹ️ No organization requirements found for Chapter 18');
        return;
      }

      // Update Chapter 18 requirements to not-applicable
      const updates = orgReqs
        .filter(req => req.status !== 'not-applicable')
        .map(req => ({
          id: req.id,
          status: 'not-applicable' as const,
          notes: 'Chapter 18 (Penetration Testing) not applicable for demo organization',
          updated_at: new Date().toISOString()
        }));

      if (updates.length > 0) {
        const { error: updateError } = await supabase
          .from('organization_requirements')
          .upsert(updates);

        if (updateError) throw updateError;
        console.log(`✅ Set ${updates.length} Chapter 18 requirements as not-applicable`);
      } else {
        console.log('ℹ️ All Chapter 18 requirements already not-applicable');
      }
    } catch (error) {
      console.error('Error setting Chapter 18 requirements:', error);
      throw error;
    }
  }

  /**
   * Set all Chapter 18 penetration test requirements as not-applicable
   * This reflects that demo organization doesn't require penetration testing
   */
  private static async setChapter18PenetrationTestsAsNotApplicable(): Promise<void> {
    console.log('🔍 Setting Chapter 18 penetration test requirements as not-applicable...');

    try {
      // Find requirements related to penetration testing
      // Look for Chapter 18 or penetration-related requirements
      const { data: penTestReqs, error: reqError } = await supabase
        .from('requirements_library')
        .select('id, code, name, description')
        .or('code.ilike.%18.%,name.ilike.%penetration%,description.ilike.%penetration%,name.ilike.%pen test%,description.ilike.%pen test%');

      if (reqError) throw reqError;
      if (!penTestReqs || penTestReqs.length === 0) {
        console.log('ℹ️ No penetration test requirements found');
        return;
      }

      // Get organization requirements for these penetration test requirements
      const requirementIds = penTestReqs.map(req => req.id);
      const { data: orgReqs, error: orgReqError } = await supabase
        .from('organization_requirements')
        .select('id, requirement_id, status')
        .eq('organization_id', this.DEMO_ORG_ID)
        .in('requirement_id', requirementIds);

      if (orgReqError) throw orgReqError;
      if (!orgReqs || orgReqs.length === 0) {
        console.log('ℹ️ No organization requirements found for penetration testing');
        return;
      }

      // Update all penetration test requirements to not-applicable
      const updates = orgReqs
        .filter(req => req.status !== 'not-applicable')
        .map(req => ({
          id: req.id,
          status: 'not-applicable' as const,
          notes: 'Penetration testing not applicable for demo organization scope',
          updated_at: new Date().toISOString()
        }));

      if (updates.length > 0) {
        const { error: updateError } = await supabase
          .from('organization_requirements')
          .upsert(updates);

        if (updateError) throw updateError;
        console.log(`✅ Set ${updates.length} penetration test requirements as not-applicable`);
      } else {
        console.log('ℹ️ All penetration test requirements already not-applicable');
      }
    } catch (error) {
      console.error('Error setting penetration test requirements:', error);
      throw error;
    }
  }

  /**
   * Get current demo data statistics for verification
   */
  static async getDemoDataStatistics(): Promise<{
    totalRequirements: number;
    fulfilled: number;
    partiallyFulfilled: number;
    notFulfilled: number;
    notApplicable: number;
    percentages: {
      fulfilled: number;
      partiallyFulfilled: number;
      notFulfilled: number;
      notApplicable: number;
    };
  }> {
    try {
      const { data: stats, error } = await supabase
        .from('organization_requirements')
        .select('status')
        .eq('organization_id', this.DEMO_ORG_ID);

      if (error) throw error;
      if (!stats) throw new Error('No requirements found');

      const totalRequirements = stats.length;
      const fulfilled = stats.filter(r => r.status === 'fulfilled').length;
      const partiallyFulfilled = stats.filter(r => r.status === 'partially-fulfilled').length;
      const notFulfilled = stats.filter(r => r.status === 'not-fulfilled').length;
      const notApplicable = stats.filter(r => r.status === 'not-applicable').length;

      return {
        totalRequirements,
        fulfilled,
        partiallyFulfilled,
        notFulfilled,
        notApplicable,
        percentages: {
          fulfilled: Math.round((fulfilled / totalRequirements) * 100),
          partiallyFulfilled: Math.round((partiallyFulfilled / totalRequirements) * 100),
          notFulfilled: Math.round((notFulfilled / totalRequirements) * 100),
          notApplicable: Math.round((notApplicable / totalRequirements) * 100)
        }
      };
    } catch (error) {
      console.error('Error getting demo data statistics:', error);
      throw error;
    }
  }

  /**
   * Clean up any double/mock tags - ensure ONLY unified category tags are used
   */
  private static async cleanupDoubleTags(): Promise<void> {
    console.log('🧹 Cleaning up double/mock tags - ensuring only unified category tags...');

    try {
      // Get all unified categories for reference
      const { data: unifiedCategories, error: catError } = await supabase
        .from('unified_compliance_categories')
        .select('id, name')
        .eq('is_active', true);

      if (catError) throw catError;
      if (!unifiedCategories) {
        console.log('No unified categories found');
        return;
      }

      const validCategoryNames = unifiedCategories.map(cat => cat.name);

      // Get all demo organization requirements with tags
      const { data: orgReqs, error: reqError } = await supabase
        .from('organization_requirements')
        .select('id, requirement_id, tags')
        .eq('organization_id', this.DEMO_ORG_ID)
        .not('tags', 'is', null);

      if (reqError) throw reqError;
      if (!orgReqs || orgReqs.length === 0) {
        console.log('No requirements with tags found');
        return;
      }

      let cleanedCount = 0;

      for (const req of orgReqs) {
        if (!req.tags || req.tags.length === 0) continue;

        // Filter tags to only include valid unified category names
        const cleanedTags = req.tags.filter(tag => validCategoryNames.includes(tag));
        
        // Remove duplicates
        const uniqueCleanedTags = [...new Set(cleanedTags)];

        // Only update if tags changed
        if (JSON.stringify(uniqueCleanedTags.sort()) !== JSON.stringify(req.tags.sort())) {
          const { error: updateError } = await supabase
            .from('organization_requirements')
            .update({ tags: uniqueCleanedTags })
            .eq('id', req.id);

          if (updateError) {
            console.error(`Error updating tags for requirement ${req.id}:`, updateError);
          } else {
            cleanedCount++;
          }
        }
      }

      console.log(`✅ Cleaned up tags for ${cleanedCount} requirements`);
    } catch (error) {
      console.error('Error cleaning up double tags:', error);
      throw error;
    }
  }

  /**
   * Simple, safe status distribution that works with existing data structure
   */
  private static async applySimpleStatusDistribution(): Promise<void> {
    console.log('📊 Applying simple status distribution...');
    
    try {
      // Get all demo org requirements 
      const { data: allReqs, error } = await supabase
        .from('organization_requirements')
        .select('id, status')
        .eq('organization_id', this.DEMO_ORG_ID);

      if (error) throw error;
      if (!allReqs || allReqs.length === 0) return;

      console.log(`Found ${allReqs.length} requirements to distribute`);

      // Calculate target distribution - FOR DEMO ACCOUNT ONLY
      const totalCount = allReqs.length;
      const fulfilledCount = Math.floor(totalCount * 0.67); // 67% fulfilled as requested
      const remainingCount = totalCount - fulfilledCount;
      const partiallyFulfilledCount = Math.floor(remainingCount * 0.6); // 60% of remaining = ~20% total
      const notApplicableCount = Math.floor(remainingCount * 0.15); // 15% of remaining = ~5% total
      const notFulfilledCount = remainingCount - partiallyFulfilledCount - notApplicableCount; // Rest

      console.log(`🎯 Target distribution: ${fulfilledCount} fulfilled (${Math.round((fulfilledCount/totalCount)*100)}%), ${partiallyFulfilledCount} partially-fulfilled (${Math.round((partiallyFulfilledCount/totalCount)*100)}%), ${notFulfilledCount} not-fulfilled (${Math.round((notFulfilledCount/totalCount)*100)}%), ${notApplicableCount} not-applicable (${Math.round((notApplicableCount/totalCount)*100)}%)`);
      console.log('✅ All 4 status types will be represented for proper demo showcase');

      // Randomly assign statuses
      const shuffled = [...allReqs].sort(() => Math.random() - 0.5);
      let index = 0;

      // Batch update to avoid constraint issues
      const updates = [];

      // Fulfilled (67%)
      for (let i = 0; i < fulfilledCount; i++) {
        updates.push({
          id: shuffled[index++].id,
          status: 'fulfilled',
          fulfillment_percentage: 100,
          notes: 'Fully implemented - demo data'
        });
      }

      // Partially fulfilled (~20%) - database enum is now fixed
      for (let i = 0; i < partiallyFulfilledCount; i++) {
        updates.push({
          id: shuffled[index++].id,
          status: 'partially-fulfilled',
          fulfillment_percentage: Math.floor(Math.random() * 60) + 20,
          notes: 'Implementation in progress - demo data'
        });
      }

      // Not applicable (~7%)  
      for (let i = 0; i < notApplicableCount; i++) {
        updates.push({
          id: shuffled[index++].id,
          status: 'not-applicable',
          fulfillment_percentage: 0,
          notes: 'Not applicable for demo organization scope'
        });
      }

      // Not fulfilled (rest)
      for (let i = index; i < totalCount; i++) {
        updates.push({
          id: shuffled[i].id,
          status: 'not-fulfilled',
          fulfillment_percentage: 0,
          notes: 'Pending implementation - demo data'
        });
      }

      // Apply updates individually to avoid constraint conflicts
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('organization_requirements')
          .update({
            status: update.status,
            fulfillment_percentage: update.fulfillment_percentage,
            notes: update.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', update.id);

        if (updateError) {
          console.error(`Failed to update requirement ${update.id} to ${update.status}:`, updateError);
          console.error(`Update details:`, {
            id: update.id,
            status: update.status,
            statusType: typeof update.status,
            statusLength: update.status?.length,
            statusBytes: update.status ? Array.from(update.status).map(c => c.charCodeAt(0).toString(16)).join(' ') : 'N/A'
          });
          // Don't throw - continue with other updates but count errors
          if (update.status === 'partially-fulfilled') {
            console.warn('⚠️ partially-fulfilled is consistently failing - may need database enum fix');
          }
        }
      }

      console.log(`✅ Applied status distribution to ${updates.length} requirements`);
    } catch (error) {
      console.error('Error applying simple status distribution:', error);
      throw error;
    }
  }

  /**
   * Test if partially-fulfilled status is supported by the database
   */
  private static async testPartiallyFulfilledStatus(): Promise<boolean> {
    try {
      // Get one demo requirement to test with
      const { data: testReq, error: fetchError } = await supabase
        .from('organization_requirements')
        .select('id, status')
        .eq('organization_id', this.DEMO_ORG_ID)
        .limit(1)
        .single();

      if (fetchError || !testReq) {
        console.warn('Could not get test requirement for partially-fulfilled test');
        return false;
      }

      // Try to update it to partially-fulfilled
      const { error: testError } = await supabase
        .from('organization_requirements')
        .update({ status: 'partially-fulfilled' })
        .eq('id', testReq.id);

      if (testError) {
        console.log('❌ partially-fulfilled test failed:', testError.message);
        // Revert back to original status
        await supabase
          .from('organization_requirements')
          .update({ status: testReq.status })
          .eq('id', testReq.id);
        return false;
      }

      console.log('✅ partially-fulfilled test passed');
      // Revert back to original status for clean test
      await supabase
        .from('organization_requirements')
        .update({ status: testReq.status })
        .eq('id', testReq.id);
      
      return true;
    } catch (error) {
      console.error('Error testing partially-fulfilled status:', error);
      return false;
    }
  }
}