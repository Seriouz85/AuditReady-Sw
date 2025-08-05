// Media item interface
export interface MediaItem {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video' | 'document' | 'audio';
  size: number;
  format: string;
  dimensions?: { width: number; height: number };
  duration?: number; // for videos/audio in seconds
  category: string;
  tags: string[];
  uploadedAt: string;
  description?: string;
  isStock: boolean; // Whether it's from stock library or user uploaded
  metadata?: Record<string, any>;
}

// Media collection from various sources
export interface MediaCollection {
  id: string;
  name: string;
  description: string;
  items: MediaItem[];
  source: 'user' | 'stock' | 'unsplash' | 'pexels' | 'pixabay';
  thumbnailUrl?: string;
  itemCount: number;
}

// Stock media provider configuration
export interface StockMediaProvider {
  id: string;
  name: string;
  apiKey?: string;
  baseUrl: string;
  searchEndpoint: string;
  rateLimit: {
    requestsPerHour: number;
    requestsPerDay: number;
  };
  categories: string[];
  supportedTypes: ('image' | 'video' | 'document' | 'audio')[];
}

// Search filters
export interface MediaSearchFilters {
  query?: string;
  category?: string;
  type?: 'image' | 'video' | 'document' | 'audio';
  tags?: string[];
  minSize?: number;
  maxSize?: number;
  minDimensions?: { width: number; height: number };
  maxDimensions?: { width: number; height: number };
  dateRange?: {
    from: string;
    to: string;
  };
  source?: 'user' | 'stock' | 'all';
}

// Upload progress tracking
export interface UploadProgress {
  id: string;
  file: File;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  url?: string;
  thumbnailUrl?: string;
  error?: string;
}

// Media selector configuration
export interface MediaSelectorConfig {
  allowMultiple: boolean;
  maxSelections: number;
  allowedTypes: ('image' | 'video' | 'document' | 'audio')[];
  maxFileSize: number; // in bytes
  allowedFormats: string[];
  enableUpload: boolean;
  enableStockMedia: boolean;
  stockProviders: string[];
  uploadPath: string;
  generateThumbnails: boolean;
  compressionQuality: number;
}

// Media optimization settings
export interface MediaOptimizationSettings {
  images: {
    maxWidth: number;
    maxHeight: number;
    quality: number;
    formats: ('webp' | 'avif' | 'jpeg' | 'png')[];
    generateSizes: number[];
  };
  videos: {
    maxDuration: number;
    maxSize: number;
    formats: ('mp4' | 'webm' | 'avi')[];
    generateThumbnails: boolean;
    thumbnailInterval: number; // seconds
  };
}

// Analytics tracking
export interface MediaUsageAnalytics {
  itemId: string;
  action: 'view' | 'select' | 'download' | 'share';
  userId: string;
  timestamp: string;
  context: {
    courseId?: string;
    lessonId?: string;
    searchQuery?: string;
    category?: string;
  };
}

// Media library service response types
export interface MediaLibraryResponse<T = MediaItem[]> {
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: MediaSearchFilters;
  suggestions?: string[];
}

// Error types
export interface MediaError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

// Cache configuration
export interface MediaCacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache size in MB
  strategy: 'lru' | 'fifo' | 'lfu';
}

// Preview modal props
export interface MediaPreviewProps {
  media: MediaItem;
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (media: MediaItem) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showActions?: boolean;
}