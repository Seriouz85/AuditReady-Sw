import { MediaItem, MediaCollection, MediaSearchFilters, MediaLibraryResponse, StockMediaProvider } from '../types';

class MediaSelectorService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Stock media providers configuration
  private stockProviders: StockMediaProvider[] = [
    {
      id: 'unsplash',
      name: 'Unsplash',
      baseUrl: 'https://api.unsplash.com',
      searchEndpoint: '/search/photos',
      rateLimit: {
        requestsPerHour: 50,
        requestsPerDay: 5000
      },
      categories: ['business', 'technology', 'education', 'security', 'people', 'abstract'],
      supportedTypes: ['image']
    }
  ];

  // Built-in stock media collections for immediate availability
  private builtInCollections: MediaCollection[] = [
    {
      id: 'business-professional',
      name: 'Business & Professional',
      description: 'Professional business imagery for corporate training',
      source: 'stock',
      itemCount: 50,
      items: [
        {
          id: 'biz-1',
          name: 'Team Collaboration',
          url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          type: 'image',
          size: 245760,
          format: 'jpg',
          dimensions: { width: 1200, height: 800 },
          category: 'business',
          tags: ['teamwork', 'collaboration', 'meeting', 'office', 'professional'],
          uploadedAt: new Date().toISOString(),
          isStock: true,
          description: 'Professional team working together in modern office environment'
        },
        {
          id: 'biz-2',
          name: 'Digital Transformation',
          url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          type: 'image',
          size: 198543,
          format: 'jpg',
          dimensions: { width: 1200, height: 800 },
          category: 'technology',
          tags: ['digital', 'transformation', 'technology', 'innovation', 'future'],
          uploadedAt: new Date().toISOString(),
          isStock: true,
          description: 'Digital transformation concept with global connectivity'
        },
        {
          id: 'biz-3',
          name: 'Data Analytics Dashboard',
          url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          type: 'image',
          size: 321654,
          format: 'jpg',
          dimensions: { width: 1200, height: 800 },
          category: 'analytics',
          tags: ['data', 'analytics', 'dashboard', 'charts', 'business-intelligence'],
          uploadedAt: new Date().toISOString(),
          isStock: true,
          description: 'Business analytics dashboard with charts and graphs'
        }
      ]
    },
    {
      id: 'cybersecurity',
      name: 'Cybersecurity & Privacy',
      description: 'Security, privacy, and compliance themed imagery',
      source: 'stock',
      itemCount: 30,
      items: [
        {
          id: 'sec-1',
          name: 'Cybersecurity Concept',
          url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          type: 'image',
          size: 198543,
          format: 'jpg',
          dimensions: { width: 1200, height: 800 },
          category: 'security',
          tags: ['cybersecurity', 'protection', 'lock', 'security', 'privacy'],
          uploadedAt: new Date().toISOString(),
          isStock: true,
          description: 'Digital security and protection concept'
        },
        {
          id: 'sec-2',
          name: 'Network Security',
          url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          type: 'image',
          size: 276890,
          format: 'jpg',
          dimensions: { width: 1200, height: 800 },
          category: 'security',
          tags: ['network', 'security', 'servers', 'infrastructure', 'technology'],
          uploadedAt: new Date().toISOString(),
          isStock: true,
          description: 'Network security and server infrastructure'
        },
        {
          id: 'sec-3',
          name: 'Data Protection',
          url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          type: 'image',
          size: 234567,
          format: 'jpg',
          dimensions: { width: 1200, height: 800 },
          category: 'security',
          tags: ['data-protection', 'privacy', 'shield', 'secure', 'confidential'],
          uploadedAt: new Date().toISOString(),
          isStock: true,
          description: 'Data protection and privacy shield concept'
        }
      ]
    },
    {
      id: 'education-training',
      name: 'Education & Training',
      description: 'Educational content and training materials',
      source: 'stock',
      itemCount: 25,
      items: [
        {
          id: 'edu-1',
          name: 'Online Learning',
          url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          type: 'image',
          size: 189432,
          format: 'jpg',
          dimensions: { width: 1200, height: 800 },
          category: 'education',
          tags: ['online-learning', 'education', 'laptop', 'study', 'e-learning'],
          uploadedAt: new Date().toISOString(),
          isStock: true,
          description: 'Online learning and digital education concept'
        },
        {
          id: 'edu-2',
          name: 'Training Session',
          url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          type: 'image',
          size: 245760,
          format: 'jpg',
          dimensions: { width: 1200, height: 800 },
          category: 'education',
          tags: ['training', 'presentation', 'workshop', 'seminar', 'learning'],
          uploadedAt: new Date().toISOString(),
          isStock: true,
          description: 'Professional training session with presenter and audience'
        }
      ]
    }
  ];

  // Cache management
  private setCache(key: string, data: any, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // Get all available media collections
  async getCollections(): Promise<MediaCollection[]> {
    const cacheKey = 'media-collections';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    // In a real implementation, this would fetch from your API
    const collections = [...this.builtInCollections];
    
    this.setCache(cacheKey, collections);
    return collections;
  }

  // Search media items across all collections
  async searchMedia(filters: MediaSearchFilters): Promise<MediaLibraryResponse> {
    const cacheKey = `search-${JSON.stringify(filters)}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const collections = await this.getCollections();
    let allItems: MediaItem[] = [];

    // Flatten all items from collections
    collections.forEach(collection => {
      allItems = allItems.concat(collection.items);
    });

    // Apply filters
    let filteredItems = allItems;

    // Filter by query
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query)) ||
        item.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      filteredItems = filteredItems.filter(item => item.category === filters.category);
    }

    // Filter by type
    if (filters.type) {
      filteredItems = filteredItems.filter(item => item.type === filters.type);
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filteredItems = filteredItems.filter(item =>
        filters.tags!.some(tag => item.tags.includes(tag))
      );
    }

    // Filter by size
    if (filters.minSize) {
      filteredItems = filteredItems.filter(item => item.size >= filters.minSize!);
    }
    if (filters.maxSize) {
      filteredItems = filteredItems.filter(item => item.size <= filters.maxSize!);
    }

    // Filter by source
    if (filters.source && filters.source !== 'all') {
      if (filters.source === 'stock') {
        filteredItems = filteredItems.filter(item => item.isStock);
      } else if (filters.source === 'user') {
        filteredItems = filteredItems.filter(item => !item.isStock);
      }
    }

    const result: MediaLibraryResponse = {
      data: filteredItems,
      pagination: {
        page: 1,
        limit: filteredItems.length,
        total: filteredItems.length,
        hasNext: false,
        hasPrev: false
      },
      filters,
      suggestions: this.generateSearchSuggestions(filteredItems)
    };

    this.setCache(cacheKey, result, 2 * 60 * 1000); // Cache for 2 minutes
    return result;
  }

  // Get categories from available media
  async getCategories(): Promise<string[]> {
    const collections = await this.getCollections();
    const categories = new Set<string>();
    
    collections.forEach(collection => {
      collection.items.forEach(item => {
        categories.add(item.category);
      });
    });

    return Array.from(categories).sort();
  }

  // Get popular tags
  async getPopularTags(limit: number = 20): Promise<string[]> {
    const collections = await this.getCollections();
    const tagCounts = new Map<string, number>();

    collections.forEach(collection => {
      collection.items.forEach(item => {
        item.tags.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      });
    });

    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag]) => tag);
  }

  // Generate search suggestions
  private generateSearchSuggestions(items: MediaItem[]): string[] {
    const suggestions = new Set<string>();
    
    items.forEach(item => {
      // Add category as suggestion
      suggestions.add(item.category);
      
      // Add popular tags as suggestions
      item.tags.forEach(tag => {
        if (tag.length > 2) { // Only suggest meaningful tags
          suggestions.add(tag);
        }
      });
    });

    return Array.from(suggestions).slice(0, 10);
  }

  // Get media item by ID
  async getMediaById(id: string): Promise<MediaItem | null> {
    const collections = await this.getCollections();
    
    for (const collection of collections) {
      const item = collection.items.find(item => item.id === id);
      if (item) return item;
    }
    
    return null;
  }

  // Get similar media items
  async getSimilarMedia(item: MediaItem, limit: number = 5): Promise<MediaItem[]> {
    const allCollections = await this.getCollections();
    let allItems: MediaItem[] = [];
    
    allCollections.forEach(collection => {
      allItems = allItems.concat(collection.items);
    });

    // Filter out the current item
    allItems = allItems.filter(i => i.id !== item.id);

    // Score items based on similarity
    const scoredItems = allItems.map(otherItem => {
      let score = 0;
      
      // Same category gets high score
      if (otherItem.category === item.category) score += 5;
      
      // Common tags get points
      const commonTags = otherItem.tags.filter(tag => item.tags.includes(tag));
      score += commonTags.length * 2;
      
      // Same type gets points
      if (otherItem.type === item.type) score += 3;
      
      return { item: otherItem, score };
    });

    // Sort by score and return top items
    return scoredItems
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(scored => scored.item);
  }

  // Track media usage for analytics
  async trackUsage(itemId: string, action: 'view' | 'select' | 'download', context?: any): Promise<void> {
    // In a real implementation, this would send analytics data to your backend
    console.log('Media usage tracked:', { itemId, action, context, timestamp: new Date().toISOString() });
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const mediaSelectorService = new MediaSelectorService();