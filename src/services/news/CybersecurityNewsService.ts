interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  imageUrl?: string;
  category?: string;
}

interface NewsResponse {
  items: NewsItem[];
  lastUpdated: string;
}

class CybersecurityNewsService {
  private readonly CACHE_KEY = 'cybersecurity_news_cache';
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly FETCH_TIMEOUT = 3000; // 3 seconds timeout for RSS feeds
  
  // RSS Feed URLs for cybersecurity news
  private readonly RSS_FEEDS = [
    'https://feeds.feedburner.com/TheHackersNews',
    'https://www.bleepingcomputer.com/feed/',
    'https://www.cshub.com/rss/news-trends',
    'https://krebsonsecurity.com/feed/',
    'https://www.darkreading.com/rss.xml'
  ];
  
  private readonly CORS_PROXY = 'https://api.allorigins.win/get?url=';

  /**
   * Get latest cybersecurity news from multiple sources
   */
  async getNews(): Promise<NewsResponse> {
    try {
      // Check cache first
      const cached = this.getCachedNews();
      if (cached && this.isCacheValid(cached.lastUpdated)) {
        return cached;
      }

      // Try to fetch from real RSS feeds
      const liveNews = await this.fetchLiveNews();
      if (liveNews && liveNews.items.length > 0) {
        // Cache the result
        this.cacheNews(liveNews);
        return liveNews;
      }
      
      // Fallback to demo data if live feeds fail
      const demoNews = this.getDemoNews();
      this.cacheNews(demoNews);
      return demoNews;
    } catch (error) {
      console.error('Error fetching cybersecurity news:', error);
      
      // Return cached data if available, otherwise demo data
      const cached = this.getCachedNews();
      return cached || this.getDemoNews();
    }
  }

  /**
   * Get demo news data (realistic cybersecurity news)
   */
  private getDemoNews(): NewsResponse {
    const currentDate = new Date();
    
    return {
      items: this.getAllNewsItems().slice(0, 8), // Return top 8 items
      lastUpdated: currentDate.toISOString()
    };
  }

  /**
   * Fetch live news from RSS feeds
   */
  private async fetchLiveNews(): Promise<NewsResponse | null> {
    try {
      // Set up fetch with timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.FETCH_TIMEOUT);
      
      // Try The Hacker News RSS feed first (best cybersecurity source)
      const response = await fetch(
        `${this.CORS_PROXY}${encodeURIComponent('https://feeds.feedburner.com/TheHackersNews')}`,
        {
          headers: {
            'Accept': 'application/json'
          },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const xmlContent = data.contents;
      
      if (!xmlContent) {
        throw new Error('No XML content received');
      }
      
      // Parse the RSS XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
      
      // Check for parsing errors
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        throw new Error('XML parsing error');
      }
      
      const items = xmlDoc.querySelectorAll('item');
      const newsItems: NewsItem[] = [];
      
      items.forEach((item, index) => {
        const title = item.querySelector('title')?.textContent?.trim();
        const description = item.querySelector('description')?.textContent?.trim();
        const link = item.querySelector('link')?.textContent?.trim();
        const pubDate = item.querySelector('pubDate')?.textContent?.trim();
        
        // Look for images in various RSS formats
        let imageUrl = '';
        
        // Check for media:thumbnail (common in RSS feeds)
        const mediaThumbnail = item.querySelector('media\\:thumbnail, thumbnail');
        if (mediaThumbnail) {
          imageUrl = mediaThumbnail.getAttribute('url') || '';
        }
        
        // Check for enclosure (media files)
        if (!imageUrl) {
          const enclosure = item.querySelector('enclosure');
          if (enclosure && enclosure.getAttribute('type')?.startsWith('image/')) {
            imageUrl = enclosure.getAttribute('url') || '';
          }
        }
        
        // Check for content:encoded and extract first image
        if (!imageUrl) {
          const contentEncoded = item.querySelector('content\\:encoded, encoded')?.textContent;
          if (contentEncoded) {
            const imgMatch = contentEncoded.match(/<img[^>]+src=[\"']([^\"']+)[\"'][^>]*>/i);
            if (imgMatch) {
              imageUrl = imgMatch[1];
            }
          }
        }
        
        // Check description for images as last resort
        if (!imageUrl && description) {
          const imgMatch = description.match(/<img[^>]+src=[\"']([^\"']+)[\"'][^>]*>/i);
          if (imgMatch) {
            imageUrl = imgMatch[1];
          }
        }
        
        if (title && description && link) {
          newsItems.push({
            id: `live-${index + 1}`,
            title: this.cleanText(title),
            description: this.cleanText(description),
            url: link,
            publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            source: 'The Hacker News',
            category: this.categorizeNews(title + ' ' + description),
            imageUrl: imageUrl || undefined
          });
        }
      });
      
      if (newsItems.length === 0) {
        return null; // No news items found, fallback to demo
      }
      
      return {
        items: newsItems.slice(0, 12), // Limit to 12 items
        lastUpdated: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error fetching live RSS feed (falling back to demo data):', error);
      return null; // Fallback to demo data
    }
  }
  
  /**
   * Clean text content from RSS feeds
   */
  private cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&[^;]+;/g, ' ') // Remove HTML entities
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
  
  /**
   * Categorize news based on content
   */
  private categorizeNews(content: string): string {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('vulnerability') || lowerContent.includes('exploit') || lowerContent.includes('cve')) {
      return 'Vulnerability';
    }
    if (lowerContent.includes('ransomware') || lowerContent.includes('malware') || lowerContent.includes('attack')) {
      return 'Threat Alert';
    }
    if (lowerContent.includes('framework') || lowerContent.includes('standard') || lowerContent.includes('compliance')) {
      return 'Framework';
    }
    if (lowerContent.includes('regulation') || lowerContent.includes('policy') || lowerContent.includes('law')) {
      return 'Regulation';
    }
    if (lowerContent.includes('ai') || lowerContent.includes('machine learning') || lowerContent.includes('innovation')) {
      return 'Innovation';
    }
    
    return 'News';
  }

  /**
   * Get all news items (for search functionality)
   */
  async getAllNews(): Promise<NewsResponse> {
    try {
      // Check cache first
      const cached = this.getCachedNews();
      if (cached && this.isCacheValid(cached.lastUpdated)) {
        return cached;
      }

      // Try to get live news first
      const liveNews = await this.fetchLiveNews();
      if (liveNews && liveNews.items.length > 0) {
        this.cacheNews(liveNews);
        return liveNews;
      }
      
      // Fallback to demo data
      const allNewsData = {
        items: this.getAllNewsItems(),
        lastUpdated: new Date().toISOString()
      };
      
      this.cacheNews(allNewsData);
      return allNewsData;
    } catch (error) {
      console.error('Error fetching all cybersecurity news:', error);
      
      // Return cached data if available, otherwise all demo data
      const cached = this.getCachedNews();
      return cached || {
        items: this.getAllNewsItems(),
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Get all available news items
   */
  private getAllNewsItems(): NewsItem[] {
    const currentDate = new Date();
    
    return [
      {
        id: '1',
        title: 'Critical Vulnerability Discovered in OpenSSL Library',
        description: 'Security researchers have identified a high-severity vulnerability affecting OpenSSL versions 3.0.0 through 3.0.7, potentially allowing remote code execution.',
        url: 'https://openssl.org/news/secadv/',
        publishedAt: new Date(currentDate.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        source: 'OpenSSL Security Advisory',
        category: 'Vulnerability',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=200&fit=crop'
      },
      {
        id: '2',
        title: 'NIST Releases Updated Cybersecurity Framework 2.0',
        description: 'The National Institute of Standards and Technology has published version 2.0 of its Cybersecurity Framework, incorporating lessons learned and emerging threats.',
        url: 'https://www.nist.gov/cyberframework',
        publishedAt: new Date(currentDate.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        source: 'NIST',
        category: 'Framework',
        imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=200&fit=crop'
      },
      {
        id: '3',
        title: 'New Ransomware Campaign Targets Healthcare Organizations',
        description: 'Cybersecurity firms report a sophisticated ransomware campaign specifically targeting healthcare providers, exploiting vulnerabilities in medical device management systems.',
        url: 'https://www.cisa.gov/healthcare-cybersecurity',
        publishedAt: new Date(currentDate.getTime() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        source: 'CISA',
        category: 'Threat Alert',
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=200&fit=crop'
      },
      {
        id: '4',
        title: 'EU Strengthens Cyber Resilience Act Requirements',
        description: 'The European Union has finalized additional requirements for the Cyber Resilience Act, affecting IoT devices and connected products sold in EU markets.',
        url: 'https://ec.europa.eu/digital-single-market/cyber-resilience-act',
        publishedAt: new Date(currentDate.getTime() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
        source: 'European Commission',
        category: 'Regulation',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop'
      },
      {
        id: '5',
        title: 'Zero-Day Exploit Found in Popular VPN Software',
        description: 'A critical zero-day vulnerability has been discovered in a widely-used enterprise VPN solution, with patches being rapidly deployed by vendors.',
        url: 'https://nvd.nist.gov/',
        publishedAt: new Date(currentDate.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        source: 'CVE Database',
        category: 'Zero-Day',
        imageUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400&h=200&fit=crop'
      },
      {
        id: '6',
        title: 'AI-Powered Threat Detection Shows Promise in Enterprise Tests',
        description: 'New artificial intelligence-based cybersecurity tools demonstrate significant improvements in threat detection speed and accuracy during enterprise pilot programs.',
        url: 'https://www.cyber.gov.au/',
        publishedAt: new Date(currentDate.getTime() - 36 * 60 * 60 * 1000).toISOString(), // 1.5 days ago
        source: 'Cybersecurity Research',
        category: 'Innovation',
        imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop'
      },
      {
        id: '7',
        title: 'Supply Chain Attack Affects Major Software Registry',
        description: 'Investigators report a sophisticated supply chain compromise affecting multiple software packages in a popular registry, prompting security reviews.',
        url: 'https://www.enisa.europa.eu/',
        publishedAt: new Date(currentDate.getTime() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
        source: 'ENISA',
        category: 'Supply Chain',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop'
      },
      // Additional news items for pagination
      {
        id: '8',
        title: 'Microsoft Patches Critical Exchange Server Vulnerabilities',
        description: 'Microsoft has released urgent security updates addressing multiple critical vulnerabilities in Exchange Server that could allow remote code execution.',
        url: 'https://msrc.microsoft.com/',
        publishedAt: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        source: 'Microsoft Security',
        category: 'Vulnerability',
        imageUrl: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=400&h=200&fit=crop'
      },
      {
        id: '9',
        title: 'CISA Issues Emergency Directive on Federal Network Security',
        description: 'The Cybersecurity and Infrastructure Security Agency has issued an emergency directive requiring immediate action to secure federal networks against ongoing threats.',
        url: 'https://www.cisa.gov/emergency-directive',
        publishedAt: new Date(currentDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        source: 'CISA',
        category: 'Directive',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop'
      },
      {
        id: '10',
        title: 'Global Banking Trojan Campaign Detected',
        description: 'Cybersecurity researchers have discovered a sophisticated banking trojan campaign targeting financial institutions across multiple countries.',
        url: 'https://www.europol.europa.eu/',
        publishedAt: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        source: 'Europol',
        category: 'Threat Alert',
        imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop'
      },
      {
        id: '11',
        title: 'New ISO 27001:2022 Implementation Guide Released',
        description: 'The International Organization for Standardization has published a comprehensive implementation guide for the updated ISO 27001:2022 standard.',
        url: 'https://www.iso.org/standard/27001',
        publishedAt: new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
        source: 'ISO',
        category: 'Framework',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop'
      },
      {
        id: '12',
        title: 'Quantum Computing Threat to Current Encryption Methods',
        description: 'Security experts warn about the growing threat of quantum computing to current encryption standards and the need for quantum-resistant cryptography.',
        url: 'https://quantum.gov/',
        publishedAt: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        source: 'National Quantum Initiative',
        category: 'Innovation',
        imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop'
      }
    ];
  }

  /**
   * Cache news data in localStorage
   */
  private cacheNews(newsData: NewsResponse): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(newsData));
    } catch (error) {
      console.error('Error caching news data:', error);
    }
  }

  /**
   * Get cached news data
   */
  private getCachedNews(): NewsResponse | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error reading cached news data:', error);
      return null;
    }
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(lastUpdated: string): boolean {
    const cacheTime = new Date(lastUpdated).getTime();
    const now = Date.now();
    return (now - cacheTime) < this.CACHE_DURATION;
  }

  /**
   * Get exact date and time string (e.g., "Jan 8, 7:32 PM")
   */
  getExactDateTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    
    // If it's today, show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
    
    // If it's this year, show month/day and time
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Get category color for styling
   */
  getCategoryColor(category: string): string {
    switch (category?.toLowerCase()) {
      case 'vulnerability':
      case 'zero-day':
      case 'threat alert':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'framework':
      case 'regulation':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'innovation':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'supply chain':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'directive':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'news':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  /**
   * Clear cached news data
   */
  clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
    } catch (error) {
      console.error('Error clearing news cache:', error);
    }
  }
}

export const cybersecurityNewsService = new CybersecurityNewsService();
export default CybersecurityNewsService;
export type { NewsItem, NewsResponse };