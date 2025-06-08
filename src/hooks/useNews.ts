import { useState, useEffect } from 'react';
import { cybersecurityNewsService, NewsResponse } from '@/services/news/CybersecurityNewsService';

export const useNews = () => {
  const [news, setNews] = useState<NewsResponse | null>(null);
  const [allNews, setAllNews] = useState<NewsResponse | null>(null);
  const [displayedCount, setDisplayedCount] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      // Load all news items for searching
      const allNewsData = await cybersecurityNewsService.getAllNews();
      setAllNews(allNewsData);
      // Initially show first 8 items
      setNews({
        ...allNewsData,
        items: allNewsData.items.slice(0, 8)
      });
      setDisplayedCount(8);
      setHasMore(allNewsData.items.length > 8);
    } catch (err) {
      console.error('Error loading news:', err);
      setError('Failed to load cybersecurity news');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreNews = () => {
    if (!allNews || loading || !hasMore) {
      console.log('loadMoreNews blocked:', { hasAllNews: !!allNews, loading, hasMore });
      return;
    }
    
    console.log('Loading more news. Current count:', displayedCount, 'Total available:', allNews.items.length);
    
    const newCount = Math.min(displayedCount + 8, allNews.items.length);
    setNews({
      ...allNews,
      items: allNews.items.slice(0, newCount)
    });
    setDisplayedCount(newCount);
    setHasMore(newCount < allNews.items.length);
    
    console.log('New count:', newCount, 'Has more:', newCount < allNews.items.length);
  };

  const refreshNews = () => {
    cybersecurityNewsService.clearCache();
    setDisplayedCount(8);
    setHasMore(true);
    loadNews();
  };

  const getExactDateTime = (dateString: string) => {
    return cybersecurityNewsService.getExactDateTime(dateString);
  };

  const getCategoryColor = (category: string) => {
    return cybersecurityNewsService.getCategoryColor(category);
  };

  return {
    news,
    loading,
    error,
    refreshNews,
    getExactDateTime,
    getCategoryColor,
    loadMoreNews,
    hasMore
  };
};