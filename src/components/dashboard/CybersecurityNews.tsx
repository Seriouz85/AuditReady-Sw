import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNews } from '@/hooks/useNews';
import { 
  ExternalLink, 
  RefreshCw, 
  AlertTriangle, 
  Shield, 
  Newspaper,
  Clock,
  ChevronRight,
  Loader
} from 'lucide-react';
import { motion } from 'framer-motion';

export const CybersecurityNews = () => {
  const { news, loading, error, refreshNews, getRelativeTime, getCategoryColor } = useNews();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const handleItemClick = (id: string, url: string) => {
    // Toggle expansion for better UX
    setExpandedItem(expandedItem === id ? null : id);
  };

  const handleExternalClick = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleRefresh = () => {
    refreshNews();
  };

  if (error) {
    return (
      <Card className="h-full border border-border/70 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-lg">Cybersecurity News</CardTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border border-border/70 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-100 dark:bg-red-900/50 p-1.5 rounded-lg">
              <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Cybersecurity News</CardTitle>
              <p className="text-xs text-muted-foreground">
                Latest security updates & threats
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {news && !loading && (
              <span className="text-xs text-muted-foreground">
                Updated {getRelativeTime(news.lastUpdated)}
              </span>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading && !news ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading news...</span>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-1 p-4 pt-0">
              {news?.items.slice(0, 8).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    p-3 rounded-lg border border-border/50 cursor-pointer
                    hover:bg-muted/20 dark:hover:bg-slate-800/60 transition-all
                    ${expandedItem === item.id ? 'bg-muted/30' : ''}
                  `}
                  onClick={() => handleItemClick(item.id, item.url)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium line-clamp-2 flex-1 leading-relaxed">
                        {item.title}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 flex-shrink-0"
                        onClick={(e) => handleExternalClick(item.url, e)}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.category && (
                          <Badge 
                            className={`text-xs px-2 py-0.5 ${getCategoryColor(item.category)}`}
                          >
                            {item.category}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {item.source}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {getRelativeTime(item.publishedAt)}
                      </div>
                    </div>

                    {expandedItem === item.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pt-2 border-t border-border/30"
                      >
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                        <div className="flex justify-end mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-xs px-2"
                            onClick={(e) => handleExternalClick(item.url, e)}
                          >
                            Read More
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};