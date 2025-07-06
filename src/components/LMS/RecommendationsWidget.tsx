import React from 'react';
import { DashboardWidget } from './DashboardWidget';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Sparkles, 
  Clock, 
  Star, 
  TrendingUp, 
  Users,
  ArrowRight,
  Lightbulb,
  Target,
  BookOpen,
  Play
} from 'lucide-react';

interface Recommendation {
  id: string;
  type: 'course' | 'skill' | 'certification' | 'trending';
  title: string;
  description: string;
  reason: string;
  duration?: number;
  rating?: number;
  enrolledCount?: number;
  thumbnailUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  urgent?: boolean;
}

interface RecommendationsWidgetProps {
  recommendations: Recommendation[];
  isExpanded?: boolean;
  onExpand?: () => void;
  onViewRecommendation?: (id: string) => void;
  onRefresh?: () => void;
  className?: string;
}

export const RecommendationsWidget: React.FC<RecommendationsWidgetProps> = ({
  recommendations,
  isExpanded = false,
  onExpand,
  onViewRecommendation,
  onRefresh,
  className = ''
}) => {
  const getTypeIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'course': return BookOpen;
      case 'skill': return Target;
      case 'certification': return Star;
      case 'trending': return TrendingUp;
      default: return Lightbulb;
    }
  };

  const getTypeColor = (type: Recommendation['type']) => {
    switch (type) {
      case 'course': return 'bg-blue-100 text-blue-800';
      case 'skill': return 'bg-green-100 text-green-800';
      case 'certification': return 'bg-purple-100 text-purple-800';
      case 'trending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const displayedRecommendations = isExpanded ? recommendations : recommendations.slice(0, 3);

  return (
    <DashboardWidget
      id="recommendations-widget"
      title="AI Recommendations"
      subtitle="Personalized learning paths just for you"
      icon={<Sparkles className="h-5 w-5 text-white" />}
      isExpanded={isExpanded}
      onExpand={onExpand}
      onRefresh={onRefresh}
      canExpand
      canRefresh
      className={className}
    >
      <div className="space-y-4">
        {displayedRecommendations.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
            <p className="text-gray-500 text-sm">
              Complete a few courses to get personalized recommendations
            </p>
          </div>
        ) : (
          <>
            {displayedRecommendations.map((recommendation) => {
              const TypeIcon = getTypeIcon(recommendation.type);
              return (
                <div
                  key={recommendation.id}
                  className="group p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 hover:border-blue-300"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail or Icon */}
                    <div className="flex-shrink-0">
                      {recommendation.thumbnailUrl ? (
                        <img
                          src={recommendation.thumbnailUrl}
                          alt={recommendation.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <TypeIcon className="h-8 w-8 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 line-clamp-1">
                          {recommendation.title}
                        </h4>
                        {recommendation.urgent && (
                          <Badge className="bg-red-500 hover:bg-red-600 text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {recommendation.description}
                      </p>

                      {/* AI Reason */}
                      <div className="flex items-start gap-2 mb-3 p-2 bg-blue-50 rounded-md">
                        <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800 leading-relaxed">
                          {recommendation.reason}
                        </p>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-3 mb-3 text-sm text-gray-500">
                        {recommendation.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(recommendation.duration)}
                          </div>
                        )}
                        {recommendation.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current text-yellow-500" />
                            {recommendation.rating.toFixed(1)}
                          </div>
                        )}
                        {recommendation.enrolledCount && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {recommendation.enrolledCount}
                          </div>
                        )}
                      </div>

                      {/* Tags and Badges */}
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={getTypeColor(recommendation.type)}>
                          {recommendation.type}
                        </Badge>
                        <Badge className={getDifficultyColor(recommendation.difficulty)}>
                          {recommendation.difficulty}
                        </Badge>
                        {recommendation.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Action Button */}
                      <Button
                        size="sm"
                        onClick={() => onViewRecommendation?.(recommendation.id)}
                        className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Play className="mr-2 h-3 w-3" />
                        Start Learning
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* View More Button */}
            {!isExpanded && recommendations.length > 3 && (
              <Button 
                variant="outline" 
                onClick={onExpand}
                className="w-full"
              >
                View {recommendations.length - 3} More Recommendations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </div>
    </DashboardWidget>
  );
};