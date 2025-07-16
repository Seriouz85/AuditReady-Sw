import { toast } from '@/utils/toast';

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  downloadUrl?: string;
  source: 'unsplash' | 'pexels' | 'pixabay' | 'coverr' | 'freesound' | 'local';
  license: string;
  licenseUrl?: string;
  author: string;
  authorUrl?: string;
  tags: string[];
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number;
  fileSize?: number;
  createdAt: string;
  category?: string;
}

export interface SearchOptions {
  query: string;
  type?: 'image' | 'video' | 'audio' | 'all';
  category?: string;
  orientation?: 'horizontal' | 'vertical' | 'square';
  color?: string;
  page?: number;
  perPage?: number;
}

class UnifiedMediaLibraryService {
  private readonly UNSPLASH_ACCESS_KEY = 'your-unsplash-access-key'; // Replace with actual key
  private readonly PEXELS_API_KEY = 'your-pexels-api-key'; // Replace with actual key
  private readonly PIXABAY_API_KEY = 'your-pixabay-api-key'; // Replace with actual key

  // Unsplash integration
  async searchUnsplash(options: SearchOptions): Promise<MediaItem[]> {
    try {
      const { query, page = 1, perPage = 20, orientation, color } = options;
      
      // For demo purposes, return mock data
      // In production, replace with actual API call
      const mockResults: MediaItem[] = [
        {
          id: 'unsplash-1',
          type: 'image',
          title: 'Cybersecurity Team Meeting',
          description: 'Professional team discussing cybersecurity strategies',
          url: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800',
          thumbnailUrl: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=300&h=200&fit=crop',
          previewUrl: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=600',
          downloadUrl: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=1920',
          source: 'unsplash',
          license: 'Unsplash License',
          licenseUrl: 'https://unsplash.com/license',
          author: 'Austin Distel',
          authorUrl: 'https://unsplash.com/@austindistel',
          tags: ['business', 'team', 'meeting', 'cybersecurity'],
          dimensions: { width: 1920, height: 1280 },
          createdAt: new Date().toISOString(),
          category: 'business'
        },
        {
          id: 'unsplash-2',
          type: 'image',
          title: 'Digital Security Concept',
          description: 'Abstract digital security and technology background',
          url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
          thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&h=200&fit=crop',
          previewUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600',
          downloadUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920',
          source: 'unsplash',
          license: 'Unsplash License',
          licenseUrl: 'https://unsplash.com/license',
          author: 'FLY:D',
          authorUrl: 'https://unsplash.com/@flyd2069',
          tags: ['technology', 'security', 'digital', 'abstract'],
          dimensions: { width: 1920, height: 1280 },
          createdAt: new Date().toISOString(),
          category: 'technology'
        }
      ];

      // Actual API call would be:
      /*
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=${orientation || ''}&color=${color || ''}`,
        {
          headers: {
            'Authorization': `Client-ID ${this.UNSPLASH_ACCESS_KEY}`
          }
        }
      );
      const data = await response.json();
      return data.results.map(this.mapUnsplashResult);
      */

      return mockResults.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    } catch (error) {
      console.error('Error searching Unsplash:', error);
      toast.error('Failed to search Unsplash');
      return [];
    }
  }

  // Pexels integration
  async searchPexels(options: SearchOptions): Promise<MediaItem[]> {
    try {
      const { query, page = 1, perPage = 20, orientation } = options;
      
      // Mock data for demo
      const mockResults: MediaItem[] = [
        {
          id: 'pexels-1',
          type: 'image',
          title: 'Data Protection Concept',
          description: 'Hands protecting digital data visualization',
          url: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800',
          thumbnailUrl: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
          previewUrl: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=600',
          downloadUrl: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=1920',
          source: 'pexels',
          license: 'Pexels License',
          licenseUrl: 'https://www.pexels.com/license/',
          author: 'Pixabay',
          authorUrl: 'https://www.pexels.com/@pixabay',
          tags: ['security', 'protection', 'data', 'digital'],
          dimensions: { width: 1920, height: 1280 },
          createdAt: new Date().toISOString(),
          category: 'technology'
        }
      ];

      return mockResults.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    } catch (error) {
      console.error('Error searching Pexels:', error);
      toast.error('Failed to search Pexels');
      return [];
    }
  }

  // Pixabay integration
  async searchPixabay(options: SearchOptions): Promise<MediaItem[]> {
    try {
      const { query, type = 'image', page = 1, perPage = 20 } = options;
      
      // Mock data for demo
      const mockResults: MediaItem[] = [
        {
          id: 'pixabay-1',
          type: 'image',
          title: 'Network Security',
          description: 'Digital network security illustration',
          url: 'https://cdn.pixabay.com/photo/2018/05/14/16/25/cyber-security-3400555_960_720.jpg',
          thumbnailUrl: 'https://cdn.pixabay.com/photo/2018/05/14/16/25/cyber-security-3400555_150.jpg',
          previewUrl: 'https://cdn.pixabay.com/photo/2018/05/14/16/25/cyber-security-3400555_640.jpg',
          downloadUrl: 'https://cdn.pixabay.com/photo/2018/05/14/16/25/cyber-security-3400555_1280.jpg',
          source: 'pixabay',
          license: 'Pixabay License',
          licenseUrl: 'https://pixabay.com/service/license/',
          author: 'TheDigitalArtist',
          authorUrl: 'https://pixabay.com/users/thedigitalartist-202249/',
          tags: ['cyber', 'security', 'network', 'digital'],
          dimensions: { width: 1280, height: 853 },
          createdAt: new Date().toISOString(),
          category: 'technology'
        }
      ];

      if (type === 'video') {
        mockResults.push({
          id: 'pixabay-video-1',
          type: 'video',
          title: 'Digital Data Flow',
          description: 'Animated digital data flow visualization',
          url: 'https://cdn.pixabay.com/vimeo/488277580/digital-42778.mp4?width=1920&hash=d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5',
          thumbnailUrl: 'https://cdn.pixabay.com/vimeo/488277580/digital-42778.jpg?width=300&height=200',
          previewUrl: 'https://cdn.pixabay.com/vimeo/488277580/digital-42778.mp4?width=640&hash=d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5',
          downloadUrl: 'https://cdn.pixabay.com/vimeo/488277580/digital-42778.mp4?width=1920&hash=d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5',
          source: 'pixabay',
          license: 'Pixabay License',
          licenseUrl: 'https://pixabay.com/service/license/',
          author: 'TheDigitalArtist',
          authorUrl: 'https://pixabay.com/users/thedigitalartist-202249/',
          tags: ['data', 'flow', 'digital', 'animation'],
          dimensions: { width: 1920, height: 1080 },
          duration: 15,
          createdAt: new Date().toISOString(),
          category: 'technology'
        });
      }

      return mockResults.filter(item => 
        item.type === type &&
        (item.title.toLowerCase().includes(query.toLowerCase()) ||
         item.description.toLowerCase().includes(query.toLowerCase()) ||
         item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
      );
    } catch (error) {
      console.error('Error searching Pixabay:', error);
      toast.error('Failed to search Pixabay');
      return [];
    }
  }

  // Coverr video integration
  async searchCoverr(options: SearchOptions): Promise<MediaItem[]> {
    try {
      const { query, page = 1, perPage = 20 } = options;
      
      // Mock data for demo
      const mockResults: MediaItem[] = [
        {
          id: 'coverr-1',
          type: 'video',
          title: 'Typing on Computer',
          description: 'Close-up of hands typing on computer keyboard',
          url: 'https://coverr.co/videos/typing-on-computer/download',
          thumbnailUrl: 'https://coverr.co/videos/typing-on-computer/preview',
          previewUrl: 'https://coverr.co/videos/typing-on-computer/preview',
          downloadUrl: 'https://coverr.co/videos/typing-on-computer/download',
          source: 'coverr',
          license: 'CC0 (Creative Commons Zero)',
          licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
          author: 'Coverr',
          authorUrl: 'https://coverr.co',
          tags: ['typing', 'computer', 'keyboard', 'work'],
          dimensions: { width: 1920, height: 1080 },
          duration: 10,
          createdAt: new Date().toISOString(),
          category: 'business'
        }
      ];

      return mockResults.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    } catch (error) {
      console.error('Error searching Coverr:', error);
      toast.error('Failed to search Coverr');
      return [];
    }
  }

  // Unified search across all sources
  async searchAll(options: SearchOptions): Promise<MediaItem[]> {
    try {
      const { type = 'all' } = options;
      
      let results: MediaItem[] = [];
      
      // Search images
      if (type === 'image' || type === 'all') {
        const [unsplashResults, pexelsResults, pixabayResults] = await Promise.all([
          this.searchUnsplash(options),
          this.searchPexels(options),
          this.searchPixabay({ ...options, type: 'image' })
        ]);
        
        results = [...results, ...unsplashResults, ...pexelsResults, ...pixabayResults];
      }
      
      // Search videos
      if (type === 'video' || type === 'all') {
        const [coverrResults, pixabayVideoResults] = await Promise.all([
          this.searchCoverr(options),
          this.searchPixabay({ ...options, type: 'video' })
        ]);
        
        results = [...results, ...coverrResults, ...pixabayVideoResults];
      }
      
      // Remove duplicates and sort by relevance
      const uniqueResults = results.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );
      
      return uniqueResults.sort((a, b) => {
        const aScore = this.calculateRelevanceScore(a, options.query);
        const bScore = this.calculateRelevanceScore(b, options.query);
        return bScore - aScore;
      });
      
    } catch (error) {
      console.error('Error in unified search:', error);
      toast.error('Failed to search media libraries');
      return [];
    }
  }

  private calculateRelevanceScore(item: MediaItem, query: string): number {
    const queryLower = query.toLowerCase();
    let score = 0;
    
    // Title matches get highest score
    if (item.title.toLowerCase().includes(queryLower)) {
      score += 10;
    }
    
    // Description matches get medium score
    if (item.description.toLowerCase().includes(queryLower)) {
      score += 5;
    }
    
    // Tag matches get lower score
    item.tags.forEach(tag => {
      if (tag.toLowerCase().includes(queryLower)) {
        score += 2;
      }
    });
    
    return score;
  }

  // Get popular/trending content
  async getTrending(type: 'image' | 'video' | 'all' = 'all'): Promise<MediaItem[]> {
    // Mock trending content
    const trendingContent: MediaItem[] = [
      {
        id: 'trending-1',
        type: 'image',
        title: 'Modern Office Space',
        description: 'Clean, modern office workspace with computers',
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop',
        previewUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
        downloadUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920',
        source: 'unsplash',
        license: 'Unsplash License',
        licenseUrl: 'https://unsplash.com/license',
        author: 'Unsplash',
        authorUrl: 'https://unsplash.com',
        tags: ['office', 'workspace', 'modern', 'business'],
        dimensions: { width: 1920, height: 1280 },
        createdAt: new Date().toISOString(),
        category: 'business'
      }
    ];

    return trendingContent.filter(item => type === 'all' || item.type === type);
  }

  // Get content by category
  async getByCategory(category: string, type: 'image' | 'video' | 'all' = 'all'): Promise<MediaItem[]> {
    return this.searchAll({ query: category, type });
  }

  // Download media item
  async downloadMedia(item: MediaItem): Promise<Blob | null> {
    try {
      const response = await fetch(item.downloadUrl || item.url);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error downloading media:', error);
      toast.error('Failed to download media');
      return null;
    }
  }

  // Get media info
  async getMediaInfo(item: MediaItem): Promise<MediaItem> {
    // Return the item with full details
    return item;
  }
}

export const unifiedMediaLibraryService = new UnifiedMediaLibraryService();