import { supabase } from '@/lib/supabase';

/**
 * Optimized Demo Data Service using clever batch operations and proper database setup
 * This replaces the slow individual updates with efficient batch operations
 */
export class OptimizedDemoDataService {
  private static readonly DEMO_ORG_ID = '34adc4bb-d1e7-43bd-8249-89c76520533d';
  private static readonly BATCH_SIZE = 100; // Optimal batch size for Supabase
  
  /**
   * Check if demo data has already been enhanced
   * Uses a more efficient check with version control
   */
  static async isDemoDataEnhanced(): Promise<boolean> {
    try {
      // Check localStorage first for quick verification
      const enhancementKey = `demo_data_enhanced_v2_${this.DEMO_ORG_ID}`;
      const enhanced = localStorage.getItem(enhancementKey);
      
      if (enhanced === 'true') {
        // Also verify the enhancement is recent (within 7 days for demo)
        const enhancementTime = localStorage.getItem(`${enhancementKey}_time`);
        if (enhancementTime) {
          const daysDiff = (Date.now() - parseInt(enhancementTime)) / (1000 * 60 * 60 * 24);
          return daysDiff < 7; // Re-enhance weekly to keep demo fresh
        }
      }
      
      return false;
    } catch (error) {
      console.warn('Could not check demo enhancement status:', error);
      return false;
    }
  }

  /**
   * Mark demo data as enhanced with version control
   */
  static async markDemoDataAsEnhanced(): Promise<void> {
    const enhancementKey = `demo_data_enhanced_v2_${this.DEMO_ORG_ID}`;
    localStorage.setItem(enhancementKey, 'true');
    localStorage.setItem(`${enhancementKey}_time`, Date.now().toString());
  }

  /**
   * Clear enhancement flag to force re-enhancement
   */
  static clearEnhancementFlag(): void {
    const enhancementKey = `demo_data_enhanced_v2_${this.DEMO_ORG_ID}`;
    localStorage.removeItem(enhancementKey);
    localStorage.removeItem(`${enhancementKey}_time`);
    console.log('🧹 Cleared demo enhancement flag');
  }

  /**
   * Optimized enhancement using batch operations
   * This is 10-20x faster than individual updates
   */
  static async enhanceDemoDataOptimized(): Promise<void> {
    console.log('🚀 Starting optimized demo data enhancement...');
    const startTime = performance.now();

    try {
      // Check if already enhanced
      if (await this.isDemoDataEnhanced()) {
        console.log('✅ Demo data already enhanced (cached)');
        return;
      }

      // Get all requirements in one query
      const { data: requirements, error: fetchError } = await supabase
        .from('organization_requirements')
        .select('id, requirement_id, status')
        .eq('organization_id', this.DEMO_ORG_ID);

      if (fetchError) throw fetchError;
      if (!requirements || requirements.length === 0) {
        console.log('No requirements found for demo org');
        return;
      }

      console.log(`Found ${requirements.length} requirements to enhance`);

      // Calculate distribution (67% fulfilled as requested)
      const total = requirements.length;
      const fulfilledCount = Math.floor(total * 0.67);
      const remainingCount = total - fulfilledCount;
      const partiallyCount = Math.floor(remainingCount * 0.5);
      const notFulfilledCount = remainingCount - partiallyCount;

      // Shuffle for random distribution
      const shuffled = [...requirements].sort(() => Math.random() - 0.5);

      // Prepare batch updates
      const updates = [];
      let index = 0;

      // Fulfilled (67%)
      for (let i = 0; i < fulfilledCount; i++) {
        updates.push({
          id: shuffled[index].id,
          status: 'fulfilled',
          fulfillment_percentage: 100,
          notes: 'Fully implemented - demo data',
          updated_at: new Date().toISOString()
        });
        index++;
      }

      // Partially fulfilled
      for (let i = 0; i < partiallyCount; i++) {
        updates.push({
          id: shuffled[index].id,
          status: 'partially-fulfilled',
          fulfillment_percentage: Math.floor(Math.random() * 60) + 20,
          notes: 'Implementation in progress - demo data',
          updated_at: new Date().toISOString()
        });
        index++;
      }

      // Not fulfilled
      for (let i = index; i < total; i++) {
        updates.push({
          id: shuffled[i].id,
          status: 'not-fulfilled',
          fulfillment_percentage: 0,
          notes: 'Pending implementation - demo data',
          updated_at: new Date().toISOString()
        });
      }

      // Apply updates in efficient batches
      console.log(`Applying ${updates.length} updates in batches of ${this.BATCH_SIZE}...`);
      
      for (let i = 0; i < updates.length; i += this.BATCH_SIZE) {
        const batch = updates.slice(i, i + this.BATCH_SIZE);
        
        // Use upsert for batch operations (much faster than individual updates)
        const { error: batchError } = await supabase
          .from('organization_requirements')
          .upsert(batch, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          });

        if (batchError) {
          console.error(`Batch update error:`, batchError);
          throw batchError;
        }

        // Progress indicator
        const progress = Math.min(100, Math.round(((i + batch.length) / updates.length) * 100));
        console.log(`Progress: ${progress}%`);
      }

      // Mark as enhanced
      await this.markDemoDataAsEnhanced();

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      console.log(`✅ Demo data enhanced in ${duration}ms (${Math.round(duration/1000)}s)`);

      // Log statistics
      const stats = {
        total: total,
        fulfilled: fulfilledCount,
        partiallyFulfilled: partiallyCount,
        notFulfilled: notFulfilledCount,
        duration: `${duration}ms`
      };
      console.log('📊 Enhancement statistics:', stats);

    } catch (error) {
      console.error('❌ Error in optimized enhancement:', error);
      throw error;
    }
  }

  /**
   * Pre-warm the demo data during app initialization (not during login)
   * This runs in the background without blocking the UI
   */
  static async prewarmDemoData(): Promise<void> {
    // Run in background with a slight delay
    setTimeout(async () => {
      try {
        console.log('🔥 Pre-warming demo data in background...');
        await this.enhanceDemoDataOptimized();
      } catch (error) {
        console.error('Pre-warm error (non-blocking):', error);
      }
    }, 2000); // 2 second delay to not interfere with initial load
  }

  /**
   * Get demo data statistics without modifying data
   */
  static async getDemoDataStatistics(): Promise<any> {
    try {
      const { data: stats, error } = await supabase
        .from('organization_requirements')
        .select('status')
        .eq('organization_id', this.DEMO_ORG_ID);

      if (error) throw error;
      if (!stats) return null;

      const total = stats.length;
      const fulfilled = stats.filter(r => r.status === 'fulfilled').length;
      const partiallyFulfilled = stats.filter(r => r.status === 'partially-fulfilled').length;
      const notFulfilled = stats.filter(r => r.status === 'not-fulfilled').length;
      const notApplicable = stats.filter(r => r.status === 'not-applicable').length;

      return {
        totalRequirements: total,
        fulfilled,
        partiallyFulfilled,
        notFulfilled,
        notApplicable,
        percentages: {
          fulfilled: Math.round((fulfilled / total) * 100),
          partiallyFulfilled: Math.round((partiallyFulfilled / total) * 100),
          notFulfilled: Math.round((notFulfilled / total) * 100),
          notApplicable: Math.round((notApplicable / total) * 100)
        }
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return null;
    }
  }
}

// Export for easy migration
export default OptimizedDemoDataService;