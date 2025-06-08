import { useState, useEffect } from 'react';
import { cybersecurityNewsService, NewsResponse } from '@/services/news/CybersecurityNewsService';

export const useNews = () => {
  const [news, setNews] = useState<NewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const newsData = await cybersecurityNewsService.getNews();
      setNews(newsData);
    } catch (err) {
      console.error('Error loading news:', err);
      setError('Failed to load cybersecurity news');
    } finally {
      setLoading(false);
    }
  };

  const refreshNews = () => {
    cybersecurityNewsService.clearCache();
    loadNews();
  };

  const getRelativeTime = (dateString: string) => {
    return cybersecurityNewsService.getRelativeTime(dateString);
  };

  const getCategoryColor = (category: string) => {
    return cybersecurityNewsService.getCategoryColor(category);
  };

  return {
    news,
    loading,
    error,
    refreshNews,
    getRelativeTime,
    getCategoryColor
  };
};